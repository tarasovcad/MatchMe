"use client";

import {useQuery} from "@tanstack/react-query";
import {supabase} from "@/utils/supabase/client";

const NOTIFICATION_TABLE = "notifications";

export function useUnreadNotificationsCount(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["notifications", userId, "unread-count"],
    enabled: !!userId,
    queryFn: async () => {
      const label = `unread-count:${userId}`;
      const start = typeof performance !== "undefined" ? performance.now() : Date.now();
      console.time?.(label);
      try {
        const {count, error} = await supabase
          .from(NOTIFICATION_TABLE)
          .select("id", {count: "exact", head: true})
          .eq("recipient_id", userId as string)
          .eq("is_read", false);
        if (error) throw error;
        return count ?? 0;
      } finally {
        const end = typeof performance !== "undefined" ? performance.now() : Date.now();
        console.timeEnd?.(label);
        const durationMs = (end as number) - (start as number);
        console.info?.(
          `[notifications] unread-count fetch for ${userId}: ${durationMs.toFixed(1)}ms`,
        );
      }
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
