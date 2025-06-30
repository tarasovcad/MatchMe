import {motion, AnimatePresence} from "framer-motion";
import {useState} from "react";
import ProjectOpenPositions from "./ProjectOpenPositions";
import SimpleInput from "@/components/ui/form/SimpleInput";
import {Button} from "@/components/shadcn/button";
import {Filter} from "lucide-react";
import ProjectTeamMembers from "./ProjectTeamMembers";

export default function ProjectTabs() {
  const [activeTab, setActiveTab] = useState("team-members");

  const tabs = [
    {value: "open-positions", label: "Open Positions"},
    {value: "team-members", label: "Team Members"},
    {value: "posts", label: "Posts"},
  ];

  return (
    <div className="@container">
      <div className="flex @max-[735px]:flex-col justify-between gap-8 @max-[735px]:gap-3 py-4">
        <div className="flex items-start w-fit pt-2 ">
          <div className="h-auto rounded-none bg-transparent p-0 relative flex">
            {tabs.map((tab, index) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                disabled={tab.value === "posts"}
                className={`relative rounded-none border-b border-border py-3 transition-colors duration-200 cursor-pointer hover:bg-muted/50 flex items-center disabled:pointer-events-none disabled:opacity-50 ${
                  index === 0 ? "px-0 pr-2" : "px-4.5"
                } ${activeTab === tab.value ? "bg-transparent shadow-none" : ""}

                `}>
                <motion.span
                  className="relative z-10 text-[15px] flex items-center font-medium"
                  initial={{opacity: 0.7}}
                  animate={{opacity: activeTab === tab.value ? 1 : 0.7}}
                  transition={{duration: 0.2}}>
                  {tab.label}

                  {tab.value === "open-positions" && (
                    <div className="px-1 py-0.5 border border-border rounded-[5px] w-fit font-medium text-[10px] text-secondary leading-[13px] ml-1.5">
                      12
                    </div>
                  )}
                </motion.span>

                {/* Animated underline indicator */}
                {activeTab === tab.value && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                    layoutId="activeTab"
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex max-[480px]:flex-col justify-between items-center gap-3 max-[480px]:gap-2">
          <SimpleInput
            placeholder="Search "
            className=""
            search
            disabled={activeTab === "team-members"}
          />
          <div className="flex gap-3 max-[480px]:gap-2 max-[480px]:w-full">
            <Button
              size={"xs"}
              className="max-[480px]:w-full"
              disabled={activeTab === "team-members"}>
              <Filter size={16} strokeWidth={2} className="text-foreground/90" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full">
        <AnimatePresence mode="wait">
          {activeTab === "open-positions" && (
            <motion.div
              key="open-positions"
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -20}}
              transition={{duration: 0.15, ease: "easeInOut"}}
              className="w-full pt-2">
              <ProjectOpenPositions />
            </motion.div>
          )}
          {activeTab === "team-members" && (
            <motion.div
              key="team-members"
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -20}}
              transition={{duration: 0.15, ease: "easeInOut"}}
              className="w-full">
              <ProjectTeamMembers />
            </motion.div>
          )}
          {activeTab === "posts" && (
            <motion.div
              key="posts"
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -20}}
              transition={{duration: 0.15, ease: "easeInOut"}}
              className="w-full">
              <p className="text-muted-foreground p-4 text-center text-xs">Content for Posts</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
