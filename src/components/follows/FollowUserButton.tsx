"use client";
import React, {useTransition, useState} from "react";
import {Button} from "../shadcn/button";
import {UserRoundMinus, UserRoundPlus, Users} from "lucide-react";
import {toggleUserFollow} from "@/actions/(follows)/toggleUserFollow";
import {toast} from "sonner";
import {motion, AnimatePresence} from "framer-motion";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import AlertComponent from "../ui/dialog/AlertComponent";
import {cn} from "@/lib/utils";

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
}: FollowButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [following, setFollowing] = useState(isFollowing);
  const [showUnfollow, setShowUnfollow] = useState(false);

  // Determine current follow state
  const getFollowState = (): FollowState => {
    // User is NOT following this profile yet
    if (!following) {
      // Show "Follow" or "Follow Back" depending on whether the profile already follows the user
      return "follow";
    }

    // User *is* following this profile
    // If the profile ALSO follows the user, they're friends – unless the user has hovered/clicked to unfollow.
    if (showUnfollow) {
      return "unfollow";
    }

    if (isFollowingBack) {
      return "friends";
    }

    // Default for "Following" list – immediate Unfollow option
    return "unfollow";
  };

  const handleFollow = () => {
    startTransition(async () => {
      const result = await toggleUserFollow(followingId);
      if (result?.success) {
        toast.success(result.message);
        setFollowing(true);
      }
    });
  };

  const handleUnfollow = () => {
    startTransition(async () => {
      const result = await toggleUserFollow(followingId);
      if (result?.success) {
        toast.success(result.message);
        setFollowing(false);
        setShowUnfollow(false);
      }
    });
  };

  const currentState = getFollowState();

  // Button configurations for each state
  const buttonConfigs: Record<FollowState, ButtonConfig> = {
    follow: {
      text: isFollowingBack ? "Follow Back" : "Follow",
      icon: <UserRoundPlus size="18" strokeWidth={2} />,
      variant: followVariant,
      action: handleFollow,
      needsConfirmation: false,
    },
    following: {
      text: "Following",
      icon: <UserRoundPlus size="18" strokeWidth={2} />,
      variant: "outline",
      action: () => setShowUnfollow(true),
      needsConfirmation: false,
    },
    friends: {
      text: "Friends",
      icon: <Users size="18" strokeWidth={2} />,
      variant: "outline",
      action: handleUnfollow,
      needsConfirmation: true,
    },
    unfollow: {
      text: "Unfollow",
      icon: <UserRoundMinus size="18" strokeWidth={2} />,
      variant: unfollowVariant,
      action: handleUnfollow,
      needsConfirmation: true,
    },
  };

  const config = buttonConfigs[currentState];
  const MotionButton = motion(Button);

  // Animation props - disable when simpleStyle is true
  const animationProps = simpleStyle ? {} : {whileTap: {scale: 0.95}};

  const buttonContent = (
    <span className="flex items-center gap-1">
      {!hideIcons && <span className="max-[450px]:hidden">{config.icon}</span>}
      {config.text}
    </span>
  );

  const button = (
    <MotionButton
      size="default"
      variant={config.variant}
      className={cn(
        simpleStyle ? "w-full" : "w-[164px]",
        "transition-all duration-300",
        buttonClassName,
      )}
      disabled={isPending || !userSessionId}
      onClick={userSessionId && !config.needsConfirmation ? config.action : undefined}
      onMouseLeave={() => setShowUnfollow(false)}
      {...animationProps}>
      {simpleStyle ? (
        isPending ? (
          <LoadingButtonCircle />
        ) : (
          buttonContent
        )
      ) : (
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="loading"
              initial={{opacity: 0, scale: 0.5}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.5}}
              transition={{duration: 0.2}}>
              <LoadingButtonCircle />
            </motion.div>
          ) : (
            <motion.div
              key={currentState}
              initial={{opacity: 0, x: -10}}
              animate={{opacity: 1, x: 0}}
              exit={{opacity: 0, x: 10}}
              transition={{duration: 0.2}}>
              {buttonContent}
            </motion.div>
          )}
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
