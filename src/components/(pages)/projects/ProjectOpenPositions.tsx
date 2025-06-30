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
} from "lucide-react";
import TagsList from "../profiles/TagsList";
import Link from "next/link";
import {motion} from "framer-motion";
import ExpandedDescription from "../profiles/ExpandedDescription";

// Enhanced data structure for open positions
type Job = {
  id: number;
  title: string;
  shortDescription: string;
  fullDescription: string;
  requirements: string[];
  requiredSkills: string[];
  applicantCount: number;
  compensation: string;
  collaborationType: string;
  timeCommitment: string;
  postedBy: {
    username: string;
    avatar: string;
    postedDate: string;
  };
};

const jobs: Job[] = [
  {
    id: 1,
    title: "Software Engineer",
    shortDescription:
      "Join our tech team as a Software Engineer, where you will develop, test, and maintain high-quality software applications. You should have experience with modern programming languages and frameworks.",
    fullDescription:
      "We're looking for a passionate Software Engineer to join our engineering team and help build scalable, reliable software solutions. You'll work on challenging technical problems, contribute to architectural decisions, and collaborate with product teams to deliver features that delight our users. This role offers opportunities to work with modern technologies, participate in code reviews, and mentor junior developers.",
    requirements: [
      "3+ years of software development experience\nProficiency in React, Node.js, and TypeScript\nExperience with database design and optimization\nKnowledge of cloud platforms (AWS, GCP, or Azure)\nUnderstanding of software architecture patterns\nExperience with agile development methodologies",
    ],
    requiredSkills: ["React", "Node.js", "TypeScript", "AWS", "GCP", "Azure"],
    applicantCount: 42,
    compensation: "Voluntary",
    collaborationType: "Full-time",
    timeCommitment: "8 hour shift • Friday to Monday • Weekends",
    postedBy: {
      username: "techleader",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      postedDate: "1 day ago",
    },
  },
];

const ProjectOpenPositions = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [hoveredJobId, setHoveredJobId] = useState<number | null>(null);

  return (
    <div className="@container w-full">
      <div className="flex flex-col gap-6 w-full">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            className="relative"
            onHoverStart={() => setHoveredJobId(job.id)}
            onHoverEnd={() => setHoveredJobId(null)}>
            {/* Container with conditional gradient border */}
            <motion.div
              className="relative rounded-[11px] overflow-visible"
              animate={{
                padding: hoveredJobId === job.id ? "1px" : "0px",
                background:
                  hoveredJobId === job.id
                    ? "linear-gradient(to right, #D4CFFF, #BCB6F6)"
                    : "transparent",
                margin: hoveredJobId === job.id ? "-1px" : "0px",
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}>
              {/* Main card content */}
              <motion.div className="relative border border-border/70 rounded-[11px] p-4.5 bg-background">
                <div className="absolute bottom-4 right-4 flex items-center justify-center gap-1 text-secondary">
                  <UserRound size={16} />
                  <span className="text-sm">{job.applicantCount} applicants</span>
                </div>

                {/* Main content area */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  {/* Left side - Job info */}
                  <div className="flex-1">
                    <h2 className="font-semibold text-foreground/90 text-base leading-tight mb-2">
                      {job.title}
                    </h2>
                    <p className="text-secondary text-sm leading-relaxed">{job.shortDescription}</p>
                  </div>

                  <div className="min-w-[100px] flex items-center justify-end">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 rounded-lg border border-blue-200 text-blue-500 hover:bg-blue-100">
                      Open
                    </Badge>
                  </div>
                </div>

                {/* Bottom section - Profile info */}
                <div className="flex items-center gap-2">
                  <img
                    src={job.postedBy.avatar}
                    alt={job.postedBy.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Link
                      href={`/profiles/${job.postedBy.username}`}
                      className="text-secondary hover:text-foreground/80 transition-all duration-200 hover:underline">
                      {job.postedBy.username}
                    </Link>
                    <span className="opacity-50">•</span>
                    <span>{job.postedBy.postedDate}</span>
                  </div>
                </div>
              </motion.div>

              {/* Bottom expandable section that slides out */}
              <motion.div
                className="relative overflow-hidden"
                initial={{height: 0}}
                animate={{
                  height: hoveredJobId === job.id ? "auto" : 0,
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
                    y: hoveredJobId === job.id ? 0 : -20,
                    opacity: hoveredJobId === job.id ? 1 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                    delay: hoveredJobId === job.id ? 0.1 : 0,
                  }}>
                  {/* Diagonal columns background effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    {Array.from({length: 35}, (_, i) => (
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
                      y: hoveredJobId === job.id ? 0 : 10,
                      opacity: hoveredJobId === job.id ? 1 : 0,
                    }}
                    transition={{
                      delay: hoveredJobId === job.id ? 0.2 : 0,
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
                                {job.title}
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
                                        {job.timeCommitment}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="border border-border/80 rounded-lg">
                                    <div className="flex items-center gap-3 text-sm">
                                      <div className="flex items-center gap-2 border-r border-border/80 pr-4 py-1.5 px-2 text-secondary min-w-[165px]">
                                        <Clock size={16} className="text-foreground/60" />
                                        <span className="text-sm whitespace-nowrap">
                                          Collaboration type
                                        </span>
                                      </div>
                                      <span className="text-foreground whitespace-nowrap">
                                        {job.compensation}
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
                                        Intermediate
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
                                    {job.fullDescription}
                                  </p>
                                </div>

                                {/* Requirements */}
                                <div className="space-y-2">
                                  <h3 className="font-medium text-[15px] text-foreground">
                                    Requirements
                                  </h3>
                                  <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">
                                    {job.requirements}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <h3 className="font-medium text-[15px] text-foreground">
                                    Required skills
                                  </h3>
                                  <div className="pt-1">
                                    <TagsList
                                      skills={job.requiredSkills.map((skill) => ({
                                        name: skill,
                                      }))}
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
