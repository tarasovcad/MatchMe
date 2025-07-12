"use client";

import {motion} from "framer-motion";
import {useNewItemsCount} from "@/hooks/query/use-new-items-count";
import MainGradient from "@/components/ui/Text";
import {newPeopleVariants} from "@/utils/other/variants";

interface NewItemsCounterProps {
  table: "profiles" | "projects";
  itemType: {
    singular: string;
    plural: string;
  };
  className?: string;
}

export default function NewItemsCounter({table, itemType, className}: NewItemsCounterProps) {
  const {data: count, isLoading, error} = useNewItemsCount(table);

  // Don't render if there's an error
  if (error) {
    return null;
  }

  return (
    <motion.div
      className={`flex items-center gap-1.5 px-3 py-[5px] border border-border rounded-full ${className}`}
      variants={newPeopleVariants}>
      <div className="relative flex justify-center items-center w-2.5 h-2.5">
        <div className="bg-primary rounded-full w-2 h-2"></div>
        <div className="top-0 left-0 absolute bg-primary/50 rounded-full w-2.5 h-2.5 animate-ping"></div>
      </div>
      <MainGradient as="span" className="font-medium text-xs text-center">
        {isLoading
          ? "Loading..."
          : `${count} new ${count === 1 ? itemType.singular : itemType.plural} added`}
      </MainGradient>
    </motion.div>
  );
}
