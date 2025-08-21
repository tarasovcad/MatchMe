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
  // Project Updates - Clear naming
  | "project_follow"
  | "project_invite"
  | "project_request"
  | "user_request_accepted" // User's request to join was accepted by owner
  | "user_request_rejected" // User's request to join was rejected by owner
  | "project_invite_accepted" // Owner's invite was accepted by user
  | "project_invite_rejected" // Owner's invite was rejected by user
  | "project_member_added"
  | "project_member_removed"
  | "project_role_updated"
  | "project_deleted"
  // System/Admin
  | "system_announcement"
  | "account_security"
  // Profile milestones
  | "profile_milestone";
