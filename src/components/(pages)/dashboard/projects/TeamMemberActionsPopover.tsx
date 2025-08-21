import React from "react";
import {Eye, Copy, Shield, Trash2, MessageCircle} from "lucide-react";
import OptionsPopover, {OptionsPopoverItem} from "@/components/ui/options/OptionsPopover";

export type TeamMemberActions = {
  onViewProfile?: () => void;
  onCopyProfileLink?: () => void;
  onChangeRole?: () => void;
  onRemoveFromProject?: () => void;
  onSendDirectMessage?: () => void;
};

export type TeamMemberActionsPopoverProps = TeamMemberActions & {
  trigger?: React.ReactNode;
  roleBadgeName?: string;
};

const TeamMemberActionsPopover: React.FC<TeamMemberActionsPopoverProps> = ({
  onViewProfile,
  onCopyProfileLink,
  onChangeRole,
  onRemoveFromProject,
  onSendDirectMessage,
  trigger,
  roleBadgeName,
}) => {
  const isOwner = roleBadgeName === "Owner";

  const handleViewProfile = () => {
    onViewProfile?.();
  };

  const handleCopyProfileLink = () => {
    onCopyProfileLink?.();
  };

  const handleChangeRole = () => {
    onChangeRole?.();
  };

  const handleSendDirectMessage = () => {
    onSendDirectMessage?.();
  };

  const handleRemoveFromProject = () => {
    onRemoveFromProject?.();
  };

  const items: OptionsPopoverItem[] = [
    {icon: Eye, label: "View profile", onClick: handleViewProfile},
    {icon: Copy, label: "Copy profile link", onClick: handleCopyProfileLink},
    {icon: Shield, label: "Change role", onClick: handleChangeRole, disabled: isOwner},
    {
      icon: MessageCircle,
      label: "Send direct message",
      onClick: handleSendDirectMessage,
      disabled: true,
    },
    {
      icon: Trash2,
      label: "Remove from project",
      onClick: handleRemoveFromProject,
      accent: true,
      disabled: isOwner,
    },
  ];

  return <OptionsPopover items={items} trigger={trigger} contentAlign="end" />;
};

export default TeamMemberActionsPopover;
