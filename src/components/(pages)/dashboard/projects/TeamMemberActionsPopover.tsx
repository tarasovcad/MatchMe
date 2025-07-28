import React, {useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/popover";
import {cn} from "@/lib/utils";
import {Eye, Copy, Shield, Trash2, MessageCircle, MoreVertical} from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);
  const isOwner = roleBadgeName === "Owner";

  const handleViewProfile = () => {
    onViewProfile?.();
    setIsOpen(false);
  };

  const handleCopyProfileLink = () => {
    onCopyProfileLink?.();
    setIsOpen(false);
  };

  const handleChangeRole = () => {
    onChangeRole?.();
    setIsOpen(false);
  };

  const handleSendDirectMessage = () => {
    onSendDirectMessage?.();
    setIsOpen(false);
  };

  const handleRemoveFromProject = () => {
    onRemoveFromProject?.();
    setIsOpen(false);
  };

  const menuItems: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    accent?: boolean;
    disabled?: boolean;
  }[] = [
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
          {menuItems.map(({icon: Icon, label, onClick, accent, disabled}, idx) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => onClick?.()}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-[5px] rounded-[5px] text-sm hover:bg-muted transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed",
                accent && "text-red-600 hover:text-red-700",
                idx === menuItems.length - 1 && "text-red-600 hover:text-red-700",
                idx === menuItems.length - 2 && "border-b border-border rounded-b-none",
              )}>
              <Icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TeamMemberActionsPopover;
