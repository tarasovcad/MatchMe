"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
} from "@tanstack/react-query";
import {supabase} from "@/utils/supabase/client";
import {Notification} from "@/types/notifications";
import {toast} from "sonner";
import {groupFollowNotificationsTiered} from "@/utils/other/dateGrouping";

type RawNotification = {
  id: string;
  type: Notification["type"];
  created_at: string;
  sender_id: string;
  recipient_id: string;
  reference_id?: string | null;
  is_read: boolean;
  status?: Notification["status"];
  action_taken_at?: string | null;
};

type MinimalSender = {id: string};

const NOTIFICATION_TABLE = "mock_notifications";
const PROFILE_TABLE = "mock_profiles";

async function fetchProfilesByIds(ids: string[]): Promise<Record<string, Notification["sender"]>> {
  if (ids.length === 0) return {};
  const {data, error} = await supabase
    .from(PROFILE_TABLE)
    .select("id, username, name, profile_image")
    .in("id", ids);
  if (error) throw error;
  const map: Record<string, Notification["sender"]> = {};
  (data || []).forEach((p) => {
    map[p.id as string] = p as Notification["sender"];
  });
  return map;
}

// Simple offset-based pagination (per-page grouping)
async function fetchNotificationsPage(
  userId: string,
  page: number,
  firstPageSize: number,
  pageSize: number,
): Promise<{items: Notification[]; rawLength: number}> {
  // Compute range with a larger first page
  let from = 0;
  let to = 0;
  if (page === 1) {
    from = 0;
    to = firstPageSize - 1;
  } else {
    from = firstPageSize + (page - 2) * pageSize;
    to = from + pageSize - 1;
  }

  const {data, error} = await supabase
    .from(NOTIFICATION_TABLE)
    .select(
      `id, type, created_at, sender_id, recipient_id, reference_id, is_read, status, action_taken_at`,
    )
    .eq("recipient_id", userId)
    .order("created_at", {ascending: false})
    .range(from, to);

  if (error) throw error;

  const raw: RawNotification[] = (data || []) as RawNotification[];

  // Group within this page
  const grouped = groupFollowNotificationsTiered(
    raw.map((n) => ({
      ...n,
      sender: {id: n.sender_id} as MinimalSender,
    })) as unknown as Notification[],
  );

  // Collect sender IDs
  const idsSet = new Set<string>();
  grouped.forEach((n) => {
    if (n.type === "follow_grouped") {
      (n.grouped_senders || []).forEach((s) => idsSet.add((s as MinimalSender).id));
    } else {
      idsSet.add(n.sender_id);
    }
  });

  const profilesMap = await fetchProfilesByIds(Array.from(idsSet));

  // Attach sender + project details (same as non-paginated)
  const final: Notification[] = await Promise.all(
    grouped.map(async (n) => {
      const attachSender = (id: string) => profilesMap[id] || {id};

      if (n.type === "follow_grouped") {
        return {
          ...n,
          grouped_senders: (n.grouped_senders || []).map((s) =>
            attachSender((s as MinimalSender).id),
          ),
          sender: attachSender((n.grouped_senders?.[0] as MinimalSender)?.id || ""),
        } as Notification;
      }

      if (n.type === "project_invite" && n.reference_id) {
        try {
          const {data: projectData} = await supabase
            .from("projects")
            .select("id, name, slug")
            .eq("id", n.reference_id)
            .single();
          if (projectData) {
            return {
              ...(n as Notification),
              sender: attachSender(n.sender_id),
              project: projectData,
            };
          }
        } catch {
          /* ignore */
        }
      }

      return {
        ...(n as Notification),
        sender: attachSender(n.sender_id),
      };
    }),
  );

  return {items: final, rawLength: raw.length};
}

export function useInfiniteNotifications(
  userId: string,
  enabled: boolean,
  options?: {firstPageSize?: number; pageSize?: number},
) {
  const firstPageSize = options?.firstPageSize ?? 50;
  const pageSize = options?.pageSize ?? 20;

  const queryKey = ["notifications", userId, "infinite", firstPageSize, pageSize] as const;

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn: async ({pageParam}) => {
      const page = pageParam as number;
      const {items, rawLength} = await fetchNotificationsPage(
        userId,
        page,
        firstPageSize,
        pageSize,
      );
      const currentSize = page === 1 ? firstPageSize : pageSize;
      return {
        items,
        nextPage: rawLength === currentSize ? page + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: enabled && !!userId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const items = (infiniteQuery.data?.pages ?? []).flatMap((p) => p.items) as Notification[];

  return {
    items,
    ...infiniteQuery,
    isLoadingInitial: infiniteQuery.isLoading,
    isLoadingMore: infiniteQuery.isFetchingNextPage,
    hasMore: infiniteQuery.hasNextPage,
    loadMore: () => infiniteQuery.fetchNextPage(),
  };
}
