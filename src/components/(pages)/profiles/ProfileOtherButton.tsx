"use client";
import {Ban, Bookmark, Ellipsis, Flag, Share2} from "lucide-react";
import {Button} from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {motion, Variants} from "framer-motion";
import {itemDropdownVariants, menuVariants} from "@/utils/other/variants";
import {useState, useTransition} from "react";
import {toggleUserFavorite} from "@/actions/(favorites)/toggleUserFavorite";
import {toast} from "sonner";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import {cn} from "@/lib/utils";
import {postProfileInteraction} from "@/actions/profiles/profileInteractions";

export default function ProfileOtherButton({
  userId,
  profileId,
  isFavorite = false,
  buttonClassName,
}: {
  userId: string | undefined | null;
  profileId: string;
  isFavorite?: boolean;
  buttonClassName?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(isFavorite);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleFavoriteToggle = async () => {
    if (!userId) return;

    setHasInteracted(true);
    startTransition(async () => {
      const result = await toggleUserFavorite(userId, profileId);
      if (result?.success) {
        setIsFavorited(!isFavorited);
        toast.success(result.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    });
  };

  const iconVariants: Variants = {
    initial: {scale: 1},
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} className={cn("h-[38px]", buttonClassName)}>
          <Ellipsis size={18} strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent asChild side="bottom" align="center" sideOffset={4}>
        <motion.div
          initial="closed"
          animate="open"
          variants={menuVariants}
          className="space-y-2 rounded-lg min-w-[160px]">
          <DropdownMenuGroup>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className="relative cursor-pointer"
                onClick={handleFavoriteToggle}
                disabled={isPending}>
                {isPending ? (
                  <>
                    <div className="opacity-60 w-4 h-4">
                      <LoadingButtonCircle size={16} />
                    </div>
                    {isFavorited ? "Remove from favorites" : "Add to favorites"}
                  </>
                ) : (
                  <>
                    <motion.div
                      className="relative"
                      initial="initial"
                      animate={
                        hasInteracted ? (isFavorited ? "favorite" : "unfavorite") : "initial"
                      }
                      whileTap="tap"
                      variants={iconVariants}>
                      <Bookmark
                        size={16}
                        className="opacity-60"
                        aria-hidden="true"
                        fill={isFavorited ? "#d45858" : "transparent"}
                        color={isFavorited ? "#d45858" : "currentColor"}
                      />
                    </motion.div>
                    {isFavorited ? "Remove from favorites" : "Add to favorites"}
                  </>
                )}
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  if (userId) {
                    postProfileInteraction(profileId, userId, "share");
                  }
                }}>
                <Share2 size={16} className="opacity-60" aria-hidden="true" />
                Share Profile
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  if (userId) {
                    postProfileInteraction(profileId, userId, "report");
                  }
                }}>
                <Flag size={16} className="opacity-60" aria-hidden="true" />
                Report User
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  if (userId) {
                    postProfileInteraction(profileId, userId, "block");
                  }
                }}>
                <Ban size={16} className="opacity-60" aria-hidden="true" />
                Block User
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuGroup>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
