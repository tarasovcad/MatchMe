// Notification types enum
export type NotificationType =
  // Follower Activity
  | "follow"
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

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string;
  reference_id?: string | null;
  type: NotificationType;
  created_at: string;
  is_read: boolean;
  status: "pending" | "accepted" | "declined" | "expired";
  action_taken_at?: string | null;
  sender: {
    id: string;
    username: string;
    name: string;
    profile_image?: {
      url: string;
      fileName: string;
      fileSize: number;
      uploadedAt: string;
    }[];
  };
  project?: {
    id: string;
    name: string;
    slug: string;
  };
}
