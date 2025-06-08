"use client";
import React from "react";
import {motion} from "framer-motion";
import AnalyticsSectionHeader from "./AnalyticsSectionHeader";

const AnalyticsBarList = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  const barChartData = [
    {role: "Full Stack Developer", count: 3, percentage: 100},
    {role: "Frontend Developer", count: 1, percentage: 5},
    {role: "Backend Developer", count: 2, percentage: 10},
    {role: "UI/UX Designer", count: 1, percentage: 5},
    {role: "Product Manager", count: 1, percentage: 5},
    {role: "Scrum Master", count: 1, percentage: 5},
  ];

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
    <div className="w-full border border-border rounded-[12px] p-[18px]">
      <AnalyticsSectionHeader title={title} description={description} icon={icon} />
      <motion.div
        className="w-full flex flex-col gap-1.5 mt-[18px] mb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        {barChartData.map((item, index) => {
          return (
            <motion.div
              key={item.role + item.percentage}
              className="h-[30px] relative w-full font-medium flex items-center justify-between group"
              variants={itemVariants}>
              <motion.div
                className="h-[30px] w-full bg-primary/50 group-hover:bg-primary/70 absolute rounded-md transition-colors duration-300 ease-in-out"
                variants={barVariants}
                style={
                  {
                    "--target-width": `${item.percentage}%`,
                  } as React.CSSProperties
                }
              />
              <span className="text-[13px] pl-1 z-10 text-foreground">{item.role}</span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-foreground/60 pr-1 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform translate-x-2 group-hover:translate-x-0">
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
