"use client";
import {Ban, Ellipsis, Flag} from "lucide-react";
import {Button} from "@/components/shadcn/button";
import {useState, useTransition} from "react";
import {toggleProjectFavorite} from "@/actions/(favorites)/toggleProjectFavorite";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import OptionsPopover, {OptionsPopoverItem} from "@/components/ui/options/OptionsPopover";
import {FavoriteToggleIcon} from "@/components/ui/FavoriteToggleButton";

export default function ProjectOtherButton({
  userId,
  projectId,
  isFavorite = false,
  buttonClassName,
}: {
  userId: string | undefined | null;
  projectId: string;
  isFavorite?: boolean;
  buttonClassName?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(isFavorite);

  const handleFavoriteToggle = async () => {
    if (!userId) return;

    startTransition(async () => {
      const result = await toggleProjectFavorite(userId, projectId);
      if (result?.success) {
        setIsFavorited(!isFavorited);
        toast.success(result.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    });
  };

  const FavoriteIcon = () => {
    return <FavoriteToggleIcon isFavorited={isFavorited} isPending={isPending} />;
  };

  const options: OptionsPopoverItem[] = [
    {
      icon: FavoriteIcon,
      label: isFavorited ? "Remove from favorites" : "Add to favorites",
      onClick: handleFavoriteToggle,
      disabled: isPending,
      keepOpenOnClick: true,
    },
    {
      icon: Flag,
      label: "Report",
      disabled: true,
      description: "This feature is not available yet",
    },
    {
      icon: Ban,
      label: "Block",
      disabled: true,
      description: "This feature is not available yet",
    },
  ];

  return (
    <div className={cn("flex items-center gap-3", buttonClassName)}>
      <OptionsPopover
        items={options}
        withTitles={false}
        withDescriptions
        trigger={
          <Button size="icon" variant="outline" className="w-9 h-9">
            <Ellipsis className="w-4 h-4" />
          </Button>
        }
      />
    </div>
  );
}
