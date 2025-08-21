import React, {memo, useCallback, useState} from "react";
import {Button} from "@/components/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/dialog";
import {Clock, ChevronRight, X, TrendingUp, ChevronLeft, AlertTriangle} from "lucide-react";
import TagsList from "../profiles/TagsList";
import Link from "next/link";
import {motion, AnimatePresence} from "framer-motion";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";
import {experienceLevels} from "@/data/projects/experienceLevels";
import Image from "next/image";
import OpenPositionAddToFavoriteBtn from "@/components/favourites/OpenPositionAddToFavoriteBtn";
import {Textarea} from "@/components/shadcn/textarea";
import Alert from "@/components/ui/Alert";
import AutogrowingTextarea from "@/components/ui/form/AutogrowingTextarea";
import {useSubmitProjectApplication} from "@/hooks/query/projects/use-submit-application";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import AuthGate from "@/components/other/AuthGate";

const getTitleByValue = (options: {title: string; value: string}[], value?: string): string => {
  if (!value) return "";
  return options.find((option) => option.value === value)?.title ?? value;
};

export type ProjectOpenPositionCardProps = {
  openPosition: ProjectOpenPosition;
  userId?: string;
  isOwner?: boolean;
  isTeamMember?: boolean;
};

// Extracted dialog component
const OpenPositionDetailsDialog = ({
  open,
  onOpenChange,
  openPosition,
  userId,
  isOwner,
  isTeamMember,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openPosition: ProjectOpenPosition;
  userId?: string;
  isOwner?: boolean;
  isTeamMember?: boolean;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationMessage, setApplicationMessage] = useState("");

  const submitApplicationMutation = useSubmitProjectApplication();

  const hasCurrentPositionRequest = Boolean(openPosition.has_pending_request);
  const hasOtherPositionRequest =
    Boolean(openPosition.has_any_pending_request) && !hasCurrentPositionRequest;

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCurrentStep(1);
      setApplicationMessage("");
    }
    onOpenChange(isOpen);
  };

  const handleSubmitApplication = () => {
    if (!userId || isOwnerOrMember || hasCurrentPositionRequest) {
      return;
    }

    submitApplicationMutation.mutate(
      {
        project_id: openPosition.project_id,
        position_id: openPosition.id,
        message: applicationMessage.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            handleDialogClose(false);
          }
        },
      },
    );
  };

  const isOwnerOrMember = Boolean(isOwner) || Boolean(isTeamMember);

  const renderRestrictionAlert = () => {
    if (isOwner) {
      return (
        <Alert
          title="You are the founder"
          message="Project owners cannot apply to open positions."
          type="warning"
        />
      );
    }
    if (isTeamMember) {
      return (
        <Alert
          title="You are a team member"
          message="Project team members cannot apply to open positions."
          type="warning"
        />
      );
    }
    return null;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-foreground">
            {/* Header */}
            <div className="flex justify-between items-center gap-2 pb-0 p-6">
              <DialogTitle className="font-medium m-0 text-foreground">
                {openPosition.title}
              </DialogTitle>
              <DialogClose asChild>
                <Button size={"icon"} className="w-6 h-6">
                  <X size={12} />
                </Button>
              </DialogClose>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Restriction alerts */}
              {renderRestrictionAlert()}

              {/* Job details section */}
              <div className="space-y-2">
                <div className="border border-border/80 rounded-lg">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 border-r border-border/80 pr-4 py-1.5 px-2 text-secondary min-w-[165px]">
                      <Clock size={16} className="text-foreground/60" />
                      <span className="text-sm whitespace-nowrap">Time commitment</span>
                    </div>
                    <span className="text-foreground whitespace-nowrap">
                      {getTitleByValue(timeCommitment, openPosition.time_commitment)}
                    </span>
                  </div>
                </div>
                <div className="border border-border/80 rounded-lg">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 border-r border-border/80 pr-4 py-1.5 px-2 text-secondary min-w-[165px]">
                      <TrendingUp size={16} className="text-foreground/60" />
                      <span className="text-sm whitespace-nowrap">Experience Level</span>
                    </div>
                    <span className="text-foreground whitespace-nowrap">
                      {getTitleByValue(experienceLevels, openPosition.experience_level)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full description */}
              <div className="space-y-2">
                <h3 className="font-medium text-[15px] text-foreground">About this role</h3>
                <p className="text-secondary text-sm leading-relaxed">{openPosition.description}</p>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <h3 className="font-medium text-[15px] text-foreground">Requirements</h3>
                <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">
                  {openPosition.requirements}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-[15px] text-foreground">Required skills</h3>
                <div className="pt-1">
                  <TagsList skills={openPosition.required_skills_with_images || []} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4">
              <div className="flex justify-between items-center gap-2 bg-background w-full">
                <OpenPositionAddToFavoriteBtn
                  userId={userId}
                  positionId={openPosition.id}
                  isFavorite={openPosition.is_saved}
                  size="xs"
                  variant="outline"
                  showLabel
                  labelWhenEmpty="Add to favorites"
                  labelWhenFilled="Remove from favorites"
                />
                <Button
                  variant={"secondary"}
                  size={"xs"}
                  onClick={handleNext}
                  disabled={isOwnerOrMember || hasCurrentPositionRequest}>
                  {hasCurrentPositionRequest ? "Applied" : "Next"}
                  {!hasCurrentPositionRequest && <ChevronRight size={14} className="ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-foreground">
            {/* Header */}
            <div className="flex justify-between items-center gap-2 pb-0 p-6">
              <DialogTitle className="font-medium m-0">Apply to {openPosition.title}</DialogTitle>
              <DialogClose asChild>
                <Button size={"icon"} className="w-6 h-6">
                  <X size={12} />
                </Button>
              </DialogClose>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Pending request alerts */}
              {hasCurrentPositionRequest && (
                <Alert
                  title="Pending Application"
                  message={`You have a pending request for "${openPosition.title}". Your application is currently being reviewed.`}
                  type="warning"
                />
              )}

              {hasOtherPositionRequest && (
                <Alert
                  title="Application Already Submitted"
                  message={`You've already applied to "${openPosition.pending_position_title}" in this project. Applying here will replace your previous application since only one application per project is allowed.`}
                  type="warning"
                />
              )}

              {/* Application form */}
              <div className="space-y-1.5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-medium text-sm">Message</p>
                    <span className="text-muted-foreground text-sm">Optional</span>
                  </div>
                  <AutogrowingTextarea
                    id="message"
                    placeholder="Hey! I'd love to join your team on this project – I believe my skills and experience would be a great fit for this role."
                    name="message"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  A personalized message helps increase your chances of being selected
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4">
              <div className="flex justify-between items-center gap-2 bg-background w-full">
                <Button variant="outline" size="xs" onClick={handleBack}>
                  <ChevronLeft size={14} className="mr-1" />
                  Back
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  className="flex items-center gap-2"
                  disabled={
                    hasCurrentPositionRequest ||
                    submitApplicationMutation.isPending ||
                    isOwnerOrMember ||
                    !userId
                  }
                  onClick={handleSubmitApplication}>
                  {submitApplicationMutation.isPending && (
                    <LoadingButtonCircle className="text-white dark:text-foreground/80" />
                  )}
                  Submit Application
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="flex !max-w-[calc(35%-2rem)] flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:hidden">
        <div className="overflow-y-auto">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogDescription asChild>
              <div className="overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentStep}
                    initial={{opacity: 0, y: 4}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -4}}
                    transition={{duration: 0.16, ease: [0.16, 1, 0.3, 1]}}>
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProjectOpenPositionCardComponent = ({
  openPosition,
  userId,
  isOwner,
  isTeamMember,
}: ProjectOpenPositionCardProps) => {
  console.log(openPosition);
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleHoverStart = useCallback(() => setIsHovered(true), []);
  const handleHoverEnd = useCallback(() => setIsHovered(false), []);

  return (
    <motion.div className="relative" onHoverStart={handleHoverStart} onHoverEnd={handleHoverEnd}>
      {/* Container with conditional gradient border */}
      <motion.div
        className="relative rounded-[11px] overflow-visible"
        animate={{
          padding: isHovered ? "1px" : "0px",
          backgroundColor: isHovered ? "rgba(212, 207, 255, 1)" : "rgba(212, 207, 255, 0)",
          margin: isHovered ? "-1px" : "0px",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}>
        {/* Main card content */}
        <motion.div className="relative border border-border/70 rounded-[11px] p-4.5 bg-background flex flex-col gap-[10px]">
          <h2 className="font-semibold text-foreground/90 text-base leading-tight">
            {openPosition.title}
          </h2>
          <p className="text-secondary text-sm leading-relaxed">{openPosition.description}</p>
          {/* Bottom section - Profile info */}
          <div className="flex items-center gap-2">
            <Image
              src={
                openPosition.posted_by_profile_image?.[0]?.url ?? "/avatar/default-user-avatar.png"
              }
              alt={openPosition.posted_by_username ?? ""}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover"
            />
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Link
                href={`/profiles/${openPosition.posted_by_username}`}
                className="text-secondary hover:text-foreground/80 transition-all duration-200 hover:underline">
                {openPosition.posted_by_username}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Bottom expandable section that slides out */}
        <motion.div
          className="relative overflow-hidden"
          initial={{height: 0}}
          animate={{height: isHovered ? "auto" : 0}}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}>
          <motion.div
            className="bg-gradient-to-r from-[#D4CFFF] to-[#BCB6F6] rounded-b-[11px] relative"
            initial={{y: -20, opacity: 0}}
            animate={{y: isHovered ? 0 : -20, opacity: isHovered ? 1 : 0}}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
              delay: isHovered ? 0 : 0,
            }}>
            {/* Diagonal stripes background effect using CSS gradient for performance */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                opacity: isHovered ? 1 : 0,
                transition: "opacity 200ms ease",
                backgroundImage:
                  "repeating-linear-gradient(12deg, rgba(255,255,255,0.10) 0, rgba(255,255,255,0.10) 12px, transparent 12px, transparent 24px)",
              }}
            />

            <motion.div
              className="flex items-center justify-between text-sm px-4 py-2.5 relative z-10"
              initial={{y: 10, opacity: 0}}
              animate={{y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0}}
              transition={{delay: isHovered ? 0.2 : 0, duration: 0.2}}>
              <span className="text-foreground/80 font-medium">
                Click to view full job details and requirements
              </span>
              <AuthGate userSessionId={userId}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={userId ? () => setIsDialogOpen(true) : undefined}
                  className="h-[32px] bg-background/95 hover:bg-background border-primary/20 hover:border-primary/40 text-foreground/90 shadow-sm group">
                  <span>View Details</span>
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform duration-200 ml-1"
                  />
                </Button>
              </AuthGate>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
      <OpenPositionDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        openPosition={openPosition}
        userId={userId}
        isOwner={isOwner}
        isTeamMember={isTeamMember}
      />
    </motion.div>
  );
};

const ProjectOpenPositionCard = memo(ProjectOpenPositionCardComponent);

export default ProjectOpenPositionCard;
