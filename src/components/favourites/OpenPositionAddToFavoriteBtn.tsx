"use client";
import React, {useState} from "react";
import {toast} from "sonner";
import {toggleOpenPositionFavorite} from "@/actions/(favorites)/toggleOpenPositionFavorite";
import {useQueryClient} from "@tanstack/react-query";
import FavoriteToggleButton from "@/components/ui/FavoriteToggleButton";

interface OpenPositionFavoriteButtonProps {
  userId: string | undefined | null;
  positionId: string;
  isFavorite?: boolean;
  size?: "icon" | "xs" | "sm" | "default";
  variant?: "outline" | "secondary" | "default";
  showLabel?: boolean;
  labelWhenEmpty?: string;
  labelWhenFilled?: string;
  className?: string;
}

const OpenPositionAddToFavoriteBtn = ({
  userId,
  positionId,
  isFavorite,
  size = "xs",
  variant = "outline",
  showLabel = false,
  labelWhenEmpty = "Add to favorites",
  labelWhenFilled = "Remove from favorites",
  className,
}: OpenPositionFavoriteButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(isFavorite);

  // React Query client for cache invalidation
  const queryClient = useQueryClient();

  const handleFavoriteToggle = async () => {
    if (!userId) {
      // if not authenticated, dont execute the function
      return;
    }
    setIsLoading(true);
    try {
      const result = await toggleOpenPositionFavorite(userId, positionId);
      if (result?.success) {
        const newFavoriteStatus = !isFavorited;
        setIsFavorited(newFavoriteStatus);
        toast.success(result.message);

        // Update open positions queries to refresh is_saved flags
        queryClient.invalidateQueries({
          queryKey: ["project-open-positions-minimal"],
        });

        // Update any other relevant queries that might cache position favorites
        queryClient.invalidateQueries({
          queryKey: ["project-open-positions"],
        });
      } else {
        toast.error(result?.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FavoriteToggleButton
      isFavorited={isFavorited}
      isPending={isLoading}
      onToggle={handleFavoriteToggle}
      size={size}
      variant={variant}
      showLabel={showLabel}
      labelWhenEmpty={labelWhenEmpty}
      labelWhenFilled={labelWhenFilled}
      className={className}
    />
  );
};

export default OpenPositionAddToFavoriteBtn;
