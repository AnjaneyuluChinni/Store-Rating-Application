import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useOwnerDashboard() {
  return useQuery({
    queryKey: [api.owner.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.owner.dashboard.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch owner dashboard");
      return api.owner.dashboard.responses[200].parse(await res.json());
    },
  });
}
