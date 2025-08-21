import React from "react";
import {User} from "@supabase/supabase-js";
import {deleteUserAccount} from "@/actions/(auth)/deleteUserAccount";
import {useRouter} from "next/navigation";
import ConfirmationModal from "@/components/ui/dialog/ConfirmationModal";

const DangerZone = ({id, user}: {id: string; user: User}) => {
  const username = user?.user_metadata?.username;
  const router = useRouter();

  const handleDeleteAccount = async () => {
    const response = await deleteUserAccount(user);

    if (response.error) {
      console.error("Error deleting user account:", response.error);
      return {error: String(response.error)};
    }

    // Redirect after successful deletion
    router.push("/");

    return {message: response.message || "Account deleted successfully"};
  };

  return (
    <ConfirmationModal
      id={id}
      triggerText="Delete Account"
      title="Final confirmation"
      description="This action cannot be undone. Your account and all associated data will be permanently deleted."
      confirmationValue={username}
      onConfirm={handleDeleteAccount}
      triggerVariant="destructive"
      triggerSize="sm"
      confirmButtonText="Delete"
    />
  );
};

export default DangerZone;
