"use client";
import {Ban, Bookmark, Ellipsis, Flag, UserPlus} from "lucide-react";
import {Button} from "@/components/shadcn/button";
import {motion, Variants} from "framer-motion";
import {useState, useTransition, useEffect} from "react";
import {toggleProjectFavorite} from "@/actions/(favorites)/toggleProjectFavorite";
import {toast} from "sonner";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import {cn} from "@/lib/utils";
import {postProfileInteraction} from "@/actions/profiles/profileInteractions";
import OptionsPopover, {OptionsPopoverItem} from "@/components/ui/options/OptionsPopover";

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
  const [animationState, setAnimationState] = useState<"idle" | "favorite" | "unfavorite">("idle");

  useEffect(() => {
    if (animationState !== "idle") {
      const timer = setTimeout(() => {
        setAnimationState("idle");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animationState]);

  const handleFavoriteToggle = async () => {
    if (!userId) return;

    startTransition(async () => {
      const result = await toggleProjectFavorite(userId, projectId);
      if (result?.success) {
        const newFavoriteState = !isFavorited;
        setIsFavorited(newFavoriteState);
        // Trigger animation based on the new state
        setAnimationState(newFavoriteState ? "favorite" : "unfavorite");
        toast.success(result.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    });
  };

  const iconVariants: Variants = {
    idle: {scale: 1},
    favorite: {
      scale: [1, 1.3, 1],
      transition: {
        duration: 0.5,
        times: [0, 0.3, 1],
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    unfavorite: {
      scale: [1, 0.8, 1],
      transition: {
        duration: 0.4,
        times: [0, 0.2, 1],
        ease: [0.42, 0, 1, 1],
      },
    },
    tap: {scale: 0.9},
  };

  // Custom favorite icon component with loading state and animations
  const FavoriteIcon = () => {
    if (isPending) {
      return (
        <div className="w-4 h-4 opacity-60">
          <LoadingButtonCircle size={16} />
        </div>
      );
    }

    return (
      <motion.div
        className="relative w-4 h-4"
        animate={animationState}
        whileTap="tap"
        variants={iconVariants}>
        <Bookmark
          size={16}
          aria-hidden="true"
          fill={isFavorited ? "#d45858" : "transparent"}
          color={isFavorited ? "#d45858" : "currentColor"}
        />
      </motion.div>
    );
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
