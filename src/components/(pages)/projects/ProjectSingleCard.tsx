import ProfileAddToFavoriteBtn from "@/components/favourites/ProfileAddToFavoriteBtn";
import {Button} from "@/components/shadcn/button";
import MainGradient from "@/components/ui/Text";
import {getNameInitials} from "@/functions/getNameInitials";
import {CardMatchMeUser} from "@/types/user/matchMeUser";
import {BellRing, MessageCircle, Rocket, Search, Star, Wrench} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Avatar from "boring-avatars";
import AuthGate from "@/components/other/AuthGate";
import {Project} from "@/types/projects/projects";

const ProfilesSinlgeCard = ({
  project,
  userId,
  customButton,
  label,
  labelName,
}: {
  project: Project;
  userId: string | undefined | null;
  customButton?: React.ReactNode;
  label?: string;
  labelName?: string;
}) => {
  return (
    <div className="relative">
      <div className="p-4 border border-border rounded-[12px]">
        {/* {label && (
          <div className="px-1.5 py-0.5 rounded-[6px] border border-border text-secondary text-[11px] absolute top-0 left-4 -translate-y-[55%] bg-background z-10">
            {label} <span className="text-black/80 font-semibold">{labelName}</span>
          </div>
        )} */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center gap-2 h-[38px]">
            <div className="flex items-center gap-3 ">
              {project.project_image && project.project_image.length > 0 && (
                <div className="w-[38px] h-[38px] rounded-[6px] p-[5px] border border-border shrink-0">
                  <Image
                    src={project.project_image[0].url}
                    alt={`${project.name} project picture`}
                    width={26}
                    height={26}
                    quality={100}
                    className="object-cover shrink-0"
                    unoptimized
                  />
                </div>
              )}

              <Link href={`/projects/${project.slug}`}>
                <MainGradient
                  as="h4"
                  className="font-medium  text-[18px] hover:text-foreground/60 line-clamp-1 transition-colors duration-300">
                  {project.name}
                </MainGradient>
              </Link>
            </div>
          </div>
          <p className="text-[14px] text-secondary line-clamp-2 h-[42px]">{project.tagline}</p>
          <div className="flex flex-col gap-1 text-[14px] text-secondary">
            <div className="flex items-center gap-2">
              <Star size={16} strokeWidth={2} className="shrink-0" />
              <span className="line-clamp-1">
                {" "}
                {Array.isArray(project?.category)
                  ? project?.category.join(", ")
                  : project?.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench size={16} strokeWidth={2} className="shrink-0" />
              <span className="line-clamp-1">
                {" "}
                {Array.isArray(project?.technology_stack)
                  ? project?.technology_stack.join(", ")
                  : project?.technology_stack}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket size={16} strokeWidth={2} className="shrink-0" />
              <span className="line-clamp-1">{project.current_stage}</span>
            </div>
          </div>
          <div className="flex items-center gap-[10px] pt-3">
            {customButton ? (
              customButton
            ) : (
              <Link href={`/projects/${project.slug}`} className="w-full">
                <Button variant={"secondary"} className="w-full">
                  View Project
                </Button>
              </Link>
            )}

            <AuthGate userSessionId={userId}>
              <Button variant="outline" size="icon" className="h-[38px] w-[38px] shrink-0">
                <MessageCircle size="16" color="currentColor" strokeWidth={1.8} />
              </Button>
            </AuthGate>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilesSinlgeCard;
