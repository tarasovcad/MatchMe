import React from "react";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import {createNotificationItem} from "./NotificationItem";
import {Notification} from "@/types/notifications";
import {groupNotificationsByTime} from "@/utils/other/dateGrouping";

const NotificationList = ({
  notifications,
  isLoading,
  markAsRead,
}: {
  notifications: Notification[];
  isLoading: boolean;
  markAsRead: (id: string) => void;
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <LoadingButtonCircle size={24} />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <p className="text-secondary">No notifications</p>
      </div>
    );
  }

  const groupedNotifications = groupNotificationsByTime(notifications);

  return (
    <div className="flex flex-col">
      {Object.entries(groupedNotifications).map(([section, sectionNotifications]) => (
        <div key={section} className="mb-4 last:mb-0">
          <span className="text-foreground/90 font-medium text-[15px] px-3 pb-1 block sticky top-0 bg-background z-10 pt-2">
            {section}
          </span>
          <div className="flex flex-col">
            {sectionNotifications.map((notification) =>
              createNotificationItem(notification, markAsRead),
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(NotificationList);
