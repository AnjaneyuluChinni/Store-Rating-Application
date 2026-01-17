import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const userRoles = ["admin", "user", "owner"] as const;
export type UserRole = (typeof userRoles)[number];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Min 20, Max 60 enforced in Zod
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  address: text("address"), // Max 400 enforced in Zod
  role: text("role", { enum: userRoles }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Min 20, Max 60
  email: text("email").notNull(),
  address: text("address").notNull(), // Max 400
  ownerId: integer("owner_id").references(() => users.id), // Optional, as admins add stores
  createdAt: timestamp("created_at").defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  storeId: integer("store_id").notNull().references(() => stores.id),
  rating: integer("rating").notNull(), // 1-5
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  uniqueRating: unique().on(t.userId, t.storeId),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  ownedStores: many(stores),
  ratings: many(ratings),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, {
    fields: [stores.ownerId],
    references: [users.id],
  }),
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [ratings.storeId],
    references: [stores.id],
  }),
}));

// Zod Schemas & Validations
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must be at most 60 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().max(400, "Address must be at most 400 characters").optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character"),
  role: z.enum(userRoles).default("user"),
});

export const insertStoreSchema = createInsertSchema(stores).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(20, "Name must be at least 20 characters").max(60, "Name must be at most 60 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().max(400, "Address must be at most 400 characters"),
});

export const insertRatingSchema = createInsertSchema(ratings).omit({ id: true, createdAt: true }).extend({
  rating: z.coerce.number().min(1).max(5),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

// Password update schema
export const passwordUpdateSchema = z.object({
  currentPassword: z.string(),
  newPassword: insertUserSchema.shape.password,
});

export type PasswordUpdate = z.infer<typeof passwordUpdateSchema>;
