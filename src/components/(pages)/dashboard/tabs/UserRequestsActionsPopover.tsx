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
  onResendApplication?: () => void;
  onSendMessage?: () => void;
  onViewProject?: () => void;
  onCopyProjectLink?: () => void;
};

export type UserRequestsActionsPopoverProps = UserRequestActions & {
  requestDirection: "invite" | "application";
  requestStatus: "pending" | "accepted" | "rejected" | "cancelled";
  projectSlug: string;
  nextAllowedAt?: string | null;
  isManageProcessing?: boolean;
  isSubmitProcessing?: boolean;
  trigger?: React.ReactNode;
};

const UserRequestsActionsPopover: React.FC<UserRequestsActionsPopoverProps> = ({
  requestDirection,
  requestStatus,
  projectSlug,
  nextAllowedAt,
  isManageProcessing = false,
  isSubmitProcessing = false,
  onAcceptInvite,
  onRejectInvite,
  onCancelApplication,
  onResendApplication,
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

  // Cooldown state for applications (re-apply flow)
  const now = typeof window !== "undefined" ? new Date() : null;
  const nextAtDate = nextAllowedAt ? new Date(nextAllowedAt) : null;
  const isCoolingDown = !!(nextAtDate && now && nextAtDate.getTime() > now.getTime());
  const canResendApplication = isApplication && !isPending && !isCoolingDown;

  // Descriptions
  let resendAppDescription: string | undefined = undefined;
  if (isApplication) {
    if (isCoolingDown && nextAtDate) {
      const dateStr = formatDateAbsolute(nextAtDate.toISOString());
      resendAppDescription = `You can re-apply on ${dateStr}. A short pause after a ${requestStatus === "cancelled" ? "withdrawal" : "decline"} keeps things considerate.`;
    } else if (canResendApplication) {
      resendAppDescription = "You can send a new application now.";
    }
  }

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

  // Application actions for the user
  if (isApplication) {
    // Re-apply path only for rejected/cancelled applications (respect cool-off)
    if (requestStatus === "rejected" || requestStatus === "cancelled") {
      items.push({
        icon: RefreshCw,
        label: "Resend application",
        onClick: onResendApplication,
        description: resendAppDescription,
        disabled: !canResendApplication || isSubmitProcessing,
        separator: true,
      });
    }

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
    />
  );
};

export default UserRequestsActionsPopover;
