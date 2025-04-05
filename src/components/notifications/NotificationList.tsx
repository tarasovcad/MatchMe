import React from "react";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import {createNotificationItem} from "./NotificationItem";
import {Notification} from "@/types/notifications";
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

  return (
    <div className="flex flex-col">
      {notifications.map((notification) =>
        createNotificationItem(notification, markAsRead),
      )}
    </div>
  );
};

export default React.memo(NotificationList);
