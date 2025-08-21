"use client";
import {Bookmark} from "lucide-react";
import React, {useState, useTransition} from "react";
import {toast} from "sonner";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import {toggleUserFavorite} from "@/actions/(favorites)/toggleUserFavorite";
import {useQueryClient} from "@tanstack/react-query";
import FavoriteToggleButton from "@/components/ui/FavoriteToggleButton";

interface FavoriteButtonProps {
  userId: string | undefined | null;
  favoriteUserId: string;
  isFavorite?: boolean;
}

const ProfileAddToFavoriteBtn = ({userId, favoriteUserId, isFavorite}: FavoriteButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(isFavorite);
  const [hasInteracted, setHasInteracted] = useState(false);

  // React Query client for cache invalidation
  const queryClient = useQueryClient();

  const handleFavoriteToggle = async () => {
    if (!userId) {
      // if not authenticated, dont execute the function
      return;
    }
    setHasInteracted(true);
    startTransition(async () => {
      const result = await toggleUserFavorite(userId, favoriteUserId);
      if (result?.success) {
        const newFavoriteStatus = !isFavorited;
        setIsFavorited(newFavoriteStatus);
        toast.success(result.message);

        //  Update specific queries to refresh the list
        // Update favorites list immediately
        queryClient.setQueryData(
          ["profiles-favorites", userId],
          (oldData: string[] | undefined) => {
            if (!oldData) return [];
            if (newFavoriteStatus) {
              return [...oldData, favoriteUserId];
            } else {
              return oldData.filter((id) => id !== favoriteUserId);
            }
          },
        );

        // Update saved counts immediately
        queryClient.setQueryData(
          ["saved-counts", userId],
          (oldData: {profiles: number} | undefined) => {
            if (!oldData) return {profiles: newFavoriteStatus ? 1 : 0};
            return {
              profiles: newFavoriteStatus
                ? oldData.profiles + 1
                : Math.max(0, oldData.profiles - 1),
            };
          },
        );

        // Invalidate only specific saved profiles infinite queries to refetch the list
        queryClient.invalidateQueries({
          queryKey: ["profiles-infinite"],
          predicate: (query) => {
            const queryKey = query.queryKey as string[];
            return queryKey.includes("saved-profiles") || queryKey.includes("profiles-saved");
          },
        });
      } else {
        toast.error("An error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="relative">
      <FavoriteToggleButton
        isFavorited={isFavorited}
        isPending={isPending}
        onToggle={handleFavoriteToggle}
        size="icon"
        variant="outline"
        showLabel={false}
      />
    </div>
  );
};

export default ProfileAddToFavoriteBtn;
