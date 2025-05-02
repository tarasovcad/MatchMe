export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string;
  reference_id?: string | null;
  type: string;
  created_at: string;
  is_read: boolean;
  sender: {
    id: string;
    username: string;
    name: string;
    profile_image?: string;
  };
}
