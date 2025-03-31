"use client";
import React, {useTransition} from "react";
import {Button} from "../shadcn/button";
import {UserRoundMinus, UserRoundPlus} from "lucide-react";
import {useState} from "react";
import {toggleUserFollow} from "@/actions/(follows)/toggleUserFollow";
import {toast} from "sonner";
import {motion, AnimatePresence} from "framer-motion";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import AlertComponent from "../ui/dialog/AlertComponent";

interface FollowButtonProps {
  followerId: string;
  followingId: string;
  isFollowing: boolean;
  isFollowingBack?: boolean;
  username: string;
}

const FollowUserButton = ({
  followerId,
  followingId,
  isFollowing,
  isFollowingBack,
  username,
}: FollowButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [following, setFollowing] = useState(isFollowing);

  const handleFollowToggle = () => {
    if (!following) {
      startTransition(async () => {
        const result = await toggleUserFollow(followerId, followingId);
        if (result?.success) {
          toast.success(result.message);
          setFollowing(true);
        }
      });
    }
  };

  const handleUnfollow = () => {
    startTransition(async () => {
      const result = await toggleUserFollow(followerId, followingId);
      if (result?.success) {
        toast.success(result.message);
        setFollowing(false);
      }
    });
  };

  const MotionButton = motion(Button);

  return (
    <>
      {following ? (
        <AlertComponent
          title={`Unfollow @${username}?`}
          description="You will no longer see their posts in your feed. Are you sure you want to unfollow?"
          confirmButtonText="Unfollow"
          onConfirm={handleUnfollow}>
          <MotionButton
            size={"default"}
            variant="secondary"
            className="w-[164px] max-[620px]:w-full transition-all duration-300"
            disabled={isPending}
            whileTap={{scale: 0.95}}>
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
                <motion.span
                  initial={{opacity: 0, x: 10}}
                  animate={{opacity: 1, x: 0}}
                  exit={{opacity: 0, x: -10}}
                  transition={{duration: 0.2}}
                  className="flex items-center gap-1">
                  <UserRoundMinus
                    size="18"
                    color="currentColor"
                    strokeWidth={2}
                    className="max-[450px]:hidden stroke-2"
                  />
                  Unfollow
                </motion.span>
              )}
            </AnimatePresence>
          </MotionButton>
        </AlertComponent>
      ) : (
        <MotionButton
          size={"default"}
          variant="default"
          className="w-[164px] max-[620px]:w-full transition-all duration-300"
          disabled={isPending}
          onClick={handleFollowToggle}
          whileTap={{scale: 0.95}}>
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
              <motion.span
                key="follow"
                initial={{opacity: 0, x: -10}}
                animate={{opacity: 1, x: 0}}
                exit={{opacity: 0, x: 10}}
                transition={{duration: 0.2}}
                className="flex items-center gap-1">
                <UserRoundPlus
                  size="18"
                  color="currentColor"
                  strokeWidth={2}
                  className="max-[450px]:hidden stroke-2"
                />
                {isFollowingBack ? "Follow Back" : "Follow"}
              </motion.span>
            )}
          </AnimatePresence>
        </MotionButton>
      )}
    </>
  );
};

export default FollowUserButton;
