import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function usePublicStores(params?: z.infer<typeof api.users.stores.list.input>) {
  return useQuery({
    queryKey: [api.users.stores.list.path, params],
    queryFn: async () => {
      const url = new URL(api.users.stores.list.path, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stores");
      return api.users.stores.list.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, rating }: { storeId: number; rating: number }) => {
      const url = buildUrl(api.users.ratings.submit.path, { storeId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit rating");
      }
      return api.users.ratings.submit.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.stores.list.path] });
    },
  });
}
