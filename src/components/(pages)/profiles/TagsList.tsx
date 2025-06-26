"use client";
import MainGradient from "@/components/ui/Text";
import {MatchMeUser} from "@/types/user/matchMeUser";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Project} from "@/types/projects/projects";

const TagsList = ({skills}: {skills: {name: string; image_url?: string}[]}) => {
  const [expanded, setExpanded] = useState(false);
  const [maxSkills, setMaxSkills] = useState(10);

  const [skillsToShow, setSkillsToShow] = useState(skills?.slice(0, maxSkills));

  const toggleExpanded = () => {
    setExpanded(!expanded);
    if (expanded) {
      setSkillsToShow(skills?.slice(0, maxSkills));
    } else {
      setSkillsToShow(skills || []);
    }
  };

  const updateMaxSkills = () => {
    const width = window.innerWidth;
    if (width < 640) {
      // Mobile
      setMaxSkills(5);
    } else if (width < 1024) {
      // Tablet
      setMaxSkills(7);
    } else {
      // Desktop
      setMaxSkills(10);
    }
  };

  useEffect(() => {
    updateMaxSkills();
    window.addEventListener("resize", updateMaxSkills);
    return () => window.removeEventListener("resize", updateMaxSkills);
  }, []);

  useEffect(() => {
    setSkillsToShow(expanded ? skills || [] : skills?.slice(0, maxSkills));
  }, [maxSkills, expanded, skills]);

  return (
    <motion.div className="flex flex-wrap items-center gap-[18px] w-full" layout>
      <AnimatePresence initial={false}>
        {skillsToShow?.map((skill) => {
          const skillImage = skill?.image_url;
          return (
            <motion.div
              key={skill.name}
              className="flex items-center gap-2"
              layout
              initial={{opacity: 0, scale: 0.8}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.8}}
              transition={{duration: 0.2}}>
              {skillImage && (
                <div className="flex justify-center items-center border border-border rounded-radius w-7 h-7">
                  {skillImage ? (
                    <Image src={skillImage} alt={skill.name} width={17} height={17} />
                  ) : (
                    ""
                  )}
                </div>
              )}
              <MainGradient as="span" className="font-medium text-[14px]">
                {skill.name}
              </MainGradient>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {skills && skills.length > maxSkills && (
        <motion.button
          layout
          onClick={toggleExpanded}
          className="flex items-center gap-1 font-medium text-foreground hover:text-foreground/80 text-sm hover:underline transition-colors duration-300 ease-in-out cursor-pointer">
          {expanded ? "Read Less" : `+ ${skills.length - maxSkills} more`}
        </motion.button>
      )}
    </motion.div>
  );
};

export default TagsList;
