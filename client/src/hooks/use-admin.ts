import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertUser, type InsertStore } from "@shared/routes";

export function useAdminDashboard() {
  return useQuery({
    queryKey: [api.admin.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.admin.dashboard.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.admin.dashboard.responses[200].parse(await res.json());
    },
  });
}

export function useAdminUsers(params?: z.infer<typeof api.admin.users.list.input>) {
  return useQuery({
    queryKey: [api.admin.users.list.path, params],
    queryFn: async () => {
      const url = new URL(api.admin.users.list.path, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.admin.users.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.admin.users.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create user");
      }
      return api.admin.users.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.dashboard.path] });
    },
  });
}

export function useAdminStores(params?: z.infer<typeof api.admin.stores.list.input>) {
  return useQuery({
    queryKey: [api.admin.stores.list.path, params],
    queryFn: async () => {
      const url = new URL(api.admin.stores.list.path, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stores");
      return api.admin.stores.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertStore) => {
      const res = await fetch(api.admin.stores.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create store");
      }
      return api.admin.stores.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.stores.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.dashboard.path] });
    },
  });
}
