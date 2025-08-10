import React, {useMemo} from "react";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import {createNotificationItem} from "./NotificationItem";
import {Notification} from "@/types/notifications";
import {groupNotificationsByTime} from "@/utils/other/dateGrouping";
import FollowNotificationSkeleton from "./FollowNotificationSkeleton";
import NotificationEmptyState from "./NotificationEmptyState";
import {motion} from "framer-motion";

const NotificationList = ({
  notifications,
  isLoading,
  isLoadingMore = false,
  markAsRead,
}: {
  notifications: Notification[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  markAsRead: (ids: string[]) => void;
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col">
        {Array.from({length: 8}).map((_, idx) => (
          <FollowNotificationSkeleton key={`notif-skel-${idx}`} />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  const groupedNotifications = useMemo(
    () => groupNotificationsByTime(notifications),
    [notifications],
  );

  const itemTransition = {type: "spring" as const, stiffness: 420, damping: 36, mass: 0.6};

  return (
    <div className="flex flex-col">
      {Object.entries(groupedNotifications).map(([section, sectionNotifications]) => (
        <div key={section} className="mb-4 last:mb-0">
          <span className="text-foreground/90 font-medium text-[15px] px-3 pb-1 block sticky top-0 bg-background z-[20] pt-2">
            {section}
          </span>

          <div className="flex flex-col">
            {sectionNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout="position"
                initial={{opacity: 0}}
                animate={{opacity: 1, transition: {duration: 0.18}}}
                transition={itemTransition}>
                {createNotificationItem(notification, markAsRead)}
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {isLoadingMore && (
        <div className="flex flex-col">
          {Array.from({length: 3}).map((_, idx) => (
            <motion.div
              key={`notif-more-skel-${idx}`}
              initial={{opacity: 0}}
              animate={{opacity: 1}}>
              <FollowNotificationSkeleton />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
