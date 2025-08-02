import React, {useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/popover";
import {cn} from "@/lib/utils";
import {Edit, X, Users, Trash2, Pin, MoreVertical} from "lucide-react";

export type OpenPositionActions = {
  onEditPosition?: () => void;
  onClosePosition?: () => void;
  onViewApplicants?: () => void;
  onDeletePosition?: () => void;
  onPinToTop?: () => void;
};

export type OpenPositionActionsPopoverProps = OpenPositionActions & {
  trigger?: React.ReactNode;
  positionStatus?: string;
};

const OpenPositionActionsPopover: React.FC<OpenPositionActionsPopoverProps> = ({
  onEditPosition,
  onClosePosition,
  onViewApplicants,
  onDeletePosition,
  onPinToTop,
  trigger,
  positionStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isClosed = positionStatus === "closed";

  const handleEditPosition = () => {
    onEditPosition?.();
    setIsOpen(false);
  };

  const handleClosePosition = () => {
    onClosePosition?.();
    setIsOpen(false);
  };

  const handleViewApplicants = () => {
    onViewApplicants?.();
    setIsOpen(false);
  };

  const handleDeletePosition = () => {
    onDeletePosition?.();
    setIsOpen(false);
  };

  const handlePinToTop = () => {
    onPinToTop?.();
    setIsOpen(false);
  };

  const menuItems: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    accent?: boolean;
    disabled?: boolean;
  }[] = [
    {icon: Edit, label: "Edit position", onClick: handleEditPosition},
    {
      icon: X,
      label: isClosed ? "Reopen position" : "Close position",
      onClick: handleClosePosition,
    },
    {icon: Users, label: "View applicants", onClick: handleViewApplicants},
    {icon: Pin, label: "Pin to top", onClick: handlePinToTop},
    {
      icon: Trash2,
      label: "Delete position",
      onClick: handleDeletePosition,
      accent: true,
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

export default OpenPositionActionsPopover;
