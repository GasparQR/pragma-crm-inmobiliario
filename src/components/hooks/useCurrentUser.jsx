import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const user = await api.auth.me();
        return user;
      } catch {
        return null;
      }
    }
  });
}