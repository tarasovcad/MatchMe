"use client";

import React, {useState} from "react";
import {Button} from "../shadcn/button";
import {UserRoundPlus, Users} from "lucide-react";
import {toggleProjectFollow} from "@/actions/(follows)/toggleProjectFollow";
import {toast} from "sonner";
import {motion, AnimatePresence} from "framer-motion";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import AlertComponent from "../ui/dialog/AlertComponent";
import {cn} from "@/lib/utils";
import {useQueryClient, useMutation, Query} from "@tanstack/react-query";

interface FollowProjectButtonProps {
  projectId: string;
  isFollowing: boolean;
  projectTitle: string;
  buttonClassName?: string;
  userSessionId?: string | null | undefined;
  simpleStyle?: boolean;
  followVariant?: "default" | "outline" | "secondary";
  hideIcons?: boolean;
  size?: "default" | "xs";
}

type FollowState = "follow" | "following";

interface ButtonConfig {
  text: string;
  icon: React.ReactNode;
  variant: "default" | "outline" | "secondary";
  action: () => void;
  needsConfirmation: boolean;
}

type ItemWithId = {id: string; isFollowedBy?: boolean} & Record<string, unknown>;
type PageWithItems = {items?: ItemWithId[]} & Record<string, unknown>;
type InfiniteDataShape = {pages?: PageWithItems[]} & Record<string, unknown>;

const FollowProjectButton = ({
  projectId,
  isFollowing,
  projectTitle,
  buttonClassName,
  userSessionId,
  simpleStyle = false,
  followVariant = "default",
  hideIcons = false,
  size = "default",
}: FollowProjectButtonProps) => {
  const [following, setFollowing] = useState(isFollowing);
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => toggleProjectFollow(projectId),

    // 1. Don't update state immediately - wait for server response
    onMutate: () => {
      const newFollowing = !following;

      // Patch cached project lists optimistically
      queryClient.setQueriesData(
        {
          predicate: (q: Query) =>
            typeof q.queryKey[0] === "string" && (q.queryKey[0] as string).includes("projects"),
        },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          const data = old as InfiniteDataShape;
          if (!Array.isArray(data.pages)) return old;
          return {
            ...data,
            pages: data.pages.map((page) => {
              const items = Array.isArray(page.items) ? page.items : [];
              return {
                ...page,
                items: items.map((item) =>
                  item.id === projectId ? {...item, isFollowedBy: newFollowing} : item,
                ),
              };
            }),
          } as InfiniteDataShape;
        },
      );
    },

    // 2. Update button state only after server confirms success
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message);
        // Update button state after successful response
        setFollowing(!following);
      }

      // Background refetch project lists for eventual consistency
      queryClient.invalidateQueries({
        predicate: (q: Query) =>
          typeof q.queryKey[0] === "string" && (q.queryKey[0] as string).includes("projects"),
        refetchType: "inactive",
      });
    },

    // 3. If server fails, just refetch – simplest rollback
    onError: () => {
      queryClient.invalidateQueries({
        predicate: (q: Query) =>
          typeof q.queryKey[0] === "string" && (q.queryKey[0] as string).includes("projects"),
      });
    },
  });

  const getFollowState = (): FollowState => {
    return following ? "following" : "follow";
  };

  const handleFollow = () => followMutation.mutate();
  const handleUnfollow = () => followMutation.mutate();

  const currentState = getFollowState();

  const buttonConfigs: Record<FollowState, ButtonConfig> = {
    follow: {
      text: "Follow",
      icon: <UserRoundPlus size="16" />,
      variant: followVariant,
      action: handleFollow,
      needsConfirmation: false,
    },
    following: {
      text: "Following",
      icon: <Users size="16" />,
      variant: "outline",
      action: handleUnfollow,
      needsConfirmation: true,
    },
  };

  const config = buttonConfigs[currentState];
  const MotionButton = motion.create(Button);

  // Animation props - disable when simpleStyle is true
  const animationProps = simpleStyle ? {} : {whileTap: {scale: 0.95}};

  const buttonContent = (
    <span className="flex items-center gap-1">
      {!hideIcons && (
        <span className="max-[450px]:hidden">
          {followMutation.isPending ? (
            <LoadingButtonCircle
              size={16}
              className={currentState !== "following" ? "text-white/80" : ""}
            />
          ) : (
            config.icon
          )}
        </span>
      )}
      {config.text}
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

  if (config.needsConfirmation) {
    return (
      <AlertComponent
        title={`Unfollow ${projectTitle}?`}
        description="You will no longer see this project in your feed. Are you sure you want to unfollow?"
        confirmButtonText="Unfollow"
        onConfirm={config.action}>
        {button}
      </AlertComponent>
    );
  }

  return button;
};

export default FollowProjectButton;
