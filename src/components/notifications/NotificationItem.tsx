import React from "react";
import Link from "next/link";
import Image from "next/image";
import {formatDateAbsolute, formatTimeRelative} from "@/functions/formatDate";
import {Notification} from "@/types/notifications";

const FollowNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (id: string) => void;
}) => {
  const {sender} = notification;
  const {image, name, username} = sender;

  return (
    <button
      className="flex items-start gap-2 hover:bg-muted p-1.5 py-2.5 rounded-radius"
      onClick={() => markAsRead(notification.id)}>
      <div className="relative w-10 h-10">
        <Image
          src={image}
          width={35}
          height={35}
          className="rounded-full"
          unoptimized
          alt={`${name}'s profile`}
        />
      </div>
      <div className="w-full text-secondary">
        <div className="flex justify-between items-start gap-2 text-start">
          <p>
            <Link href={`/profiles/${username}`}>
              <span className="font-medium text-foreground hover:underline">
                {name}
              </span>
            </Link>{" "}
            started following you
          </p>
          {notification.is_read === false && (
            <div className="bg-primary rounded-full w-2 h-2 shrink-0"></div>
          )}
        </div>
        <div className="flex justify-between items-center gap-2 text-xs">
          <p>{formatDateAbsolute(notification.created_at)}</p>
          <p>{formatTimeRelative(notification.created_at)}</p>
        </div>
      </div>
    </button>
  );
};

export const createNotificationItem = (
  notification: Notification,
  markAsRead: (id: string) => void,
) => {
  switch (notification.type) {
    case "follow":
      return (
        <FollowNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );
    // Other notification types here
    default:
      return null;
  }
};
