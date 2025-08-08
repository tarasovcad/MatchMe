import {Notification} from "@/types/notifications";
import type {NotificationType} from "@/types/notifications/notificationType";

export type TimeSection = "Today" | "Last 7 Days" | "Last 30 Days" | "Older";

export interface GroupedNotifications {
  [key: string]: Notification[];
}

export const getTimeSection = (createdAt: string): TimeSection => {
  const now = new Date();
  const notificationDate = new Date(createdAt);

  // Reset hours/minutes/seconds to compare dates only
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notificationDay = new Date(
    notificationDate.getFullYear(),
    notificationDate.getMonth(),
    notificationDate.getDate(),
  );

  const diffTime = todayStart.getTime() - notificationDay.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays <= 7) {
    return "Last 7 Days";
  } else if (diffDays <= 30) {
    return "Last 30 Days";
  } else {
    return "Older";
  }
};

export const groupNotificationsByTime = (notifications: Notification[]): GroupedNotifications => {
  const sections: TimeSection[] = ["Today", "Last 7 Days", "Last 30 Days", "Older"];

  const grouped = notifications.reduce((acc, notification) => {
    const section = getTimeSection(notification.created_at);
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(notification);
    return acc;
  }, {} as GroupedNotifications);

  // Return sections in order, only including sections that have notifications
  const orderedGroups: GroupedNotifications = {};
  sections.forEach((section) => {
    if (grouped[section] && grouped[section].length > 0) {
      orderedGroups[section] = grouped[section];
    }
  });

  return orderedGroups;
};

// Tiered follow grouping
export type FollowGroupingWindow = "1h" | "3h" | "6h" | "24h";

export const pickFollowGroupingWindow = (
  followsPerHour: number,
  followsPerDay: number,
): FollowGroupingWindow => {
  if (followsPerHour < 3) return "1h";
  if (followsPerHour < 15) return "3h";
  if (followsPerDay < 50) return "6h";
  return "24h";
};

export const shouldGroupFollowNotifications = (
  notifications: Notification[],
  userId: string,
): boolean => {
  const follows = notifications.filter((n) => n.type === "follow");
  const recentFollows = follows.filter((n) => {
    const notifTime = new Date(n.created_at).getTime();
    const hourAgo = Date.now() - 60 * 60 * 1000;
    return notifTime >= hourAgo;
  });

  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
  const followsInSixHours = follows.filter(
    (n) => new Date(n.created_at).getTime() >= sixHoursAgo,
  ).length;

  return recentFollows.length > 2 || followsInSixHours > 5;
};

const windowToMs = (w: FollowGroupingWindow): number => {
  switch (w) {
    case "1h":
      return 60 * 60 * 1000;
    case "3h":
      return 3 * 60 * 60 * 1000;
    case "6h":
      return 6 * 60 * 60 * 1000;
    case "24h":
      return 24 * 60 * 60 * 1000;
  }
};

export const groupFollowNotificationsTiered = (notifications: Notification[]): Notification[] => {
  const follows = notifications.filter((n) => n.type === "follow");
  if (follows.length === 0) return notifications;

  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const perHour = follows.filter((n) => new Date(n.created_at).getTime() >= hourAgo).length;
  const perDay = follows.filter((n) => new Date(n.created_at).getTime() >= dayAgo).length;

  const window = pickFollowGroupingWindow(perHour, perDay);
  const windowMs = windowToMs(window);

  // Bucket follows by floored window
  const bucketKey = (ts: number) => Math.floor(ts / windowMs) * windowMs;
  const byBucket = new Map<number, Notification[]>();

  // Sort desc first so the first item in each bucket is the newest
  const sortedFollows = [...follows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  for (const n of sortedFollows) {
    const ts = new Date(n.created_at).getTime();
    const key = bucketKey(ts);
    const list = byBucket.get(key) || [];
    list.push(n);
    byBucket.set(key, list);
  }

  // Create grouped items per bucket
  const groupedFollowItems: Notification[] = [];

  // Iterate buckets in descending time order
  const bucketKeysDesc = Array.from(byBucket.keys()).sort((a, b) => b - a);
  for (const key of bucketKeysDesc) {
    const bucket = byBucket.get(key)!;
    if (bucket.length <= 1) {
      groupedFollowItems.push(bucket[0]);
      continue;
    }
    const first = bucket[0];
    groupedFollowItems.push({
      ...first,
      id: first.id,
      type: "follow_grouped" as NotificationType,
      grouped_count: bucket.length,
      grouped_senders: bucket.slice(0, 2).map((n) => n.sender),
    });
  }

  const others = notifications.filter((n) => n.type !== "follow");
  const merged = [...others, ...groupedFollowItems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return merged;
};
