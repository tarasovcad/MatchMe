"use client";
import React from "react";
import {motion} from "framer-motion";
import AnalyticsSectionHeader from "./AnalyticsSectionHeader";
import {Button} from "@/components/shadcn/button";
import {Maximize} from "lucide-react";

const AnalyticsBarList = ({
  title,
  description,
  icon,
  data,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  data: {
    label: string;
    count: number;
    percentage: number;
    relative: number;
  }[];
}) => {
  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const barVariants = {
    hidden: {
      width: "0%",
    },
    visible: {
      width: "var(--target-width)",
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  return (
    <div className="w-full border border-border rounded-[12px] p-[18px] relative">
      <AnalyticsSectionHeader title={title} description={description} icon={icon} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
        <Button size="xs" className="h-[34px] w-[100px] rounded-[8px] " variant="outline">
          View More
        </Button>
      </div>
      <motion.div
        className="w-full flex flex-col gap-1.5 mt-[18px] mb-[2px] relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(0,0,0,0.3) 90%, rgba(0,0,0,0.05) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(0,0,0,0.3) 90%, rgba(0,0,0,0.05) 100%)",
        }}>
        {data?.slice(0, 10).map((item) => {
          return (
            <motion.div
              key={item.label + item.percentage}
              className="h-[30px] relative w-full font-medium flex items-center justify-between group"
              variants={itemVariants}>
              <motion.div
                className="h-[30px] w-full bg-primary/50 group-hover:bg-primary/70 absolute rounded-md transition-colors duration-300 ease-in-out"
                variants={barVariants}
                style={
                  {
                    "--target-width": `${item.relative}%`,
                  } as React.CSSProperties
                }
              />
              <span className="text-[13px] pl-1.5 z-10 text-foreground/90">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-foreground/60 pr-1.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform translate-x-2 group-hover:translate-x-0">
                  {item.count}
                </span>
                <span className="text-[13px] text-foreground pr-1 z-10">{item.percentage}%</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default AnalyticsBarList;
