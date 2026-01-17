import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser, type PasswordUpdate } from "@shared/routes";
import { useLocation } from "wouter";
import { z } from "zod";

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const userQuery = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.login.input>) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid credentials");
        throw new Error("Login failed");
      }
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
      if (user.role === "admin") setLocation("/admin/dashboard");
      else if (user.role === "owner") setLocation("/owner/dashboard");
      else setLocation("/stores");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      setLocation("/login");
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.auth.signup.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.auth.signup.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Signup failed");
      }
      return api.auth.signup.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      setLocation("/login");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordUpdate) => {
      const res = await fetch(api.auth.updatePassword.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update password");
      }
      return res.json();
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation,
    logout: logoutMutation,
    signup: signupMutation,
    updatePassword: updatePasswordMutation,
  };
}
