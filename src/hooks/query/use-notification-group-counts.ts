"use client";

import {useQuery} from "@tanstack/react-query";
import {supabase} from "@/utils/supabase/client";
import {groupFollowNotificationsTiered} from "@/utils/other/dateGrouping";
import {NOTIFICATION_GROUPS, getNotificationTypeGroup} from "@/data/tabs/notificationsTabs";
import type {Notification} from "@/types/notifications";

const NOTIFICATION_TABLE = "notifications";

type RawMinimal = {
  id: string;
  type: Notification["type"];
  created_at: string;
  sender_id: string;
  recipient_id: string;
  reference_id?: string | null;
  is_read: boolean;
};

export type NotificationGroupCounts = Record<string, number>;

export function useNotificationGroupCounts(
  userId: string | null | undefined,
  enabled: boolean = true,
) {
  return useQuery<NotificationGroupCounts>({
    queryKey: ["notifications", userId, "grouped-unread-counts"],
    enabled: !!userId && !!enabled,
    queryFn: async () => {
      const {data, error} = await supabase
        .from(NOTIFICATION_TABLE)
        .select("id, type, created_at, sender_id, recipient_id, reference_id, is_read")
        .eq("recipient_id", userId as string)
        .eq("is_read", false)
        .order("created_at", {ascending: false});
      if (error) throw error;
      const raw = (data ?? []) as RawMinimal[];

      // Create minimal Notification objects sufficient for grouping
      const minimal: Notification[] = raw.map(
        (n) =>
          ({
            id: n.id,
            type: n.type,
            created_at: n.created_at,
            sender_id: n.sender_id,
            recipient_id: n.recipient_id,
            reference_id: n.reference_id,
            is_read: n.is_read,
            status: "pending",
            sender: {id: n.sender_id, username: "", name: ""},
          }) as unknown as Notification,
      );

      const grouped = groupFollowNotificationsTiered(minimal);

      // Count per tab id based on grouped array
      const counts: NotificationGroupCounts = {
        all: grouped.length,
      };
      for (const g of NOTIFICATION_GROUPS.slice(1)) {
        counts[g.id] = grouped.filter(
          (n) => getNotificationTypeGroup(n.type as string) === g.id,
        ).length;
      }
      return counts;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
