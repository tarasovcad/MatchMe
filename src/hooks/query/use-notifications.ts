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

const NOTIFICATION_TABLE = "notifications";
const PROFILE_TABLE = "profiles";

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

  // Collect project reference IDs (for any project-related notification)
  const projectRefIds = Array.from(
    new Set(
      grouped
        .map((n) => ("reference_id" in n ? (n as unknown as RawNotification).reference_id : null))
        .filter((id): id is string => !!id),
    ),
  );

  const projectsMap: Record<string, {id: string; name: string; slug: string}> = {};
  if (projectRefIds.length > 0) {
    const {data: projectsData} = await supabase
      .from("projects")
      .select("id, name, slug")
      .in("id", projectRefIds);
    (projectsData || []).forEach((p) => {
      projectsMap[p.id as string] = p as {id: string; name: string; slug: string};
    });
  }

  // Attach sender + project details (batched)
  const final: Notification[] = grouped.map((n) => {
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

    const referenceId = (n as unknown as RawNotification).reference_id;
    const project = referenceId ? projectsMap[referenceId] : undefined;

    return {
      ...(n as Notification),
      sender: attachSender(n.sender_id),
      ...(project ? {project} : {}),
    };
  });

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const items = (infiniteQuery.data?.pages ?? []).flatMap((p) => p.items) as Notification[];

  const queryClient = useQueryClient();

  // Mark specific notifications as read (one or many IDs)
  const markReadMutation = useMutation({
    mutationKey: ["notifications", userId, "mark-read"],
    mutationFn: async (ids: string[]) => {
      if (!ids || ids.length === 0) return;
      const {error} = await supabase
        .from(NOTIFICATION_TABLE)
        .update({is_read: true})
        .in("id", ids)
        .eq("recipient_id", userId);
      if (error) throw error;
    },
    onMutate: (ids) => {
      queryClient.setQueriesData<InfiniteData<{items: Notification[]; nextPage?: number}>>(
        {queryKey: ["notifications", userId, "infinite"]},
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((pg) => ({
              ...pg,
              items: pg.items.map((n) =>
                ids.includes(n.id) || n.grouped_ids?.some((gid) => ids.includes(gid))
                  ? {...n, is_read: true}
                  : n,
              ),
            })),
          };
        },
      );
    },
    onSuccess: () => {
      // Refresh counts
      queryClient.invalidateQueries({queryKey: ["notifications", userId, "unread-count"]});
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId, "grouped-unread-counts"],
      });
    },
    onError: () => {
      toast.error("Failed to mark as read");
    },
  });

  // Mark ALL notifications as read for this user
  const markAllReadMutation = useMutation({
    mutationKey: ["notifications", userId, "mark-all-read"],
    mutationFn: async () => {
      const {error} = await supabase
        .from(NOTIFICATION_TABLE)
        .update({is_read: true})
        .eq("recipient_id", userId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onMutate: () => {
      queryClient.setQueriesData<InfiniteData<{items: Notification[]; nextPage?: number}>>(
        {queryKey: ["notifications", userId, "infinite"]},
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((pg) => ({
              ...pg,
              items: pg.items.map((n) => ({...n, is_read: true})),
            })),
          };
        },
      );
    },
    onSuccess: () => {
      // Refresh counts
      queryClient.invalidateQueries({queryKey: ["notifications", userId, "unread-count"]});
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId, "grouped-unread-counts"],
      });
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });

  return {
    items,
    ...infiniteQuery,
    isLoadingInitial: infiniteQuery.isLoading,
    isLoadingMore: infiniteQuery.isFetchingNextPage,
    hasMore: infiniteQuery.hasNextPage,
    loadMore: () => infiniteQuery.fetchNextPage(),
    // mutations
    markAsRead: (ids: string[]) => markReadMutation.mutate(ids),
    markAllAsRead: () => markAllReadMutation.mutate(),
  };
}
