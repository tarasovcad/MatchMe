import React from "react";
import {Edit, Users, Trash2, Pin} from "lucide-react";
import OptionsPopover, {OptionsPopoverItem} from "@/components/ui/options/OptionsPopover";

export type OpenPositionActions = {
  onEditPosition?: () => void;
  onViewApplicants?: () => void;
  onDeletePosition?: () => void;
  onPinToTop?: () => void;
};

export type OpenPositionActionsPopoverProps = OpenPositionActions & {
  trigger?: React.ReactNode;
};

const OpenPositionActionsPopover: React.FC<OpenPositionActionsPopoverProps> = ({
  onEditPosition,
  onViewApplicants,
  onDeletePosition,
  onPinToTop,
  trigger,
}) => {
  const handleEditPosition = () => {
    onEditPosition?.();
  };

  const handleViewApplicants = () => {
    onViewApplicants?.();
  };

  const handleDeletePosition = () => {
    onDeletePosition?.();
  };

  const handlePinToTop = () => {
    onPinToTop?.();
  };

  const items: OptionsPopoverItem[] = [
    {icon: Edit, label: "Edit position", onClick: handleEditPosition},
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
    <OptionsPopover
      items={items}
      trigger={trigger}
      contentAlign="end"
      contentClassName="p-0 w-[200px] rounded-[8px] text-foreground/90"
    />
  );
};

export default OpenPositionActionsPopover;
