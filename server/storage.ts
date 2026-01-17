import { users, stores, ratings, type User, type InsertUser, type Store, type InsertStore, type Rating, type InsertRating } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, sql, desc, asc } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>; // username is email
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<void>;
  getAllUsers(options?: { search?: string; role?: string; sortBy?: string; order?: string }): Promise<(User & { averageRating?: number })[]>;

  // Stores
  getAllStores(options?: { search?: string; address?: string; sortBy?: string }): Promise<(Store & { averageRating: number })[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  getStoresByOwner(ownerId: number): Promise<Store[]>;

  // Ratings
  createOrUpdateRating(rating: InsertRating): Promise<Rating>;
  getRatingsForStore(storeId: number): Promise<(Rating & { user: User })[]>;
  getUserRatingForStore(userId: number, storeId: number): Promise<Rating | undefined>;

  // Stats
  getAdminStats(): Promise<{ totalUsers: number; totalStores: number; totalRatings: number }>;
  
  // Auth Helpers
  hashPassword(password: string): Promise<string>;
  comparePasswords(supplied: string, stored: string): Promise<boolean>;
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // sessionStore will be initialized in server/index.ts or routes.ts where needed
    // standard memorystore or connect-pg-simple can be used
  }

  async hashPassword(password: string) {
    return hashPassword(password);
  }

  async comparePasswords(supplied: string, stored: string) {
    return comparePasswords(supplied, stored);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id));
  }

  async getAllUsers(options?: { search?: string; role?: string; sortBy?: string; order?: string }): Promise<(User & { averageRating?: number })[]> {
    let query = db.select().from(users).$dynamic();

    const conditions = [];
    if (options?.search) {
      conditions.push(
        sql`(${users.name} ILIKE ${`%${options.search}%`} OR ${users.email} ILIKE ${`%${options.search}%`})`
      );
    }
    if (options?.role && options.role !== 'all') {
      conditions.push(eq(users.role, options.role as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    if (options?.sortBy) {
      const col = options.sortBy === 'email' ? users.email : users.name;
      query = query.orderBy(options.order === 'desc' ? desc(col) : asc(col));
    } else {
      query = query.orderBy(desc(users.createdAt));
    }

    const result = await query.execute();
    return result;
  }

  async getAllStores(options?: { search?: string; address?: string; sortBy?: string }): Promise<(Store & { averageRating: number })[]> {
    // We need to calculate average rating. 
    // Drizzle aggregation can be complex, doing a raw join or separate queries is often easier.
    // Let's do a join with aggregation.
    
    // Note: Drizzle's query builder for aggregation is evolving. 
    // For simplicity/robustness in "lite" mode, let's fetch stores then attach ratings or use a raw SQL view if needed.
    // Given the constraints, let's fetch all stores matching filter, then fetch aggregate ratings.

    let query = db.select().from(stores).$dynamic();
    const conditions = [];
    
    if (options?.search) {
      conditions.push(ilike(stores.name, `%${options.search}%`));
    }
    if (options?.address) {
      conditions.push(ilike(stores.address, `%${options.address}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const storesList = await query.execute();

    // Now get ratings for these stores
    // This is N+1 but for a dashboard/list it's manageable or we can optimise with a single group by query
    const storesWithRatings = await Promise.all(storesList.map(async (store) => {
        const result = await db
            .select({ avg: sql<number>`avg(${ratings.rating})` })
            .from(ratings)
            .where(eq(ratings.storeId, store.id));
        
        return {
            ...store,
            averageRating: Number(result[0]?.avg || 0)
        };
    }));

    if (options?.sortBy === 'rating') {
        storesWithRatings.sort((a, b) => b.averageRating - a.averageRating);
    } else if (options?.sortBy === 'name') {
        storesWithRatings.sort((a, b) => a.name.localeCompare(b.name));
    }

    return storesWithRatings;
  }

  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }

  async getStoresByOwner(ownerId: number): Promise<Store[]> {
    return db.select().from(stores).where(eq(stores.ownerId, ownerId));
  }

  async createOrUpdateRating(insertRating: InsertRating): Promise<Rating> {
    // Check if exists
    const existing = await this.getUserRatingForStore(insertRating.userId, insertRating.storeId);
    
    if (existing) {
        const [updated] = await db
            .update(ratings)
            .set({ rating: insertRating.rating })
            .where(eq(ratings.id, existing.id))
            .returning();
        return updated;
    } else {
        const [created] = await db.insert(ratings).values(insertRating).returning();
        return created;
    }
  }

  async getRatingsForStore(storeId: number): Promise<(Rating & { user: User })[]> {
    return db.query.ratings.findMany({
        where: eq(ratings.storeId, storeId),
        with: {
            user: true
        },
        orderBy: desc(ratings.createdAt)
    });
  }

  async getUserRatingForStore(userId: number, storeId: number): Promise<Rating | undefined> {
    const [rating] = await db
        .select()
        .from(ratings)
        .where(and(eq(ratings.userId, userId), eq(ratings.storeId, storeId)));
    return rating;
  }

  async getAdminStats(): Promise<{ totalUsers: number; totalStores: number; totalRatings: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [storeCount] = await db.select({ count: sql<number>`count(*)` }).from(stores);
    const [ratingCount] = await db.select({ count: sql<number>`count(*)` }).from(ratings);
    
    return {
        totalUsers: Number(userCount.count),
        totalStores: Number(storeCount.count),
        totalRatings: Number(ratingCount.count)
    };
  }
}

export const storage = new DatabaseStorage();
