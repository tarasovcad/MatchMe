"use client";

import React, {useMemo} from "react";
import {Button} from "@/components/shadcn/button";
import {Bookmark} from "lucide-react";
import {motion, AnimatePresence, Variants} from "framer-motion";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import {cn} from "@/lib/utils";

export type FavoriteToggleButtonProps = {
  isFavorited: boolean | undefined;
  isPending?: boolean;
  onToggle: () => void;
  className?: string;
  size?: "icon" | "xs" | "sm" | "default";
  variant?: "outline" | "secondary" | "default";
  labelWhenEmpty?: string;
  labelWhenFilled?: string;
  showLabel?: boolean;
  disabled?: boolean;
};

// Hook that provides the animation variants and particles - shared between button and icon-only versions
export function useFavoriteToggleAnimations() {
  const [iconVariants, fillVariants, burstVariants] = useMemo(() => {
    const iconVariants: Variants = {
      initial: {scale: 1},
      favorite: {
        scale: [1, 1.3, 1],
        transition: {duration: 0.5, times: [0, 0.3, 1], ease: "easeInOut"},
      },
      unfavorite: {
        scale: [1, 0.8, 1],
        transition: {duration: 0.4, times: [0, 0.2, 1], ease: "easeIn"},
      },
      tap: {scale: 0.9},
    };
    const fillVariants = {
      unfilled: {fill: "transparent", transition: {duration: 0.3}},
      filled: {fill: "#d45858", transition: {duration: 0.3}},
    } as const;
    const burstVariants: Variants = {
      initial: {scale: 0, opacity: 0},
      animate: {
        scale: [0, 1.5, 0],
        opacity: [0, 0.7, 0],
        transition: {duration: 0.6, ease: "easeOut"},
      },
    };
    return [iconVariants, fillVariants, burstVariants];
  }, []);

  const particles = useMemo(
    () =>
      [...Array(6)].map((_, i) => {
        const angle = (i / 6) * (2 * Math.PI);
        const distance = 20 + Math.random() * 10;
        const particleVariants: Variants = {
          initial: {x: 0, y: 0, scale: 0, opacity: 0},
          animate: {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            scale: [0, 0.8 + Math.random() * 0.4, 0],
            opacity: [0, 0.8, 0],
            transition: {duration: 0.6 + Math.random() * 0.2, delay: i * 0.03, ease: "easeOut"},
          },
        };
        return (
          <motion.div
            key={i}
            className="top-1/2 left-1/2 absolute bg-red-400 rounded-full"
            style={{
              width: `${3 + Math.random() * 2}px`,
              height: `${3 + Math.random() * 2}px`,
              transform: "translate(-50%, -50%)",
            }}
            animate="animate"
            exit={{opacity: 0, scale: 0}}
            variants={particleVariants}
          />
        );
      }),
    [],
  );

  return {iconVariants, fillVariants, burstVariants, particles};
}

// Icon-only version for use in contexts where a button wrapper already exists (like OptionsPopover)
export function FavoriteToggleIcon({
  isFavorited,
  isPending,
  className,
}: {
  isFavorited: boolean | undefined;
  isPending?: boolean;
  className?: string;
}) {
  const {iconVariants, fillVariants, burstVariants, particles} = useFavoriteToggleAnimations();

  if (isPending) {
    return (
      <div className={cn("w-4 h-4", className)}>
        <LoadingButtonCircle size={16} />
      </div>
    );
  }

  return (
    <motion.div
      className={cn("relative w-4 h-4", className)}
      initial={false}
      animate={isFavorited ? "favorite" : "unfavorite"}
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
      <Bookmark
        size={16}
        strokeWidth={2}
        color={isFavorited ? "#d45858" : "currentColor"}
        className="relative z-10"
        style={{fill: "transparent"}}
      />
      <AnimatePresence>
        {isFavorited && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(212,88,88,0.4) 0%, rgba(212,88,88,0) 80%)",
              }}
              initial={false}
              animate="animate"
              exit={{opacity: 0, scale: 0}}
              variants={burstVariants}
            />
            <motion.div className="absolute inset-0 pointer-events-none">{particles}</motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FavoriteToggleButton({
  isFavorited,
  isPending,
  onToggle,
  className,
  size = "icon",
  variant = "outline",
  labelWhenEmpty = "Add to favorites",
  labelWhenFilled = "Remove from favorites",
  showLabel = false,
  disabled,
}: FavoriteToggleButtonProps) {
  const {iconVariants, fillVariants, burstVariants, particles} = useFavoriteToggleAnimations();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("relative overflow-visible", className)}
      onClick={onToggle}
      disabled={isPending || disabled}>
      <div className={cn("flex items-center gap-2", size === "icon" && "h-[40px]")}>
        {isPending ? (
          <div className="w-4 h-4">
            <LoadingButtonCircle size={16} />
          </div>
        ) : (
          <motion.div
            className="relative"
            initial={false}
            animate={isFavorited ? "favorite" : "unfavorite"}
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
            <Bookmark
              size={16}
              strokeWidth={2}
              color={isFavorited ? "#d45858" : "currentColor"}
              className="relative z-10"
              style={{fill: "transparent"}}
            />
            <AnimatePresence>
              {isFavorited && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(212,88,88,0.4) 0%, rgba(212,88,88,0) 80%)",
                    }}
                    initial={false}
                    animate="animate"
                    exit={{opacity: 0, scale: 0}}
                    variants={burstVariants}
                  />
                  <motion.div className="absolute inset-0 pointer-events-none">
                    {particles}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}
        {showLabel && <span>{isFavorited ? labelWhenFilled : labelWhenEmpty}</span>}
      </div>
    </Button>
  );
}
