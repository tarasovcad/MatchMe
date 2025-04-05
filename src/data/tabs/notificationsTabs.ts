export const NOTIFICATION_GROUPS = [
  {title: "All", id: "all"},
  {title: "Follower Activity", id: "follower-activity"},
  {title: "Mentions & Tags", id: "mentions-tags"},
  {title: "Direct Messages", id: "direct-messages"},
  {title: "Project Updates", id: "project-updates"},
];

export const getNotificationTypeGroup = (type: string): string => {
  switch (type) {
    case "follow":
      return "follower-activity";
    case "mention":
    case "tag":
      return "mentions-tags";
    case "message":
      return "direct-messages";
    case "project":
      return "project-updates";
    default:
      return "all";
  }
};
