"use client";
import {Bookmark} from "lucide-react";
import React, {useState, useTransition} from "react";
import {Button} from "../shadcn/button";
import {motion, AnimatePresence} from "framer-motion";
import {toast} from "sonner";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import {toggleUserFavorite} from "@/actions/(favorites)/toggleUserFavorite";

interface FavoriteButtonProps {
  userId: string | undefined | null;
  favoriteUserId: string;
  isFavorite?: boolean;
}

const ProfileAddToFavoriteBtn = ({
  userId,
  favoriteUserId,
  isFavorite,
}: FavoriteButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(isFavorite);
  const handleFavoriteToggle = async () => {
    if (!userId) {
      // show the modal menu to login
      return;
    }
    startTransition(async () => {
      const result = await toggleUserFavorite(userId, favoriteUserId);
      if (result?.success) {
        setIsFavorited(!isFavorited);
        toast.success(result.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    });
  };

  return (
    <div>
      <Button
        variant={"outline"}
        size={"icon"}
        className="flex-shrink-0 h-[40px]"
        onClick={handleFavoriteToggle}>
        {isPending ? (
          <LoadingButtonCircle size={16} />
        ) : (
          <Bookmark
            size={16}
            strokeWidth={2}
            color={isFavorited ? "#d45858" : "currentColor"}
            fill={isFavorited ? "#d45858" : "transparent"}
          />
        )}
      </Button>
    </div>
  );
};

export default ProfileAddToFavoriteBtn;
