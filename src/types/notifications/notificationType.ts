// Notification types enum
export type NotificationType =
  // Follower Activity
  | "follow"
  | "follow_grouped"
  | "unfollow"
  // Mentions & Tags
  | "mention"
  | "tag"
  // Direct Messages
  | "message"
  // Project Updates
  | "project_invite"
  | "project_request"
  | "project_request_accepted"
  | "project_request_rejected"
  | "project_member_added"
  | "project_member_removed"
  | "project_role_updated"
  | "project_deleted"
  // System/Admin
  | "system_announcement"
  | "account_security";
