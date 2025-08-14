"use client";

import {Badge} from "@/components/shadcn/badge";
import {Hash} from "lucide-react";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";

const KeywordTagList = ({tags, type}: {tags: string[]; type: "projects" | "profiles"}) => {
  const href = type === "projects" ? "/projects" : "/profiles";
  const label = type === "projects" ? "Categories:" : "Skills:";

  const [expanded, setExpanded] = useState(false);
  const [maxKeywords, setMaxKeywords] = useState(10);
  const [keywordsToShow, setKeywordsToShow] = useState<string[]>(tags?.slice(0, maxKeywords) || []);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const updateMaxKeywords = () => {
    const width = window.innerWidth;
    if (width < 640) {
      setMaxKeywords(5);
    } else if (width < 1024) {
      setMaxKeywords(7);
    } else {
      setMaxKeywords(10);
    }
  };

  useEffect(() => {
    updateMaxKeywords();
    window.addEventListener("resize", updateMaxKeywords);
    return () => window.removeEventListener("resize", updateMaxKeywords);
  }, []);

  useEffect(() => {
    setKeywordsToShow(expanded ? tags || [] : tags?.slice(0, maxKeywords) || []);
  }, [maxKeywords, expanded, tags]);

  return (
    <div className={`flex flex-col justify-between pt-15 items-start gap-3`}>
      <div className={`flex flex-col gap-[1px] w-full`}>
        <p className="font-medium text-foreground text-base">{label}</p>
      </div>
      <motion.div className="w-full flex flex-wrap gap-2" layout>
        <AnimatePresence initial={false}>
          {keywordsToShow.map((tag) => (
            <motion.div
              key={tag}
              layout
              initial={{opacity: 0, scale: 0.8}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.8}}
              transition={{duration: 0.2}}>
              <Link className="cursor-pointer group " href={`${href}?tag=${tag.toLowerCase()}`}>
                <Badge
                  variant="outline"
                  className="text-foreground/60 bg-[#F0F0F0] text-sm group-hover:text-foreground/80 gap-[1px] transition-colors duration-200">
                  <Hash className="size-3 font-medium text-secondary group-hover:text-foreground/60 transition-colors duration-200 " />
                  {tag.toLowerCase()}
                </Badge>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {tags && tags.length > maxKeywords && (
          <motion.button
            layout
            onClick={toggleExpanded}
            className="flex items-center gap-1 font-medium text-foreground/80 hover:text-foreground/80 text-sm hover:underline transition-colors duration-300 ease-in-out cursor-pointer">
            {expanded ? "Read Less" : `+ ${tags.length - maxKeywords} more`}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default KeywordTagList;
