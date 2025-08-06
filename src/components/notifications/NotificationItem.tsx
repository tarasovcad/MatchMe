import React, {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {formatDateAbsolute, formatTimeRelative} from "@/functions/formatDate";
import {Notification} from "@/types/notifications";
import {getNameInitials} from "@/functions/getNameInitials";
import {Avatar, AvatarFallback, AvatarImage} from "../shadcn/avatar";
import {Button} from "../shadcn/button";
import {toast} from "sonner";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";
import {Check} from "lucide-react";
import {useHandleProjectRequest} from "@/hooks/query/use-handle-project-request";

const FollowNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (id: string) => void;
}) => {
  const {profile_image, name, username} = notification.sender;
  const isRead = notification.is_read === true;

  const handleClick = () => {
    if (!isRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      className={`flex items-start gap-2 p-1.5 py-2.5 text-sm border-b border-border last:border-b-0 px-3 ${
        isRead ? "cursor-default" : "cursor-pointer"
      }`}
      onClick={handleClick}>
      <Avatar className="h-7.5 w-7.5">
        <AvatarImage
          src={profile_image?.[0]?.url ?? ""}
          alt={name}
          className="rounded-full object-cover"
        />
        <AvatarFallback>{getNameInitials(name)}</AvatarFallback>
      </Avatar>

      <div className="w-full text-secondary flex flex-col gap-0.5">
        <div className="flex justify-between items-start gap-2 text-start">
          <p>
            <Link href={`/profiles/${username}`}>
              <span className="font-medium text-foreground hover:underline">{name}</span>
            </Link>{" "}
            started following you
          </p>
          {!isRead && <div className="bg-primary rounded-full w-2 h-2 shrink-0"></div>}
        </div>
        <div className="flex justify-between items-center gap-2 text-xs">
          <p>{formatDateAbsolute(notification.created_at)}</p>
          <p>{formatTimeRelative(notification.created_at)}</p>
        </div>
      </div>
    </div>
  );
};

const ProjectInviteNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (id: string) => void;
}) => {
  const {profile_image, name, username} = notification.sender;
  const projectTitle = notification.project?.name || "Unknown Project";
  const isRead = notification.is_read === true;
  const [isAccepted, setIsAccepted] = useState(notification.status === "accepted");
  const [isDeclined, setIsDeclined] = useState(notification.status === "declined");
  const [loadingAction, setLoadingAction] = useState<"accept" | "reject" | null>(null);

  const handleProjectRequestMutation = useHandleProjectRequest();

  const handleClick = () => {
    if (!isRead) {
      markAsRead(notification.id);
    }
  };

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!notification.reference_id) {
      toast.error("Cannot process request - missing reference ID");
      return;
    }

    setLoadingAction("accept");
    try {
      const result = await handleProjectRequestMutation.mutateAsync({
        requestId: notification.reference_id,
        action: "accept",
      });

      if (result.success) {
        setIsAccepted(true);
      }
    } catch (error) {
      console.error("Error accepting project invite:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!notification.reference_id) {
      toast.error("Cannot process request - missing reference ID");
      return;
    }

    setLoadingAction("reject");
    try {
      const result = await handleProjectRequestMutation.mutateAsync({
        requestId: notification.reference_id,
        action: "reject",
      });

      if (result.success) {
        setIsDeclined(true);
      }
    } catch (error) {
      console.error("Error declining project invite:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      className={`flex items-start gap-2 p-1.5 py-2.5 text-sm border-b border-border last:border-b-0 px-3 ${
        isRead ? "cursor-default" : "cursor-pointer hover:bg-muted/50"
      }`}
      onClick={handleClick}>
      <Avatar className="h-7.5 w-7.5">
        <AvatarImage
          src={profile_image?.[0]?.url ?? ""}
          alt={name}
          className="rounded-full object-cover"
        />
        <AvatarFallback>{getNameInitials(name)}</AvatarFallback>
      </Avatar>

      <div className="w-full text-secondary flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between items-start gap-2 text-start">
            <p>
              <Link href={`/profiles/${username}`}>
                <span className="font-medium text-foreground hover:underline">{name}</span>
              </Link>{" "}
              invited you to{" "}
              <Link href={`/projects/${notification.project?.slug}`}>
                <span className="font-medium text-foreground hover:underline">{projectTitle}</span>
              </Link>
            </p>
            {!isRead && <div className="bg-primary rounded-full w-2 h-2 shrink-0"></div>}
          </div>
          <div className="flex justify-between items-center gap-2 text-xs">
            <p>{formatDateAbsolute(notification.created_at)}</p>
            <p>{formatTimeRelative(notification.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {isAccepted ? (
            <Button
              variant={"outline"}
              size={"xs"}
              className="text-[13px] leading-[14px] h-fit max-h-[30px] w-fit"
              disabled={true}>
              <Check className="w-4 h-4" />
              Joined
            </Button>
          ) : isDeclined ? (
            <Button
              variant={"outline"}
              size={"xs"}
              className="text-[13px] leading-[14px] h-fit max-h-[30px] w-fit text-muted-foreground"
              disabled={true}>
              Declined
            </Button>
          ) : (
            <>
              <Button
                variant={"secondary"}
                size={"xs"}
                className="text-[13px] leading-[14px] h-fit max-h-[30px] max-w-[60px] w-full"
                onClick={handleAccept}
                disabled={loadingAction !== null}>
                {loadingAction === "accept" ? <LoadingButtonCircle size={16} /> : "Join"}
              </Button>
              <Button
                variant={"outline"}
                size={"xs"}
                className="text-[13px] leading-[14px] h-fit max-h-[30px] max-w-[80px] w-full"
                onClick={handleReject}
                disabled={loadingAction !== null}>
                {loadingAction === "reject" ? <LoadingButtonCircle size={16} /> : "Decline"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const createNotificationItem = (
  notification: Notification,
  markAsRead: (id: string) => void,
) => {
  switch (notification.type) {
    case "follow":
      return (
        <FollowNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );
    case "project_invite":
      return (
        <ProjectInviteNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );
    // Other notification types here
    default:
      return null;
  }
};
