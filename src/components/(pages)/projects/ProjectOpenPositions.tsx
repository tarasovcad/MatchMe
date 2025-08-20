import React, {useState} from "react";
import {Button} from "@/components/shadcn/button";
import {Badge} from "@/components/shadcn/badge";
import {Separator} from "@/components/shadcn/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import MainGradient from "@/components/ui/Text";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
  UserRound,
  Maximize2,
  X,
  CheckCheck,
  Bookmark,
  Briefcase,
  Search,
} from "lucide-react";
import TagsList from "../profiles/TagsList";
import Link from "next/link";
import {motion} from "framer-motion";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";
import {experienceLevels} from "@/data/projects/experienceLevels";
import Image from "next/image";
import ProjectOpenPositionsSkeleton from "./ProjectOpenPositionsSkeleton";

const getTitleByValue = (options: {title: string; value: string}[], value?: string): string => {
  if (!value) return "";
  return options.find((option) => option.value === value)?.title ?? value;
};

const ProjectOpenPositions = ({
  projectId,
  userSessionId,
  openPositions,
  isLoading,
}: {
  projectId: string;
  userSessionId?: string;
  openPositions: ProjectOpenPosition[];
  isLoading: boolean;
}) => {
  const [hoveredOpenPosition, setHoveredOpenPosition] = useState<string | null>(null);

  if (isLoading) {
    return <ProjectOpenPositionsSkeleton />;
  }

  if (openPositions.length === 0) {
    return (
      <div className="@container w-full">
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <Search size={22} className="text-foreground/70 mb-2" />

          <h3 className="text-[16px] font-medium text-foreground mb-2">
            No open positions at the moment
          </h3>
          <p className="text-muted-foreground text-[13px]  max-w-md leading-relaxed">
            This project isn&apos;t actively recruiting right now, but that could change soon.
            Follow the project to get notified when new positions open up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="@container w-full">
      <div className="flex flex-col gap-6 w-full">
        {openPositions.map((openPosition) => (
          <motion.div
            key={openPosition.id}
            className="relative"
            onHoverStart={() => setHoveredOpenPosition(openPosition.id)}
            onHoverEnd={() => setHoveredOpenPosition(null)}>
            {/* Container with conditional gradient border */}
            <motion.div
              className="relative rounded-[11px] overflow-visible"
              animate={{
                padding: hoveredOpenPosition === openPosition.id ? "1px" : "0px",
                backgroundColor:
                  hoveredOpenPosition === openPosition.id
                    ? "rgba(212, 207, 255, 1)"
                    : "rgba(212, 207, 255, 0)",
                margin: hoveredOpenPosition === openPosition.id ? "-1px" : "0px",
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
                      openPosition.posted_by_profile_image?.[0]?.url ??
                      "/avatar/default-user-avatar.png"
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
                animate={{
                  height: hoveredOpenPosition === openPosition.id ? "auto" : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}>
                <motion.div
                  className="bg-gradient-to-r from-[#D4CFFF] to-[#BCB6F6] rounded-b-[11px] relative"
                  initial={{y: -20, opacity: 0}}
                  animate={{
                    y: hoveredOpenPosition === openPosition.id ? 0 : -20,
                    opacity: hoveredOpenPosition === openPosition.id ? 1 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                    delay: hoveredOpenPosition === openPosition.id ? 0 : 0,
                  }}>
                  {/* Diagonal columns background effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    {hoveredOpenPosition === openPosition.id &&
                      Array.from({length: 35}, (_, i) => (
                        <div
                          key={i}
                          className="absolute h-full w-3 bg-white/10 transform rotate-12 origin-top animate-pulse"
                          style={{
                            left: `${i * 3}%`,
                            opacity: i < 17 ? 0 : Math.min(1, (i - 16) / 18),
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: `${2 + i * 0.1}s`,
                          }}
                        />
                      ))}
                  </div>

                  <motion.div
                    className="flex items-center justify-between text-sm px-4 py-2.5 relative z-10"
                    initial={{y: 10, opacity: 0}}
                    animate={{
                      y: hoveredOpenPosition === openPosition.id ? 0 : 10,
                      opacity: hoveredOpenPosition === openPosition.id ? 1 : 0,
                    }}
                    transition={{
                      delay: hoveredOpenPosition === openPosition.id ? 0.2 : 0,
                      duration: 0.2,
                    }}>
                    <span className="text-foreground/80 font-medium">
                      Click to view full job details and requirements
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-[32px] bg-background/95 hover:bg-background border-primary/20 hover:border-primary/40 text-foreground/90 shadow-sm group">
                          <span>View Details</span>
                          <ChevronRight
                            size={14}
                            className="group-hover:translate-x-0.5 transition-transform duration-200 ml-1"
                          />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="flex !max-w-[calc(35%-2rem)] flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:hidden">
                        <div className="overflow-y-auto">
                          <DialogHeader className="contents space-y-0 text-left">
                            {/* Header with same style as notifications popover */}
                            <div className="flex justify-between items-center gap-2 pb-0 p-6 ">
                              <DialogTitle className="font-medium text-[16px] m-0">
                                {openPosition.title}
                              </DialogTitle>
                              <DialogClose asChild>
                                <Button size={"icon"} className="w-6 h-6">
                                  <X size={12} />
                                </Button>
                              </DialogClose>
                            </div>
                            <DialogDescription asChild>
                              <div className="p-6 space-y-6">
                                {/* Job details section */}
                                <div className="space-y-2">
                                  <div className="border border-border/80 rounded-lg">
                                    <div className="flex items-center gap-3 text-sm">
                                      <div className="flex items-center gap-2 border-r border-border/80 pr-4 py-1.5 px-2 text-secondary min-w-[165px]">
                                        <Clock size={16} className="text-foreground/60" />
                                        <span className="text-sm whitespace-nowrap">
                                          Time commitment
                                        </span>
                                      </div>
                                      <span className="text-foreground whitespace-nowrap">
                                        {getTitleByValue(
                                          timeCommitment,
                                          openPosition.time_commitment,
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="border border-border/80 rounded-lg">
                                    <div className="flex items-center gap-3 text-sm">
                                      <div className="flex items-center gap-2 border-r border-border/80 pr-4 py-1.5 px-2 text-secondary min-w-[165px]">
                                        <Clock size={16} className="text-foreground/60" />
                                        <span className="text-sm whitespace-nowrap">
                                          Experience Level
                                        </span>
                                      </div>
                                      <span className="text-foreground whitespace-nowrap">
                                        {getTitleByValue(
                                          experienceLevels,
                                          openPosition.experience_level,
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Full description */}
                                <div className="space-y-2">
                                  <h3 className="font-medium text-[15px] text-foreground">
                                    About this role
                                  </h3>
                                  <p className="text-secondary text-sm leading-relaxed ">
                                    {openPosition.description}
                                  </p>
                                </div>

                                {/* Requirements */}
                                <div className="space-y-2">
                                  <h3 className="font-medium text-[15px] text-foreground">
                                    Requirements
                                  </h3>
                                  <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">
                                    {openPosition.requirements}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <h3 className="font-medium text-[15px] text-foreground">
                                    Required skills
                                  </h3>
                                  <div className="pt-1">
                                    <TagsList
                                      skills={openPosition.required_skills_with_images || []}
                                    />
                                  </div>
                                </div>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                        </div>
                        <DialogFooter className="border-t px-6 py-4">
                          <div className="flex justify-between items-center gap-2 bg-background w-full">
                            <Button variant={"outline"} size={"xs"}>
                              <Bookmark size="16" />
                              Add to favorites
                            </Button>
                            <Button variant={"secondary"} size={"xs"}>
                              Apply
                            </Button>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectOpenPositions;
