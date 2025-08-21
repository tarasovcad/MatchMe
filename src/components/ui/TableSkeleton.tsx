"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/table";
import {Skeleton} from "@/components/shadcn/skeleton";
import {motion} from "framer-motion";

type ColumnConfig = {
  id: string;
  header: React.ReactNode;
  cell: React.ReactNode;
  size?: number;
  minSize?: number;
  maxSize?: number;
};

type TableSkeletonProps = {
  columns: ColumnConfig[];
  rowCount?: number;
  className?: string;
};

const TableSkeleton = ({columns, rowCount = 5, className = ""}: TableSkeletonProps) => {
  return (
    <div
      className={`border border-border rounded-[10px] overflow-x-auto scrollbar-thin ${className}`}>
      <Table className="w-full">
        <TableHeader className="bg-[#F9F9FA] dark:bg-[#101013]">
          <TableRow className="hover:bg-[#F9F9FA] dark:hover:bg-[#101013]">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className="relative !p-2 !px-2.5 text-[13px] last:border-r-0 text-left font-medium text-secondary h-auto border-r border-border"
                style={{width: column.size || 150}}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({length: rowCount}, (_, index) => (
            <motion.tr
              key={`skeleton-row-${index}`}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="hover:bg-muted/50 border-b border-border">
              {columns.map((column) => (
                <TableCell
                  key={`${column.id}-${index}`}
                  className="px-2.5 last:border-r-0 py-1 text-left text-foreground border-r border-border"
                  style={{width: column.size || 150}}>
                  {column.cell}
                </TableCell>
              ))}
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableSkeleton;
