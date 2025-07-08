"use client";

import {Button} from "@/components/shadcn/button";
import {useState, useEffect} from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  Settings,
  Users,
  Megaphone,
  Globe,
  Copy,
  Twitter,
  Linkedin,
  ArrowRight,
  Sparkles,
  Trophy,
  ExternalLink,
  ShieldCheck,
  CheckCheck,
  Check,
  Heart,
  Timer,
} from "lucide-react";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/shadcn/stepper";
import {ProjectCreationFormData} from "@/validation/project/projectCreationValidation";
import {useRouter} from "next/navigation";
import ProjectSingleCard from "../../projects/ProjectSingleCard";
import {Project} from "@/types/projects/projects";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import ShareIcons from "@/components/other/ShareIcons";
import Link from "next/link";

interface ProjectSuccessStepProps {
  projectData: ProjectCreationFormData;
}

const ProjectSuccessStep = ({projectData}: ProjectSuccessStepProps) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fireConfetti = () => {
      // Create a burst of confetti from the center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {y: 0.6},
        colors: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"],
      });

      // Add a second burst with different timing
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: {x: 0},
          colors: ["#10b981", "#3b82f6", "#8b5cf6"],
        });
      }, 200);

      // Add a third burst from the other side
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: {x: 1},
          colors: ["#10b981", "#3b82f6", "#8b5cf6"],
        });
      }, 400);
    };

    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(fireConfetti, 200);

    return () => clearTimeout(timer);
  }, []);

  const nextSteps = [
    {
      step: 1,
      icon: Settings,
      title: "Polish Your Project Details",
      description:
        "Upload a compelling project image, refine your description, and add demo links to make your project stand out",
      action: "Complete Setup",
      time: "15-20 min",
      benefit: "5x higher engagement rate",
      link: `/project/${projectData.slug}/settings`,
    },
    {
      step: 2,
      icon: Users,
      title: "Invite Your First Co-founder",
      description:
        "Add a trusted teammate or co-founder to help validate ideas and share responsibilities",
      action: "Add Team Member",
      time: "2-3 min",
      benefit: "Double your project credibility",
      link: `/project/${projectData.slug}/team`,
    },
    {
      step: 3,
      icon: Megaphone,
      title: "Define What Help You Need",
      description:
        "Create specific job postings for skills you're missing - be clear about expectations and time commitment",
      action: "Post Open Roles",
      time: "10-15 min",
      benefit: "Attract the right talent faster",
      link: `/project/${projectData.slug}/open-positions/create`,
    },
    {
      step: 4,
      icon: Globe,
      title: "Launch & Get Initial Feedback",
      description:
        "Share your project with friends, family, and professional networks to gather honest feedback",
      action: "Share Project",
      time: "5-10 min",
      benefit: "Validate your idea early",
      link: `/project/${projectData.slug}`,
    },
    {
      step: 5,
      icon: Heart,
      title: "Connect with Like-minded Builders",
      description:
        "Browse other projects, offer help, and build relationships that could lead to partnerships or mentorship",
      action: "Explore Community",
      time: "20-30 min",
      benefit: "Build your startup network",
      link: `/projects`,
    },
  ];

  // Generate project URL from slug
  const projectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/projects/${projectData.slug}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const mainActions = [
    {
      icon: Settings,
      title: "Manage Project",
      description: "Configure settings, update details, and customize your project",
      link: `/project/${projectData.slug}/settings`,
      variant: "default" as const,
    },
    {
      icon: Users,
      title: "Add Team Members",
      description: "Invite collaborators and build your dream team",
      link: `/project/${projectData.slug}/team`,
      variant: "secondary" as const,
    },
    {
      icon: Megaphone,
      title: "Post Open Positions",
      description: "Share job opportunities and attract talent",
      link: `/project/${projectData.slug}/open-positions/create`,
      variant: "secondary" as const,
    },
    {
      icon: Globe,
      title: "View Public Page",
      description: "See how your project appears to the world",
      link: `/project/${projectData.slug}`,
      variant: "outline" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-8 py-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Check className="w-5.5 h-5.5 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground/80">
          Project Created Successfully!
        </h1>
        <p className="text-base sm:text-lg text-secondary mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0 max-w-2xl mx-auto">
          Your project has been created and is now live! You can view it on your dashboard or
          explore other projects to find potential teammates.
        </p>
      </div>

      {/* Main Actions */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mainActions.map((action, index) => (
            <Link
              href={action.link}
              key={index}
              className="border border-border rounded-[12px] p-4 hover:border-foreground/20 transition-colors cursor-pointer ">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 rounded-[8px] border border-border transition-colors">
                  <action.icon className="w-5 h-5 text-foreground transition-colors" />
                </div>

                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-1  transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                  <Button variant={"outline"} size="sm" className="w-fit h-[36px]  transition-all">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* What's Next Section */}
      <div className="border border-border rounded-[12px] p-4.5 bg-background">
        <div className="flex flex-col gap-[3px] mb-6">
          <div className="flex items-center gap-1.5">
            <div className="size-[25px] border border-border rounded-[5px] flex items-center justify-center">
              <span className="text-foreground text-sm font-medium">?</span>
            </div>
            <h6 className="text-foreground text-[16px] font-medium">What&apos;s Next?</h6>
          </div>
          <p className="text-secondary text-xs font-medium">
            Follow these steps to get your project up and running
          </p>
        </div>

        <Stepper defaultValue={2} orientation="vertical" className="w-full">
          {nextSteps.map((item) => (
            <StepperItem
              key={item.step}
              step={item.step}
              className="relative items-start not-last:flex-1">
              <div className="flex items-start gap-3 pb-8 last:pb-0 w-full">
                <StepperIndicator className="h-7 w-7" />

                <div className="mt-0.5 text-left flex-1">
                  <StepperTitle className="font-medium text-foreground transition-colors text-base mb-1">
                    {item.title}
                  </StepperTitle>
                  <StepperDescription className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </StepperDescription>

                  <div className="flex items-center gap-1 text-xs text-foreground/60 mb-3">
                    <div className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      <span>{item.time}</span>
                    </div>
                    <span>•</span>
                    <span>{item.benefit}</span>
                  </div>

                  <Link href={item.link}>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-foreground/70 hover:no-underline hover:text-foreground p-0 font-medium transition-colors mt-2">
                      {item.action}
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
              {item.step < nextSteps.length && (
                <StepperSeparator className="absolute inset-y-0 top-[calc(1.8rem+0.125rem)] left-[14.5px] -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper:h-[calc(100%-1.8rem-0.25rem)]" />
              )}
            </StepperItem>
          ))}
        </Stepper>

        {/* Progress Indicator */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-[8px] border border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-[6px] border border-primary/20 flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Success Strategy</h4>
              <p className="text-sm text-muted-foreground">
                Projects with detailed profiles and at least one team member get 12x more
                applications. Complete your setup within 48 hours while motivation is high!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Project */}
      <div className="border border-border rounded-[12px] p-4.5 bg-background">
        <div className="flex flex-col gap-[3px] mb-[18px]">
          <div className="flex items-center gap-1.5 ">
            <div className="size-[25px] border border-border rounded-[5px] flex items-center justify-center">
              <Globe size={15} className="text-foreground" />
            </div>
            <h6 className="text-foreground text-[16px] font-medium">Share Your Project</h6>
          </div>

          <p className="text-secondary text-xs font-medium">
            Let the world know about your awesome project and start attracting collaborators!
          </p>
        </div>

        <TooltipProvider>
          <div className="flex items-center gap-2 py-2.5 px-3 bg-muted rounded-[8px] border border-border">
            <code className="flex-1 text-sm font-mono text-foreground truncate">{projectUrl}</code>

            <div className="flex items-center gap-2.5 border-l border-border pl-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => copyToClipboard(projectUrl)}
                    className="flex items-center gap-1 text-foreground/70 hover:text-foreground transition-colors cursor-pointer">
                    <Copy className="w-3 h-3" />
                    <div className="w-[49px] text-center">
                      <span className="text-sm inline-block">{copiedUrl ? "Copied!" : "Copy"}</span>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>Copy project URL</span>
                </TooltipContent>
              </Tooltip>

              <div className="w-[1px] h-4 bg-border"></div>

              <ShareIcons
                size={16}
                projectUrl={projectUrl}
                projectName={projectData.name}
                projectTagline={projectData.tagline}
                className="flex items-center gap-1 p-1"
              />
            </div>
          </div>
        </TooltipProvider>
      </div>

      {/* Success Tips */}
      <div className="border border-border rounded-[12px] p-6 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="text-center">
          <p className="text-foreground mb-2">
            <strong>💡 Insider tip:</strong> The most successful projects respond to applicants
            within 24 hours and clearly communicate their vision in the first message.
          </p>
          <p className="text-sm text-muted-foreground">
            Questions about building your team? Check out our{" "}
            <Link href="/docs">
              <Button variant={"link"} className="text-primary hover:underline font-medium p-0">
                founder&apos;s guide
              </Button>
            </Link>{" "}
            or{" "}
            <Link href="/support">
              <Button variant={"link"} className="text-primary hover:underline font-medium p-0">
                get help from our community
              </Button>
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectSuccessStep;
