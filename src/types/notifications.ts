import {NotificationType} from "./notifications/notificationType";

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
  // Optional fields for grouped notifications (e.g., follow_grouped)
  grouped_count?: number;
  grouped_senders?: Array<{
    id: string;
    username: string;
    name: string;
    profile_image?: {
      url: string;
      fileName: string;
      fileSize: number;
      uploadedAt: string;
    }[];
  }>;
}
