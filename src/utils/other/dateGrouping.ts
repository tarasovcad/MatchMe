import {Notification} from "@/types/notifications";

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
