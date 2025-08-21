export const NOTIFICATION_GROUPS = [
  {title: "All", id: "all"},
  {title: "Project Updates", id: "project-updates"},
  {title: "Follower Activity", id: "follower-activity"},
  {title: "Direct Messages", id: "direct-messages"},
  {title: "Mentions & Tags", id: "mentions-tags"},
];

export const getNotificationTypeGroup = (type: string): string => {
  switch (type as string) {
    // Follower Activity
    case "follow":
    case "follow_grouped":
      return "follower-activity";

    // Mentions & Tags
    case "mention":
    case "tag":
      return "mentions-tags";

    // Direct Messages
    case "message":
      return "direct-messages";

    // Project Updates
    case "project_invite":
    case "project_request":
    case "user_request_accepted":
    case "user_request_rejected":
    case "project_invite_accepted":
    case "project_invite_rejected":
    case "project_member_added":
    case "project_member_removed":
    case "project_role_updated":
    case "project_deleted":
      return "project-updates";

    // System/Admin
    case "system_announcement":
    case "account_security":
      return "all";

    default:
      return "all";
  }
};
