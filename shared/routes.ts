import { z } from 'zod';
import { insertUserSchema, insertStoreSchema, insertRatingSchema, passwordUpdateSchema, users, stores, ratings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(), // We use email as username in passport
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    signup: {
      method: 'POST' as const,
      path: '/api/signup',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    updatePassword: {
      method: 'POST' as const,
      path: '/api/change-password',
      input: passwordUpdateSchema,
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/admin/dashboard',
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalStores: z.number(),
          totalRatings: z.number(),
        }),
      },
    },
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users',
        input: z.object({
          search: z.string().optional(),
          role: z.string().optional(),
          sortBy: z.enum(['name', 'email', 'role']).optional(),
          order: z.enum(['asc', 'desc']).optional(),
        }).optional(),
        responses: {
          200: z.array(z.custom<typeof users.$inferSelect & { averageRating?: number }>()),
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/users',
        input: insertUserSchema,
        responses: {
          201: z.custom<typeof users.$inferSelect>(),
          400: errorSchemas.validation,
        },
      },
      get: {
        method: 'GET' as const,
        path: '/api/admin/users/:id',
        responses: {
          200: z.custom<typeof users.$inferSelect>(),
          404: errorSchemas.notFound,
        },
      },
    },
    stores: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/stores',
        input: z.object({
          search: z.string().optional(),
          sortBy: z.enum(['name', 'email']).optional(),
          order: z.enum(['asc', 'desc']).optional(),
        }).optional(),
        responses: {
          200: z.array(z.custom<typeof stores.$inferSelect & { rating: number }>()),
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/stores',
        input: insertStoreSchema,
        responses: {
          201: z.custom<typeof stores.$inferSelect>(),
          400: errorSchemas.validation,
        },
      },
    },
  },
  users: {
    stores: {
      list: {
        method: 'GET' as const,
        path: '/api/stores',
        input: z.object({
          search: z.string().optional(),
          address: z.string().optional(),
          sortBy: z.enum(['name', 'rating']).optional(),
        }).optional(),
        responses: {
          200: z.array(z.custom<typeof stores.$inferSelect & { 
            averageRating: number; 
            myRating?: number; 
          }>()),
        },
      },
    },
    ratings: {
      submit: {
        method: 'POST' as const,
        path: '/api/stores/:storeId/rate',
        input: z.object({ rating: z.number().min(1).max(5) }),
        responses: {
          200: z.custom<typeof ratings.$inferSelect>(),
          400: errorSchemas.validation,
        },
      },
    },
  },
  owner: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/owner/dashboard',
      responses: {
        200: z.array(z.object({
          storeName: z.string(),
          averageRating: z.number(),
          ratings: z.array(z.object({
            userName: z.string(),
            rating: z.number(),
            comment: z.string().optional(),
          })),
        })),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
