import React, {useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/popover";
import {cn} from "@/lib/utils";
import {
  MoreVertical,
  Check,
  X,
  Eye,
  MessageCircle,
  Copy,
  Trash2,
  RefreshCw,
  UserX,
  Pin,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "lucide-react";
import {toast} from "sonner";

export type ProjectRequestActions = {
  onAcceptRequest?: () => void;
  onRejectRequest?: () => void;
  onCancelInvitation?: () => void;
  onResendInvitation?: () => void;
  onDeleteRequest?: () => void;
  onSendMessage?: () => void;
  onViewProfile?: () => void;
  onCopyProfileLink?: () => void;
};

export type ProjectRequestsActionsPopoverProps = ProjectRequestActions & {
  requestDirection: "invite" | "application";
  requestStatus: "pending" | "accepted" | "rejected" | "cancelled";
  userName: string;
  userUsername: string;
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
  onDeleteRequest,
  onSendMessage,
  onViewProfile,
  onCopyProfileLink,
  trigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile();
    } else {
      window.open(`/profiles/${userUsername}`, "_blank");
    }
    setIsOpen(false);
  };

  const handleCopyProfileLink = () => {
    if (onCopyProfileLink) {
      onCopyProfileLink();
    } else {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      navigator.clipboard.writeText(`${origin}/profiles/${userUsername}`);
      toast.success("Profile link copied to clipboard");
    }
    setIsOpen(false);
  };

  const handleSendMessage = () => {
    onSendMessage?.();
    setIsOpen(false);
  };

  const handleAcceptRequest = () => {
    onAcceptRequest?.();
    toast.success(`${userName}'s request has been accepted`);
    setIsOpen(false);
  };

  const handleRejectRequest = () => {
    onRejectRequest?.();
    toast.success(`${userName}'s request has been rejected`);
    setIsOpen(false);
  };

  const handleCancelInvitation = () => {
    onCancelInvitation?.();
    toast.success(`Invitation to ${userName} has been cancelled`);
    setIsOpen(false);
  };

  const handleResendInvitation = () => {
    onResendInvitation?.();
    toast.success(`Invitation resent to ${userName}`);
    setIsOpen(false);
  };

  const handleDeleteRequest = () => {
    onDeleteRequest?.();
    toast.success("Request removed");
    setIsOpen(false);
  };

  const isReceived = requestDirection === "application";
  const isSent = requestDirection === "invite";
  const isPending = requestStatus === "pending";

  const menuItems: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    accent?: boolean;
    disabled?: boolean;
    separator?: boolean;
  }[] = [];

  // Actions for Received Applications (someone wants to join)
  if (isReceived && isPending) {
    menuItems.push(
      {icon: ThumbsUpIcon, label: "Accept request", onClick: handleAcceptRequest},
      {
        icon: ThumbsDownIcon,
        label: "Reject request",
        onClick: handleRejectRequest,
        separator: true,
      },
    );
  }

  // Actions for Sent Invitations (you invited someone)
  if (isSent && isPending) {
    menuItems.push(
      {icon: RefreshCw, label: "Resend invitation", onClick: handleResendInvitation},
      {
        icon: UserX,
        label: "Cancel invitation",
        onClick: handleCancelInvitation,
        separator: true,
      },
    );
  }

  menuItems.push(
    {icon: Eye, label: "View profile", onClick: handleViewProfile},
    {icon: Copy, label: "Copy profile link", onClick: handleCopyProfileLink},
    {icon: Pin, label: "Pin to top", onClick: () => {}, disabled: true},

    {
      icon: MessageCircle,
      label: "Send message",
      onClick: handleSendMessage,
      disabled: true,
      separator: true,
    },
    {
      icon: Trash2,
      label: "Delete request",
      onClick: handleDeleteRequest,
      accent: true,
    },
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button type="button" className="p-1 rounded hover:bg-muted cursor-pointer leading-none">
            <MoreVertical className="w-4 h-4 transition-all duration-200 text-muted-foreground group-hover:text-foreground/60" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px] rounded-[8px] text-foreground/90" align="end">
        <div className="py-1 px-1">
          {menuItems.map(({icon: Icon, label, onClick, accent, disabled, separator}) => (
            <div key={label}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onClick?.()}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-[5px] rounded-[5px] text-sm hover:bg-muted transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed",
                  accent && "text-red-600 hover:text-red-700",
                )}>
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{label}</span>
              </button>
              {separator && <div className="h-px bg-border my-1" />}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProjectRequestsActionsPopover;
