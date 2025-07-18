"use client";
import {getAllProfiles} from "@/actions/profiles/profiles";
import {cardVariants, pageHeaderVariants, pageContainerVariants} from "@/utils/other/variants";
import {motion} from "framer-motion";
import React from "react";
import InfiniteItemLoader from "../InfiniteItemLoader";

import {User} from "@supabase/supabase-js";
import {profileFiltersData} from "@/data/filter/profileFiltersData";
import MainGradient, {SecGradient} from "@/components/ui/Text";
import NewItemsCounter from "@/components/ui/NewItemsCounter";
import {CardMatchMeUser} from "@/types/user/matchMeUser";
import ProfilesSingleCardSkeleton from "../profiles/ProfilesSingleCardSkeleton";
import {getAllProjects} from "@/actions/projects/projects";
import ProjectSingleCard from "./ProjectSingleCard";
import {Project} from "@/types/projects/projects";

const ProjectsClientPage = ({userSession}: {userSession: User | null}) => {
  const renderProjectItem = (
    project: Project,
    isLast: boolean,
    ref: ((node: HTMLDivElement) => void) | null,
    userId: string,
  ) => (
    <motion.div ref={isLast ? ref : null} key={project.id} variants={cardVariants}>
      <ProjectSingleCard project={project} userId={userId} />
    </motion.div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={pageContainerVariants}>
      {/* Header Section */}
      <motion.div
        className="flex flex-col justify-center items-center gap-2.5 py-14"
        variants={pageHeaderVariants}>
        <NewItemsCounter
          table="projects"
          itemType={{
            singular: "project",
            plural: "projects",
          }}
        />
        <MainGradient
          as="h1"
          className="font-semibold text-3xl sm:text-4xl lg:text-5xl text-center">
          Discover Your Next Big Opportunity
        </MainGradient>
        <SecGradient
          as="h2"
          className="px-3 max-w-[742px] text-[15px] sm:text-[16px] lg:text-[18px] text-center">
          Discover projects that need your unique talents. Connect with ambitious teams and build
          the portfolio that takes your career to the next level.
        </SecGradient>
      </motion.div>

      {/* Infinite Item Loader */}
      <InfiniteItemLoader
        userSession={userSession}
        fetchItems={getAllProjects}
        renderItem={renderProjectItem}
        renderSkeleton={() => <ProfilesSingleCardSkeleton />}
        filtersData={profileFiltersData}
        type="projects"
        itemsPerPage={15}
      />
    </motion.div>
  );
};

export default ProjectsClientPage;
