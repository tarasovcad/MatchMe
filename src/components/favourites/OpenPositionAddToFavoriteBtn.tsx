"use client";
import React, {useEffect, useState} from "react";
import {toast} from "sonner";
import {toggleOpenPositionFavorite} from "@/actions/(favorites)/toggleOpenPositionFavorite";
import {useQueryClient, type InfiniteData} from "@tanstack/react-query";
import FavoriteToggleButton from "@/components/ui/FavoriteToggleButton";
import type {ProjectOpenPosition} from "@/types/positionFieldsTypes";

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

  useEffect(() => {
    setIsFavorited(isFavorite);
  }, [isFavorite]);

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
        queryClient.invalidateQueries({queryKey: ["project-open-positions-minimal"]});
        queryClient.invalidateQueries({queryKey: ["project-open-positions"]});

        // Soft-update any infinite lists of open positions so the button state changes in place
        queryClient.setQueriesData<InfiniteData<{items: ProjectOpenPosition[]; nextPage?: number}>>(
          {
            predicate: (q) => {
              const key = q.queryKey?.[0];
              return (
                typeof key === "string" &&
                key.startsWith("open-positions-") &&
                key.endsWith("-infinite")
              );
            },
          },
          (oldData) => {
            if (!oldData || !Array.isArray(oldData.pages)) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                items: page.items?.map((item) =>
                  item.id === positionId ? {...item, is_saved: newFavoriteStatus} : item,
                ),
              })),
            };
          },
        );

        // Also refresh saved counts for this user
        queryClient.invalidateQueries({queryKey: ["saved-counts", userId]});
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
