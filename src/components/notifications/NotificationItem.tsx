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
import {Check, X} from "lucide-react";
import {useManageProjectRequest} from "@/hooks/query/projects/use-manage-project-request";

const GroupedFollowNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const isRead = notification.is_read === true;
  const senders = notification.grouped_senders || [];
  const count = notification.grouped_count || senders.length || 1;
  const [first, second] = senders;

  const handleClick = () => {
    if (!isRead) {
      const ids =
        notification.grouped_ids && notification.grouped_ids.length > 0
          ? notification.grouped_ids
          : [notification.id];
      markAsRead(ids);
    }
  };

  const remaining = Math.max(count - (first ? 1 : 0) - (second ? 1 : 0), 0);
  const numNames = (first ? 1 : 0) + (second ? 1 : 0);

  return (
    <div
      className={`flex items-start gap-2 p-1.5 py-2.5 text-sm border-b border-border last:border-b-0 px-3 ${
        isRead ? "cursor-default" : "cursor-pointer hover:bg-muted/50"
      }`}
      onClick={handleClick}>
      <div className="relative h-7.5 w-7.5">
        <Avatar className="h-6 w-6 absolute -left-0.5 top-0 z-10 ring-2 ring-background">
          <AvatarImage
            src={first?.profile_image?.[0]?.url ?? ""}
            alt={first?.name || ""}
            className="rounded-full object-cover"
          />
          <AvatarFallback>{first ? getNameInitials(first.name) : ""}</AvatarFallback>
        </Avatar>
        <Avatar className="h-6 w-6 absolute left-2 top-3 ring-2 ring-background">
          <AvatarImage
            src={second?.profile_image?.[0]?.url ?? ""}
            alt={second?.name || ""}
            className="rounded-full object-cover"
          />
          <AvatarFallback>{second ? getNameInitials(second.name) : ""}</AvatarFallback>
        </Avatar>
      </div>

      <div className="w-full text-secondary flex flex-col gap-0.5">
        <div className="flex justify-between items-start gap-2 text-start">
          <p>
            {numNames === 1 && remaining === 0 && first && (
              <>
                <Link href={`/profiles/${first.username}`}>
                  <span className="font-medium text-foreground hover:underline">{first.name}</span>
                </Link>{" "}
                started following you
              </>
            )}
            {numNames === 1 && remaining > 0 && first && (
              <>
                <Link href={`/profiles/${first.username}`}>
                  <span className="font-medium text-foreground hover:underline">{first.name}</span>
                </Link>
                {" and "}
                {remaining} other{remaining > 1 ? "s" : ""} started following you
              </>
            )}
            {numNames === 2 && remaining === 0 && first && second && (
              <>
                <Link href={`/profiles/${first.username}`}>
                  <span className="font-medium text-foreground hover:underline">{first.name}</span>
                </Link>
                {", "}
                <Link href={`/profiles/${second.username}`}>
                  <span className="font-medium text-foreground hover:underline">{second.name}</span>
                </Link>{" "}
                started following you
              </>
            )}
            {numNames === 2 && remaining > 0 && first && second && (
              <>
                <Link href={`/profiles/${first.username}`}>
                  <span className="font-medium text-foreground hover:underline">{first.name}</span>
                </Link>
                {", "}
                <Link href={`/profiles/${second.username}`}>
                  <span className="font-medium text-foreground hover:underline">{second.name}</span>
                </Link>
                {" and "}
                {remaining} other{remaining > 1 ? "s" : ""} started following you
              </>
            )}
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

const FollowNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const {profile_image, name, username} = notification.sender;
  const isRead = notification.is_read === true;

  const handleClick = () => {
    if (!isRead) {
      markAsRead([notification.id]);
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
  markAsRead: (ids: string[]) => void;
}) => {
  const {profile_image, name, username} = notification.sender;
  const projectTitle = notification.project?.name || "Unknown Project";
  const isRead = notification.is_read === true;
  const [isAccepted, setIsAccepted] = useState(notification.status === "accepted");
  const [isDeclined, setIsDeclined] = useState(notification.status === "declined");
  const [loadingAction, setLoadingAction] = useState<"accept" | "reject" | null>(null);

  const manageRequestMutation = useManageProjectRequest();

  const handleClick = () => {
    if (!isRead) {
      markAsRead([notification.id]);
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
      const result = await manageRequestMutation.mutateAsync({
        requestId: null,
        action: "accept",
        projectId: notification.project?.id ?? "",
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
      const result = await manageRequestMutation.mutateAsync({
        requestId: null,
        action: "reject",
        projectId: notification.project?.id ?? "",
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

const ProjectEventNotification = ({
  notification,
  markAsRead,
  message,
  status,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
  message: React.ReactNode;
  status?: "success" | "danger";
}) => {
  const {profile_image, name} = notification.sender;
  const isRead = notification.is_read === true;

  const handleClick = () => {
    if (!isRead) {
      markAsRead([notification.id]);
    }
  };

  const statusIconClass =
    status === "success" ? "text-[#009E61]" : status === "danger" ? "text-[#A60000]" : "";

  return (
    <div
      className={`flex items-start gap-2 p-1.5 py-2.5 text-sm border-b border-border last:border-b-0 px-3 ${
        isRead ? "cursor-default" : "cursor-pointer hover:bg-muted/50 "
      }`}
      onClick={handleClick}>
      <div className="relative">
        <Avatar className="h-7.5 w-7.5">
          <AvatarImage
            src={profile_image?.[0]?.url ?? ""}
            alt={name}
            className="rounded-full object-cover"
          />
          <AvatarFallback>{getNameInitials(name)}</AvatarFallback>
        </Avatar>
        {status && (
          <span
            className={`flex items-center justify-center  bg-background absolute -bottom-1.5 -right-1.5 h-4.5 w-4.5 rounded-full`}>
            <span className="h-3 w-3 rounded-full bg-background ">
              {status === "success" ? (
                <Check className={`w-2.5 h-2.5   ${statusIconClass}`} />
              ) : (
                <X className={`w-2.5 h-2.5  ${statusIconClass}`} />
              )}
            </span>
          </span>
        )}
      </div>

      <div className="w-full text-secondary flex flex-col gap-0.5">
        <div className="flex justify-between items-start gap-2 text-start">
          <p>{message}</p>
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

const ProjectRequestAcceptedNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const sender = notification.sender;
  const projectName = notification.project?.name || "your project";
  const projectSlug = notification.project?.slug;

  const message = (
    <>
      <Link href={`/profiles/${sender.username}`}>
        <span className="font-medium text-foreground hover:underline">{sender.name}</span>
      </Link>{" "}
      accepted your request to join{" "}
      {projectSlug ? (
        <Link href={`/projects/${projectSlug}`}>
          <span className="font-medium text-foreground hover:underline">{projectName}</span>
        </Link>
      ) : (
        <span className="font-medium text-foreground">{projectName}</span>
      )}
    </>
  );

  return (
    <ProjectEventNotification
      notification={notification}
      markAsRead={markAsRead}
      message={message}
      status="success"
    />
  );
};

const ProjectRequestRejectedNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const sender = notification.sender;
  const projectName = notification.project?.name || "the project";
  const projectSlug = notification.project?.slug;

  const message = (
    <>
      <Link href={`/profiles/${sender.username}`}>
        <span className="font-medium text-foreground hover:underline">{sender.name}</span>
      </Link>{" "}
      rejected your request to join{" "}
      {projectSlug ? (
        <Link href={`/projects/${projectSlug}`}>
          <span className="font-medium text-foreground hover:underline">{projectName}</span>
        </Link>
      ) : (
        <span className="font-medium text-foreground">{projectName}</span>
      )}
    </>
  );

  return (
    <ProjectEventNotification
      notification={notification}
      markAsRead={markAsRead}
      message={message}
      status="danger"
    />
  );
};

const ProjectMemberAddedNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const sender = notification.sender;
  const projectName = notification.project?.name || "a project";
  const projectSlug = notification.project?.slug;

  const message = (
    <>
      <Link href={`/profiles/${sender.username}`}>
        <span className="font-medium text-foreground hover:underline">{sender.name}</span>
      </Link>{" "}
      joined{" "}
      {projectSlug ? (
        <Link href={`/projects/${projectSlug}`}>
          <span className="font-medium text-foreground hover:underline">{projectName}</span>
        </Link>
      ) : (
        <span className="font-medium text-foreground">{projectName}</span>
      )}
    </>
  );

  return (
    <ProjectEventNotification
      notification={notification}
      markAsRead={markAsRead}
      message={message}
      status="success"
    />
  );
};

const ProjectMemberRemovedNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const sender = notification.sender;
  const projectName = notification.project?.name || "a project";
  const projectSlug = notification.project?.slug;

  const message = (
    <>
      <Link href={`/profiles/${sender.username}`}>
        <span className="font-medium text-foreground hover:underline">{sender.name}</span>
      </Link>{" "}
      was removed from{" "}
      {projectSlug ? (
        <Link href={`/projects/${projectSlug}`}>
          <span className="font-medium text-foreground hover:underline">{projectName}</span>
        </Link>
      ) : (
        <span className="font-medium text-foreground">{projectName}</span>
      )}
    </>
  );

  return (
    <ProjectEventNotification
      notification={notification}
      markAsRead={markAsRead}
      message={message}
      status="danger"
    />
  );
};

const ProjectInviteAcceptedNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const sender = notification.sender;
  const projectName = notification.project?.name || "your project";
  const projectSlug = notification.project?.slug;

  const message = (
    <>
      <Link href={`/profiles/${sender.username}`}>
        <span className="font-medium text-foreground hover:underline">{sender.name}</span>
      </Link>{" "}
      accepted your invitation to{" "}
      {projectSlug ? (
        <Link href={`/projects/${projectSlug}`}>
          <span className="font-medium text-foreground hover:underline">{projectName}</span>
        </Link>
      ) : (
        <span className="font-medium text-foreground">{projectName}</span>
      )}
    </>
  );

  return (
    <ProjectEventNotification
      notification={notification}
      markAsRead={markAsRead}
      message={message}
      status="success"
    />
  );
};

const ProjectInviteRejectedNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const sender = notification.sender;
  const projectName = notification.project?.name || "your project";
  const projectSlug = notification.project?.slug;

  const message = (
    <>
      <Link href={`/profiles/${sender.username}`}>
        <span className="font-medium text-foreground hover:underline">{sender.name}</span>
      </Link>{" "}
      declined your invitation to{" "}
      {projectSlug ? (
        <Link href={`/projects/${projectSlug}`}>
          <span className="font-medium text-foreground hover:underline">{projectName}</span>
        </Link>
      ) : (
        <span className="font-medium text-foreground">{projectName}</span>
      )}
    </>
  );

  return (
    <ProjectEventNotification
      notification={notification}
      markAsRead={markAsRead}
      message={message}
      status="danger"
    />
  );
};

const ProjectJoinRequestNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const sender = notification.sender;
  const {profile_image, name} = sender;
  const projectName = notification.project?.name || "Unknown Project";
  const projectSlug = notification.project?.slug;
  const isRead = notification.is_read === true;
  const [loadingAction, setLoadingAction] = useState<"accept" | "reject" | null>(null);

  const manageRequestMutation = useManageProjectRequest();

  const handleClick = () => {
    if (!isRead) {
      markAsRead([notification.id]);
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
      await manageRequestMutation.mutateAsync({
        requestId: notification.reference_id,
        action: "accept",
        projectId: notification.project?.id ?? "",
      });
    } catch (error) {
      console.error("Error accepting join request:", error);
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
      await manageRequestMutation.mutateAsync({
        requestId: notification.reference_id,
        action: "reject",
        projectId: notification.project?.id ?? "",
      });
    } catch (error) {
      console.error("Error rejecting join request:", error);
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
              <Link href={`/profiles/${sender.username}`}>
                <span className="font-medium text-foreground hover:underline">{sender.name}</span>
              </Link>{" "}
              requested to join{" "}
              {projectSlug ? (
                <Link href={`/projects/${projectSlug}`}>
                  <span className="font-medium text-foreground hover:underline">{projectName}</span>
                </Link>
              ) : (
                <span className="font-medium text-foreground">{projectName}</span>
              )}
            </p>
            {!isRead && <div className="bg-primary rounded-full w-2 h-2 shrink-0"></div>}
          </div>
          <div className="flex justify-between items-center gap-2 text-xs">
            <p>{formatDateAbsolute(notification.created_at)}</p>
            <p>{formatTimeRelative(notification.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant={"secondary"}
            size={"xs"}
            className="text-[13px] leading-[14px] h-fit max-h-[30px] max-w-[60px] w-full"
            onClick={handleAccept}
            disabled={loadingAction !== null}>
            {loadingAction === "accept" ? <LoadingButtonCircle size={16} /> : "Accept"}
          </Button>
          <Button
            variant={"outline"}
            size={"xs"}
            className="text-[13px] leading-[14px] h-fit max-h-[30px] max-w-[80px] w-full"
            onClick={handleReject}
            disabled={loadingAction !== null}>
            {loadingAction === "reject" ? <LoadingButtonCircle size={16} /> : "Decline"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProjectRoleUpdatedNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const sender = notification.sender;
  const projectName = notification.project?.name || "the project";
  const projectSlug = notification.project?.slug;
  return (
    <ProjectEventNotification
      notification={notification}
      markAsRead={markAsRead}
      message={
        <>
          <Link href={`/profiles/${sender.username}`}>
            <span className="font-medium text-foreground hover:underline">{sender.name}</span>
          </Link>{" "}
          updated your role in{" "}
          {projectSlug ? (
            <Link href={`/projects/${projectSlug}`}>
              <span className="font-medium text-foreground hover:underline">{projectName}</span>
            </Link>
          ) : (
            <span className="font-medium text-foreground">{projectName}</span>
          )}
        </>
      }
    />
  );
};

const ProjectDeletedNotification = ({
  notification,
  markAsRead,
}: {
  notification: Notification;
  markAsRead: (ids: string[]) => void;
}) => {
  const sender = notification.sender;
  const projectName = notification.project?.name || "this project";
  return (
    <ProjectEventNotification
      notification={notification}
      markAsRead={markAsRead}
      message={
        <>
          {projectName} was deleted by{" "}
          <Link href={`/profiles/${sender.username}`}>
            <span className="font-medium text-foreground hover:underline">{sender.name}</span>
          </Link>
        </>
      }
      status="danger"
    />
  );
};

export const createNotificationItem = (
  notification: Notification,
  markAsRead: (ids: string[]) => void,
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
    case "follow_grouped":
      return (
        <GroupedFollowNotification
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
    case "project_request":
      return (
        <ProjectJoinRequestNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );

    case "user_request_accepted":
      return (
        <ProjectRequestAcceptedNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );
    case "user_request_rejected":
      return (
        <ProjectRequestRejectedNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );
    case "project_invite_accepted":
      return (
        <ProjectInviteAcceptedNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );
    case "project_invite_rejected":
      return (
        <ProjectInviteRejectedNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );
    case "project_member_added":
      return (
        <ProjectMemberAddedNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );
    case "project_member_removed":
      return (
        <ProjectMemberRemovedNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );
    case "project_role_updated":
      return (
        <ProjectRoleUpdatedNotification
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
        />
      );
    case "project_deleted":
      return (
        <ProjectDeletedNotification
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
