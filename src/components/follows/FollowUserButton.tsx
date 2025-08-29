"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState} from "react";
import {Button} from "../shadcn/button";
import {UserRoundMinus, UserRoundPlus, Users} from "lucide-react";
import {toggleUserFollow} from "@/actions/(follows)/toggleUserFollow";
import {toast} from "sonner";
import {motion, AnimatePresence} from "framer-motion";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import AlertComponent from "../ui/dialog/AlertComponent";
import {cn} from "@/lib/utils";
import {useQueryClient, useMutation, Query} from "@tanstack/react-query";

interface FollowButtonProps {
  followingId: string;
  isFollowing: boolean;
  isFollowingBack?: boolean;
  username: string;
  buttonClassName?: string;
  userSessionId?: string | null | undefined;
  simpleStyle?: boolean;
  followVariant?: "default" | "outline" | "secondary";
  unfollowVariant?: "default" | "outline" | "secondary";
  hideIcons?: boolean;
  size?: "default" | "xs";
}

type FollowState = "follow" | "following" | "friends" | "unfollow";

interface ButtonConfig {
  text: string;
  icon: React.ReactNode;
  variant: "default" | "outline" | "secondary";
  action: () => void;
  needsConfirmation: boolean;
}

const FollowUserButton = ({
  followingId,
  isFollowing,
  isFollowingBack = false,
  username,
  buttonClassName,
  userSessionId,
  simpleStyle = false,
  followVariant = "default",
  unfollowVariant = "secondary",
  hideIcons = false,
  size = "default",
}: FollowButtonProps) => {
  const [following, setFollowing] = useState(isFollowing);
  const [showUnfollow, setShowUnfollow] = useState(false);
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => toggleUserFollow(followingId),

    // 1. Don't update state immediately - wait for server response
    onMutate: () => {
      const newFollowing = !following;

      // Patch cached lists optimistically
      queryClient.setQueriesData(
        {
          predicate: (q: Query) =>
            typeof q.queryKey[0] === "string" && (q.queryKey[0] as string).endsWith("-infinite"),
        },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((it: any) =>
                it.id === followingId ? {...it, isFollowedBy: newFollowing} : it,
              ),
            })),
          };
        },
      );
    },

    // 2. Update button state only after server confirms success
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message);
        // Update button state after successful response
        setFollowing(!following);
        setShowUnfollow(false);
      }

      // Background refetch lists & counts for eventual consistency (no spinners shown)
      queryClient.invalidateQueries({
        predicate: (q: Query) =>
          typeof q.queryKey[0] === "string" && (q.queryKey[0] as string).endsWith("-infinite"),
        refetchType: "inactive",
      });
      queryClient.invalidateQueries({
        queryKey: ["follow-counts", userSessionId],
        refetchType: "inactive",
      });
    },

    // 3. If server fails, just refetch – simplest rollback
    onError: () => {
      queryClient.invalidateQueries({
        predicate: (q: Query) =>
          typeof q.queryKey[0] === "string" && (q.queryKey[0] as string).endsWith("-infinite"),
      });
      queryClient.invalidateQueries({queryKey: ["follow-counts", userSessionId]});
    },
  });

  // Determine current follow state
  const getFollowState = (): FollowState => {
    // User is NOT following this profile yet
    if (!following) {
      return "follow";
    }

    // User IS following this profile
    if (showUnfollow) {
      return "unfollow";
    }
    // User is following this profile and is following back
    if (isFollowingBack) {
      return "friends";
    }

    // Default for "Following" list – immediate Unfollow option
    return "unfollow";
  };

  const handleFollow = () => followMutation.mutate();

  const handleUnfollow = () => {
    followMutation.mutate();
    setShowUnfollow(false);
  };

  const currentState = getFollowState();

  // Button configurations for each state
  const buttonConfigs: Record<FollowState, ButtonConfig> = {
    follow: {
      text: isFollowingBack ? "Follow Back" : "Follow",
      icon: <UserRoundPlus size="16" />,
      variant: followVariant,
      action: handleFollow,
      needsConfirmation: false,
    },
    following: {
      text: "Following",
      icon: <UserRoundPlus size="16" />,
      variant: "outline",
      action: () => setShowUnfollow(true),
      needsConfirmation: false,
    },
    friends: {
      text: "Friends",
      icon: <Users size="16" />,
      variant: "outline",
      action: handleUnfollow,
      needsConfirmation: true,
    },
    unfollow: {
      text: "Unfollow",
      icon: <UserRoundMinus size="16" />,
      variant: unfollowVariant,
      action: handleUnfollow,
      needsConfirmation: true,
    },
  };

  const config = buttonConfigs[currentState];
  const MotionButton = motion.create(Button);

  // Animation props - disable when simpleStyle is true
  const animationProps = simpleStyle ? {} : {whileTap: {scale: 0.95}};

  // When icons are hidden, show a loader instead of text while pending
  const showSpinnerInsteadOfText = hideIcons && followMutation.isPending;

  const buttonContent = (
    <span className="flex items-center gap-1">
      {!hideIcons && (
        <span className="max-[450px]:hidden">
          {followMutation.isPending ? (
            <LoadingButtonCircle
              size={16}
              className={currentState !== "friends" ? "text-white/80" : ""}
            />
          ) : (
            config.icon
          )}
        </span>
      )}
      {showSpinnerInsteadOfText ? (
        <LoadingButtonCircle
          size={16}
          className={cn(currentState === "follow" && "text-white/80 dark:text-foreground/80")}
        />
      ) : (
        config.text
      )}
    </span>
  );

  const button = (
    <MotionButton
      size={size}
      variant={config.variant}
      className={cn(
        simpleStyle ? "w-full" : "w-[164px]",
        "transition-all duration-300",
        buttonClassName,
      )}
      disabled={followMutation.isPending}
      onClick={userSessionId && !config.needsConfirmation ? config.action : undefined}
      onMouseLeave={() => setShowUnfollow(false)}
      {...animationProps}>
      {simpleStyle ? (
        buttonContent
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentState}
            initial={{opacity: 0, x: -10}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: 10}}
            transition={{duration: 0.2}}>
            {buttonContent}
          </motion.div>
        </AnimatePresence>
      )}
    </MotionButton>
  );

  // Wrap with confirmation dialog if needed
  if (config.needsConfirmation) {
    const isFriend = currentState === "friends" || (currentState === "unfollow" && isFollowingBack);
    const title = isFriend ? `Remove @${username} from friends?` : `Unfollow @${username}?`;
    const description = isFriend
      ? "You will no longer be friends and won't see each other's posts in your feeds. Are you sure?"
      : "You will no longer see their posts in your feed. Are you sure you want to unfollow?";

    return (
      <AlertComponent
        title={title}
        description={description}
        confirmButtonText="Unfollow"
        onConfirm={config.action}>
        {button}
      </AlertComponent>
    );
  }

  return button;
};

export default FollowUserButton;
