"use client";
import MainGradient from "@/components/ui/Text";
import {MatchMeUser} from "@/types/user/matchMeUser";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";

const TagsList = ({
  user,
  skills,
}: {
  user: MatchMeUser;
  skills: {name: string; image_url: string}[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const [maxSkills, setMaxSkills] = useState(10);
  const [skillsToShow, setSkillsToShow] = useState(
    user.skills?.slice(0, maxSkills),
  );

  const toggleExpanded = () => {
    setExpanded(!expanded);
    if (expanded) {
      setSkillsToShow(user.skills?.slice(0, maxSkills));
    } else {
      setSkillsToShow(user.skills || []);
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
    setSkillsToShow(
      expanded ? user.skills || [] : user.skills?.slice(0, maxSkills),
    );
  }, [maxSkills, expanded, user.skills]);

  return (
    <motion.div
      className="flex flex-wrap items-center gap-[18px] w-full"
      layout // This enables automatic animations when children change
    >
      <AnimatePresence initial={false}>
        {skillsToShow?.map((tag: string) => {
          const skill = skills.find((skill) => skill.name === tag);
          const skillImage = skill?.image_url;
          return (
            <motion.div
              key={tag}
              className="flex items-center gap-2"
              layout
              initial={{opacity: 0, scale: 0.8}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.8}}
              transition={{duration: 0.2}}>
              {skillImage && (
                <div className="flex justify-center items-center border border-border rounded-radius w-7 h-7">
                  {skillImage ? (
                    <Image src={skillImage} alt={tag} width={17} height={17} />
                  ) : (
                    ""
                  )}
                </div>
              )}
              <MainGradient as="span" className="font-medium text-[14px]">
                {tag}
              </MainGradient>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <motion.button
        layout
        onClick={toggleExpanded}
        className="flex items-center gap-1 font-medium text-foreground hover:text-foreground/80 text-sm hover:underline transition-colors duration-300 ease-in-out cursor-pointer">
        {expanded
          ? "Read Less"
          : user.skills && `+ ${user.skills.length - maxSkills} more`}
      </motion.button>
    </motion.div>
  );
};

export default TagsList;
