import {UserProjects} from "@/actions/profiles/singleUserProfile";
import ProjectSinglePage from "@/app/projects/[slug]/page";
import React from "react";
import ProjectSingleCard from "../projects/ProjectSingleCard";
import {Project} from "@/types/projects/projects";

const ProfileProjectsList = ({projects, userId}: {projects: UserProjects; userId: string}) => {
  const {ownedProjects, joinedProjects} = projects;
  return (
    <>
      {ownedProjects.length > 0 && (
        <div className="flex flex-col justify-between items-start gap-3">
          <div className="flex flex-col gap-[1px] w-full max-w-[285px]">
            <p className="font-medium text-foreground text-sm">My Creations</p>
            <p className="text-muted-foreground text-xs break-words">
              Projects I’ve started to bring my ideas to life.
            </p>
          </div>
          <div className="w-full gap-6 container-grid grid grid-cols-3">
            {ownedProjects.map((project) => (
              <ProjectSingleCard key={project.id} project={project as Project} userId={userId} />
            ))}
          </div>
        </div>
      )}
      {projects.joinedProjects.length > 0 && (
        <div className="flex flex-col justify-between items-start gap-3">
          <div className="flex flex-col gap-[1px] w-full max-w-[285px]">
            <p className="font-medium text-foreground text-sm">Collaborations</p>
            <p className="text-muted-foreground text-xs break-words">
              Projects I’ve joined to help bring others’ ideas to life
            </p>
          </div>
          <div className="w-full min-[990px]:max-w-[652px]">
            {joinedProjects.map((project) => (
              <div key={project.id}>
                <ProjectSingleCard project={project as Project} userId={userId} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileProjectsList;
