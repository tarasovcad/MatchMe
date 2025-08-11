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
import {toast} from "sonner";
import OptionsPopover, {OptionsPopoverItem} from "@/components/ui/options/OptionsPopover";
import {formatDateAbsolute} from "@/functions/formatDate";

export type ProjectRequestActions = {
  onAcceptRequest?: () => void;
  onRejectRequest?: () => void;
  onCancelInvitation?: () => void;
  onResendInvitation?: () => void;
  onReinvite?: () => void;
  onSendMessage?: () => void;
  onViewProfile?: () => void;
  onCopyProfileLink?: () => void;
};

export type ProjectRequestsActionsPopoverProps = ProjectRequestActions & {
  requestDirection: "invite" | "application";
  requestStatus: "pending" | "accepted" | "rejected" | "cancelled";
  userName: string;
  userUsername: string;
  resendCount?: number;
  nextAllowedAt?: string | null;
  trigger?: React.ReactNode;
};

const ProjectRequestsActionsPopover: React.FC<ProjectRequestsActionsPopoverProps> = ({
  requestDirection,
  requestStatus,
  userName,
  userUsername,
  onAcceptRequest,
  onRejectRequest,
  onCancelInvitation,
  onResendInvitation,
  onReinvite,
  onSendMessage,
  onViewProfile,
  onCopyProfileLink,
  resendCount = 0,
  nextAllowedAt,
  trigger,
}) => {
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile();
    } else {
      window.open(`/profiles/${userUsername}`, "_blank");
    }
  };

  const handleCopyProfileLink = () => {
    if (onCopyProfileLink) {
      onCopyProfileLink();
    } else {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      navigator.clipboard.writeText(`${origin}/profiles/${userUsername}`);
      toast.success("Profile link copied to clipboard");
    }
  };

  const handleSendMessage = () => {
    onSendMessage?.();
  };

  const handleAcceptRequest = () => {
    onAcceptRequest?.();
    toast.success(`${userName}'s request has been accepted`);
  };

  const handleRejectRequest = () => {
    onRejectRequest?.();
    toast.success(`${userName}'s request has been rejected`);
  };

  const handleCancelInvitation = () => {
    onCancelInvitation?.();
    toast.success(`Invitation to ${userName} has been cancelled`);
  };

  const handleResendInvitation = () => {
    onResendInvitation?.();
  };

  const handleReinvite = () => {
    onReinvite?.();
  };

  const handleArchiveRequest = () => {
    // TODO: implement archive when backend is ready
    console.log("Archive request for:", userUsername);
  };

  const isReceived = requestDirection === "application";
  const isSent = requestDirection === "invite";
  const isPending = requestStatus === "pending";

  // Resend availability and description
  const now = typeof window !== "undefined" ? new Date() : null;
  const nextAtDate = nextAllowedAt ? new Date(nextAllowedAt) : null;
  const isOverLimit = resendCount >= 5;
  const isCoolingDown = !!(nextAtDate && now && nextAtDate.getTime() > now.getTime());
  const canResend = isSent && isPending && !isOverLimit && !isCoolingDown;

  const getResendWaitText = (count: number): string => {
    if (count <= 0)
      return "You can try again in 24 hours. A short pause helps avoid accidental double-sends.";
    if (count === 1) return "Please check back in 3 days. Extra time helps the recipient respond.";
    if (count === 2 || count === 3 || count === 4)
      return "You’ll be able to resend in 7 days. At this stage, resends are limited to weekly to keep outreach respectful and effective.";
    return "Resend limit reached for this invite.";
  };

  const getNextWindowAfterText = (count: number): string => {
    if (count <= 0) return "3 days";
    if (count === 1) return "7 days";
    if (count === 2 || count === 3) return "7 days";
    return "a long time";
  };

  let resendDescription: string | undefined = undefined;
  if (isOverLimit) {
    resendDescription =
      "Resend limit reached. Further resends aren’t available for this invite. The counter will reset only if the user applies to your project.";
  } else if (isCoolingDown) {
    resendDescription = getResendWaitText(resendCount);
  } else if (canResend) {
    const nextAfter = getNextWindowAfterText(resendCount);
    resendDescription =
      resendCount >= 4
        ? "You can resend the invitation now. After this attempt, the next resend will not be available."
        : `You can resend the invitation now. After this attempt, the next resend will be available in ${nextAfter}.`;
  }

  const items: OptionsPopoverItem[] = [];

  if (isReceived && isPending) {
    items.push(
      {
        icon: ThumbsUpIcon,
        label: "Accept request",
        onClick: handleAcceptRequest,
        description: "Accept this application and add the user to your project team.",
      },
      {
        icon: ThumbsDownIcon,
        label: "Reject request",
        onClick: handleRejectRequest,
        separator: true,
      },
    );
  }

  if (isSent && isPending) {
    items.push(
      {
        icon: RefreshCw,
        label: "Resend invitation",
        onClick: handleResendInvitation,
        description: resendDescription,
        disabled: !canResend,
      },
      {
        icon: UserX,
        label: "Cancel invitation",
        onClick: handleCancelInvitation,
        separator: true,
      },
    );
  }

  // Re-invite path for declined invites (respect 30-day cool-off)
  if (isSent && requestStatus === "rejected") {
    const canReinvite = !isCoolingDown;
    const reinviteDescription =
      isCoolingDown && nextAtDate
        ? `You can re-invite on ${formatDateAbsolute(nextAtDate.toISOString())}. A short pause after a decline keeps things considerate.`
        : "";

    items.push({
      icon: RefreshCw,
      label: "Re-invite",
      onClick: handleReinvite,
      description: reinviteDescription,
      disabled: !canReinvite,
      separator: true,
    });
  }

  items.push(
    {
      icon: Eye,
      label: "View profile",
      onClick: handleViewProfile,
    },
    {
      icon: Copy,
      label: "Copy profile link",
      onClick: handleCopyProfileLink,
    },
    {
      icon: Pin,
      label: "Pin to top",
      onClick: () => {},
      disabled: true,
    },
    {
      icon: MessageCircle,
      label: "Send message",
      onClick: handleSendMessage,
      disabled: true,
      separator: true,
    },
    {
      icon: Archive,
      label: "Archive request",
      onClick: handleArchiveRequest,
      disabled: isPending,
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

export default ProjectRequestsActionsPopover;
