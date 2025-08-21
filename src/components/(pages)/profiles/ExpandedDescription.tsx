"use client";
import {cn} from "@/lib/utils";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {ArrowUp} from "lucide-react";
import React, {useRef, useState, useEffect} from "react";
import {motion} from "framer-motion";
import {Project} from "@/types/projects/projects";

const ExpendedDescription = ({
  user,
  project,
  text,
  maxNmberOfLines = 9,
  id,
}: {
  user?: MatchMeUser;
  project?: Project;
  text?: string;
  maxNmberOfLines?: number;
  id: string;
}) => {
  const MAX_LINES = maxNmberOfLines;
  const LINE_HEIGHT = 16;
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [isLongText, setIsLongText] = useState(false);
  const [expanded, setExpanded] = useState(false);
  let content = "";
  if (text) {
    content = text;
  } else if (user) {
    content = user[id as keyof MatchMeUser] as string;
  } else if (project) {
    content = project[id as keyof Project] as string;
  } else {
    content = "";
  }

  const calculateLines = () => {
    if (paragraphRef.current) {
      const element = paragraphRef.current;
      const lineHeight = parseFloat(window.getComputedStyle(element).lineHeight);
      const lines = element.clientHeight / lineHeight;
      setIsLongText(lines > MAX_LINES);
    }
  };

  useEffect(() => {
    calculateLines();
    window.addEventListener("resize", calculateLines);
    return () => window.removeEventListener("resize", calculateLines);
  }, [content]);

  if (!content) return null;

  return (
    <div className="relative w-full">
      <motion.div
        className="relative overflow-hidden"
        animate={{
          height: expanded ? "auto" : isLongText ? `${MAX_LINES * LINE_HEIGHT}px` : "auto",
        }}
        initial={{
          height: isLongText ? `${MAX_LINES * LINE_HEIGHT}px` : "auto",
        }}
        transition={{duration: 0.4, ease: "easeInOut"}}>
        <p
          ref={paragraphRef}
          className="text-muted-foreground text-sm"
          dangerouslySetInnerHTML={{
            __html: typeof content === "string" ? content.replace(/\n/g, "<br />") : content,
          }}
        />
        {!expanded && isLongText && (
          <motion.div
            className="bottom-0 left-0 absolute bg-gradient-to-t from-white dark:from-black w-full h-10 pointer-events-none"
            initial={{opacity: 1}}
            animate={{opacity: expanded ? 0 : 1}}
            transition={{duration: 0.3}}
          />
        )}
      </motion.div>

      {isLongText && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "font-medium cursor-pointer  text-foreground hover:text-foreground/80 text-sm hover:underline transition-colors duration-300 ease-in-out flex items-center gap-1",
            expanded ? "mt-2" : "",
          )}>
          {expanded ? "Read Less" : "Read More"}
          <motion.div animate={{rotate: expanded ? 180 : 0}} transition={{duration: 0.3}}>
            <ArrowUp size={14} strokeWidth={2} className="transition duration-300 ease-in-out" />
          </motion.div>
        </button>
      )}
    </div>
  );
};

export default ExpendedDescription;
