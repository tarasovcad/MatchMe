import ProfileAddToFavoriteBtn from "@/components/favourites/ProfileAddToFavoriteBtn";
import {Button} from "@/components/shadcn/button";
import MainGradient from "@/components/ui/Text";
import {getNameInitials} from "@/functions/getNameInitials";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {BellRing, Languages, Rocket, Search, Star, Wrench} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Avatar from "boring-avatars";
import AuthGate from "@/components/other/AuthGate";
import {Project} from "@/types/projects/projects";

const ProjectSingleCard = ({
  project,
  userId,
}: {
  project: Project;
  userId: string | undefined | null;
}) => {
  return (
    <div className="p-4 border border-border rounded-[12px]">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            {project.project_image && project.project_image.length > 0 ? (
              <div className="w-[36px] h-[36px] border border-border rounded-[6px] p-[5px]">
                <Image
                  src={project.project_image[0].url}
                  alt={`${project.name} profile picture`}
                  width={26}
                  height={26}
                  className="rounded-[3px] object-cover shrink-0"
                  unoptimized
                />
              </div>
            ) : (
              <Avatar
                name={getNameInitials(project.name)}
                size={42}
                className="rounded-full shrink-0"
                variant="beam"
              />
            )}

            <Link href={`/projects/${project.slug}`}>
              <h1 className="font-semibold text-[20px] text-foreground/80  hover:text-foreground/50 line-clamp-1  transition-colors duration-300">
                {project.name}
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-1 text-secondary">
            <BellRing size={14} strokeWidth={2} aria-hidden="true" className="text-secondary" />
            <span className="text-[13px]">•</span>
            <span className="text-[15px]">5d</span>
          </div>
        </div>
        <p className="text-[14px] text-secondary line-clamp-1">{project.tagline}</p>
        <div className="flex flex-col gap-1 text-[14px] text-secondary">
          <div className="flex items-center gap-2">
            <Star size={16} strokeWidth={2} className="shrink-0" />
            <span className="line-clamp-1">{project.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench size={16} strokeWidth={2} className="shrink-0" />
            <span className="line-clamp-1">
              {" "}
              {project.required_skills.map((skill) => skill).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Rocket size={16} strokeWidth={2} className="shrink-0" />
            <span className="line-clamp-1"> {project.current_stage}</span>
          </div>
        </div>
        {/* <div className="flex items-center gap-[10px] pt-3">
          <Link href={`/profiles/${profile.username}`} className="w-full">
            <Button variant={"secondary"} className="w-full">
              View Profile
            </Button>
          </Link>
          <AuthGate userSessionId={userId}>
            <ProfileAddToFavoriteBtn
              userId={userId}
              favoriteUserId={profile.id}
              isFavorite={isFavorite}
            />
          </AuthGate>
        </div> */}
      </div>
    </div>
  );
};

export default ProjectSingleCard;
