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
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleFavoriteToggle = async () => {
    if (!userId) {
      // show the modal menu to login
      return;
    }
    setHasInteracted(true);
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

  // Animation variants
  const iconVariants = {
    initial: {scale: 1},
    favorite: {
      scale: [1, 1.3, 1],
      transition: {
        duration: 0.5,
        times: [0, 0.3, 1],
        ease: "easeInOut",
      },
    },
    unfavorite: {
      scale: [1, 0.8, 1],
      transition: {
        duration: 0.4,
        times: [0, 0.2, 1],
        ease: "easeIn",
      },
    },
    tap: {scale: 0.9},
  };

  const fillVariants = {
    unfilled: {
      fill: "transparent",
      transition: {duration: 0.3},
    },
    filled: {
      fill: "#d45858",
      transition: {duration: 0.3},
    },
  };

  const burstVariants = {
    initial: {scale: 0, opacity: 0},
    animate: {
      scale: [0, 1.5, 0],
      opacity: [0, 0.7, 0],
      transition: {duration: 0.6, ease: "easeOut"},
    },
  };

  const particleVariants = (index: number) => {
    const angle = (index / 6) * (2 * Math.PI);
    const distance = 20 + Math.random() * 10;
    return {
      initial: {x: 0, y: 0, scale: 0, opacity: 0},
      animate: {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: [0, 0.8 + Math.random() * 0.4, 0],
        opacity: [0, 0.8, 0],
        transition: {
          duration: 0.6 + Math.random() * 0.2,
          delay: index * 0.03,
          ease: "easeOut",
        },
      },
    };
  };

  return (
    <div className="relative">
      <Button
        variant={"outline"}
        size={"icon"}
        className="relative flex-shrink-0 h-[40px] overflow-visible"
        onClick={handleFavoriteToggle}
        disabled={isPending}>
        {isPending ? (
          <LoadingButtonCircle size={16} />
        ) : (
          <motion.div
            className="relative"
            initial="initial"
            animate={
              hasInteracted
                ? isFavorited
                  ? "favorite"
                  : "unfavorite"
                : "initial"
            }
            whileTap="tap"
            variants={iconVariants}>
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={isFavorited ? "filled" : "unfilled"}
              variants={fillVariants}>
              <Bookmark
                size={16}
                strokeWidth={1}
                color={isFavorited ? "#d45858" : "currentColor"}
                fill="inherit"
              />
            </motion.div>

            {/* Visible bookmark outline */}
            <Bookmark
              size={16}
              strokeWidth={2}
              color={isFavorited ? "#d45858" : "currentColor"}
              className="z-10 relative"
              style={{fill: "transparent"}}
            />

            {/* Animation effects */}
            <AnimatePresence>
              {isFavorited && hasInteracted && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(212,88,88,0.4) 0%, rgba(212,88,88,0) 80%)",
                    }}
                    initial="initial"
                    animate="animate"
                    exit={{opacity: 0, scale: 0}}
                    variants={burstVariants}
                  />

                  <motion.div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="top-1/2 left-1/2 absolute bg-red-400 rounded-full w-1 h-1"
                        style={{
                          width: `${3 + Math.random() * 2}px`,
                          height: `${3 + Math.random() * 2}px`,
                          transform: "translate(-50%, -50%)",
                        }}
                        initial="initial"
                        animate="animate"
                        exit={{opacity: 0, scale: 0}}
                        variants={particleVariants(i)}
                      />
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </Button>
    </div>
  );
};

export default ProfileAddToFavoriteBtn;
