"use client";
import React, {useState} from "react";
import {motion} from "framer-motion";
import AnalyticsSectionHeader from "./AnalyticsSectionHeader";
import {Button} from "@/components/shadcn/button";
import AnalyticsBarListDialog from "./AnalyticsBarListDialog";
import {containerVariants, itemVariants, barVariants} from "@/utils/other/analyticsVariants";
import {cn} from "@/lib/utils";
import Image from "next/image";

export const SingleBarSkeleton = () => {
  return (
    <div className="h-[30px] relative w-full font-medium flex items-center justify-between group">
      <div
        className="h-[30px] absolute rounded-md bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"
        style={
          {
            width: `100%`,
          } as React.CSSProperties
        }
      />
      <div className="h-4 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-20 ml-1.5 z-10" />
      <div className="flex items-center gap-2">
        <div className="h-3 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-8 z-10" />
        <div className="h-3 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-8 pr-1 z-10" />
      </div>
    </div>
  );
};

export const SingleBar = ({
  item,
  labelClassName,
}: {
  item: {label: string; count: number; percentage: number; relative: number; flag?: string};
  labelClassName?: string;
}) => {
  return (
    <motion.div
      key={item.label + item.percentage}
      className="h-[30px] relative w-full font-medium flex items-center justify-between group"
      variants={itemVariants}>
      <motion.div
        className="h-[30px] w-full bg-[#D9D1FF] dark:bg-primary  group-hover:bg-[#BBB3FF]  dark:group-hover:bg-primary/70 absolute rounded-md transition-colors duration-300 ease-in-out"
        variants={barVariants}
        style={
          {
            "--target-width": `${item.relative}%`,
          } as React.CSSProperties
        }
      />
      <div className="flex items-center gap-2 z-10 pl-1.5">
        {item.flag && (
          <Image
            src={item.flag}
            alt={item.label}
            width={16}
            height={12}
            className="w-[16px] h-[12px]"
          />
        )}
        <span className={cn("text-[13px]  text-foreground/90", labelClassName)}>{item.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-foreground/60 pr-1.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform translate-x-2 group-hover:translate-x-0">
          {item.count}
        </span>
        <span className="text-[13px] text-foreground pr-1 z-10">{item.percentage}%</span>
      </div>
    </motion.div>
  );
};

const AnalyticsBarList = ({
  title,
  description,
  icon,
  data,
  isLoading,
  error,
  button,
  maxItems = 10,
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
  isLoading: boolean;
  error: Error | null;
  button?: React.ReactNode;
  maxItems?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full border border-border rounded-[12px] p-[18px] relative mb-[17px] @container">
      <AnalyticsSectionHeader title={title} description={description} icon={icon} button={button} />
      {!isLoading && !error && data && data.length > maxItems && (
        <>
          <AnalyticsBarListDialog title={title} data={data} isOpen={isOpen} setIsOpen={setIsOpen} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <Button
              size="xs"
              className="h-[34px] w-[100px] rounded-[8px] "
              variant="outline"
              onClick={() => setIsOpen(true)}>
              View More
            </Button>
          </div>
        </>
      )}
      <motion.div
        className="w-full flex flex-col gap-1.5 mt-[18px] mb-[2px] relative"
        variants={isLoading ? {hidden: {}, visible: {}} : containerVariants}
        initial="hidden"
        animate="visible"
        style={
          !isLoading && !error && data && data.length > maxItems
            ? {
                maskImage:
                  "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(0,0,0,0.3) 90%, rgba(0,0,0,0.05) 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(0,0,0,0.3) 90%, rgba(0,0,0,0.05) 100%)",
              }
            : undefined
        }>
        {isLoading || error
          ? Array.from({length: maxItems}, (_, index) => (
              <SingleBarSkeleton key={`skeleton-${index}`} />
            ))
          : data?.slice(0, maxItems).map((item) => {
              return <SingleBar key={item.label + item.percentage} item={item} />;
            })}
      </motion.div>
    </div>
  );
};

export default AnalyticsBarList;
