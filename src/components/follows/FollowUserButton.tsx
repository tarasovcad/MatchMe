"use client";
import React, {useTransition} from "react";
import {Button} from "../shadcn/button";
import {UserRoundCheck, UserRoundMinus, UserRoundPlus} from "lucide-react";
import {useState} from "react";
import {toggleUserFollow} from "@/actions/(follows)/toggleUserFollow";
import {toast} from "sonner";
import {motion, AnimatePresence} from "framer-motion";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";

interface FollowButtonProps {
  followerId: string;
  followingId: string;
  isFollowing: boolean;
  isFollowingBack?: boolean;
}

const FollowUserButton = ({
  followerId,
  followingId,
  isFollowing,
  isFollowingBack,
}: FollowButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [following, setFollowing] = useState(isFollowing);
  const [hovering, setHovering] = useState(false);

  const handleFollowToggle = () => {
    startTransition(async () => {
      const result = await toggleUserFollow(followerId, followingId);
      if (result?.success) {
        toast.success(result.message);
        setFollowing(!following);
      }
    });
  };

  const getButtonText = () => {
    if (isPending) {
      return <LoadingButtonCircle size={18} />;
    }

    if (following) {
      return (
        <>
          {hovering ? (
            <UserRoundMinus
              size="18"
              color="currentColor"
              strokeWidth={2}
              className="max-[450px]:hidden stroke-2"
            />
          ) : (
            <UserRoundCheck
              size="18"
              color="currentColor"
              strokeWidth={2}
              className="max-[450px]:hidden stroke-2"
            />
          )}
          {hovering ? "Unfollow" : "Following"}
        </>
      );
    }

    return (
      <>
        <UserRoundPlus
          size="18"
          color="currentColor"
          strokeWidth={2}
          className="max-[450px]:hidden stroke-2"
        />
        {isFollowingBack ? "Follow Back" : "Follow"}
      </>
    );
  };

  return (
    <Button
      size={"default"}
      variant={following ? "secondary" : "default"}
      className="w-[164px] max-[620px]:w-full"
      disabled={isPending}
      onClick={handleFollowToggle}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}>
      {getButtonText()}
    </Button>
  );
};

export default FollowUserButton;
