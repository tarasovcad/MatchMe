import React from "react";
import {
  Eye,
  MessageCircle,
  Copy,
  RefreshCw,
  UserX,
  Pin,
  ThumbsUpIcon,
  ThumbsDownIcon,
  Archive,
} from "lucide-react";
import OptionsPopover, {OptionsPopoverItem} from "@/components/ui/options/OptionsPopover";
import {toast} from "sonner";
import {formatDateAbsolute} from "@/functions/formatDate";

export type UserRequestActions = {
  onAcceptInvite?: () => void;
  onRejectInvite?: () => void;
  onCancelApplication?: () => void;
  onSendMessage?: () => void;
  onViewProject?: () => void;
  onCopyProjectLink?: () => void;
};

export type UserRequestsActionsPopoverProps = UserRequestActions & {
  requestDirection: "invite" | "application";
  requestStatus: "pending" | "accepted" | "rejected" | "cancelled";
  projectSlug: string;

  isManageProcessing?: boolean;
  trigger?: React.ReactNode;
};

const UserRequestsActionsPopover: React.FC<UserRequestsActionsPopoverProps> = ({
  requestDirection,
  requestStatus,
  projectSlug,
  isManageProcessing = false,
  onAcceptInvite,
  onRejectInvite,
  onCancelApplication,
  onSendMessage,
  onViewProject,
  onCopyProjectLink,
  trigger,
}) => {
  const handleViewProject = () => {
    if (onViewProject) return onViewProject();
    window.open(`/projects/${projectSlug}`, "_blank");
  };

  const handleCopyProjectLink = () => {
    if (onCopyProjectLink) return onCopyProjectLink();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard
      .writeText(`${origin}/projects/${projectSlug}`)
      .then(() => toast.success("Project link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const isInvite = requestDirection === "invite";
  const isApplication = requestDirection === "application";
  const isPending = requestStatus === "pending";
  const cancelAppDescription =
    "Withdraw your application. After cancelling, you’ll be able to re‑apply in 7 days.";

  const items: OptionsPopoverItem[] = [];

  // Invite actions for the user (they received an invite)
  if (isInvite && isPending) {
    items.push(
      {
        icon: ThumbsUpIcon,
        label: "Accept invite",
        onClick: onAcceptInvite,
      },
      {
        icon: ThumbsDownIcon,
        label: "Reject invite",
        onClick: onRejectInvite,
        separator: true,
      },
    );
  }

  if (isApplication) {
    // Pending application → allow cancel with description
    if (isPending) {
      items.push({
        icon: UserX,
        label: "Cancel request",
        onClick: onCancelApplication,
        description: cancelAppDescription,
        disabled: !isPending || isManageProcessing,
        separator: true,
      });
    }
  }

  // Shared utilities
  items.push(
    {
      icon: Eye,
      label: "View project",
      onClick: handleViewProject,
    },
    {
      icon: Copy,
      label: "Copy project link",
      onClick: handleCopyProjectLink,
    },
    {
      icon: MessageCircle,
      label: "Send message",
      onClick: onSendMessage,
      disabled: true,
    },
    {
      icon: Pin,
      label: "Pin to top",
      onClick: () => {},
      disabled: true,
      separator: true,
    },
    {
      icon: Archive,
      label: "Archive request",
      onClick: () => {},
      disabled: true,
    },
  );

  return (
    <OptionsPopover
      items={items}
      trigger={trigger}
      contentAlign="end"
      withDescriptions
      withTitles={false}
      onOpenAutoFocusPrevent
    />
  );
};

export default UserRequestsActionsPopover;
