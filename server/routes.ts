import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { userRoles } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Passport Auth
  setupAuth(app);

  // === ADMIN ROUTES ===
  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    res.status(403).json({ message: "Admin access required" });
  };

  const requireOwner = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === 'owner') return next();
    res.status(403).json({ message: "Store Owner access required" });
  };

  const requireUser = (req: any, res: any, next: any) => {
    // Normal users and admins/owners can access basic user features like viewing stores
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Login required" });
  };

  // Dashboard Stats
  app.get(api.admin.dashboard.path, requireAdmin, async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });

  // Admin: Users Management
  app.get(api.admin.users.list.path, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers(req.query as any);
    res.json(users);
  });

  app.post(api.admin.users.create.path, requireAdmin, async (req, res) => {
    try {
      const data = api.admin.users.create.input.parse(req.body);
      const user = await storage.createUser(data);
      res.status(201).json(user);
    } catch (err) {
       if (err instanceof z.ZodError) {
         res.status(400).json({ message: err.errors[0].message });
       } else {
         res.status(500).json({ message: "Failed to create user" });
       }
    }
  });
  
  app.get(api.admin.users.get.path, requireAdmin, async (req, res) => {
     const user = await storage.getUser(Number(req.params.id));
     if (!user) return res.status(404).json({ message: "User not found" });
     res.json(user);
  });

  // Admin: Store Management
  app.get(api.admin.stores.list.path, requireAdmin, async (req, res) => {
    const stores = await storage.getAllStores(req.query as any);
    res.json(stores);
  });

  app.post(api.admin.stores.create.path, requireAdmin, async (req, res) => {
    try {
        const data = api.admin.stores.create.input.parse(req.body);
        const store = await storage.createStore(data);
        res.status(201).json(store);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ message: err.errors[0].message });
        } else {
            res.status(500).json({ message: "Failed to create store" });
        }
    }
  });

  // === USER ROUTES ===
  app.get(api.users.stores.list.path, requireUser, async (req, res) => {
    const stores = await storage.getAllStores(req.query as any);
    
    // Attach my rating if exists
    const storesWithMyRating = await Promise.all(stores.map(async (store) => {
        const myRating = await storage.getUserRatingForStore(req.user!.id, store.id);
        return {
            ...store,
            myRating: myRating?.rating
        };
    }));
    
    res.json(storesWithMyRating);
  });

  app.post(api.users.ratings.submit.path, requireUser, async (req, res) => {
    try {
        const { rating } = api.users.ratings.submit.input.parse(req.body);
        const storeId = Number(req.params.storeId);
        
        const result = await storage.createOrUpdateRating({
            userId: req.user!.id,
            storeId,
            rating
        });
        
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: "Invalid rating" });
    }
  });

  // === OWNER ROUTES ===
  app.get(api.owner.dashboard.path, requireOwner, async (req, res) => {
    const myStores = await storage.getStoresByOwner(req.user!.id);
    
    const dashboardData = await Promise.all(myStores.map(async (store) => {
        const ratings = await storage.getRatingsForStore(store.id);
        const avg = ratings.length > 0 
            ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length
            : 0;
            
        return {
            storeName: store.name,
            averageRating: avg,
            ratings: ratings.map(r => ({
                userName: r.user.name,
                rating: r.rating
            }))
        };
    }));
    
    res.json(dashboardData);
  });
  
  // Password Change
  app.post(api.auth.updatePassword.path, requireUser, async (req, res) => {
      try {
          const { currentPassword, newPassword } = api.auth.updatePassword.input.parse(req.body);
          
          // Verify current
          const isValid = await storage.comparePasswords(currentPassword, req.user!.password);
          if (!isValid) return res.status(401).json({ message: "Incorrect current password" });
          
          await storage.updateUserPassword(req.user!.id, newPassword);
          res.json({ message: "Password updated successfully" });
      } catch (err) {
          if (err instanceof z.ZodError) {
              res.status(400).json({ message: err.errors[0].message });
          } else {
              res.status(500).json({ message: "Failed to update password" });
          }
      }
  });

  await seed();

  return httpServer;
}

async function seed() {
    const adminEmail = "admin@system.com";
    if (await storage.getUserByUsername(adminEmail)) return;

    // Create Admin
    const admin = await storage.createUser({
        name: "System Administrator",
        email: adminEmail,
        password: "AdminPassword1!",
        address: "HQ Address, 123 Admin St",
        role: "admin"
    });

    // Create Store Owner
    const owner = await storage.createUser({
        name: "Store Owner User",
        email: "owner@store.com",
        password: "OwnerPassword1!",
        address: "Owner St, 456 Business Rd",
        role: "owner"
    });

    // Create Normal User
    const user = await storage.createUser({
        name: "Normal User Test",
        email: "user@test.com",
        password: "UserPassword1!",
        address: "User Ln, 789 Customer Ave",
        role: "user"
    });

    // Create Stores
    const store1 = await storage.createStore({
        name: "Tech Gadgets Store Inc.",
        email: "contact@techgadgets.com",
        address: "101 Tech Blvd, Silicon Valley",
        ownerId: owner.id
    });

    const store2 = await storage.createStore({
        name: "Organic Foods Market",
        email: "info@organicfoods.com",
        address: "202 Green Way, Eco City",
        ownerId: owner.id // Same owner for testing dashboard
    });
    
    // Create Ratings
    await storage.createOrUpdateRating({
        userId: user.id,
        storeId: store1.id,
        rating: 5
    });
    
    await storage.createOrUpdateRating({
        userId: user.id,
        storeId: store2.id,
        rating: 4
    });

    console.log("Database seeded successfully!");
}
