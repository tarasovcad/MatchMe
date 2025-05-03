import PageTitle from "@/components/pages/PageTitle";
import {Button} from "@/components/shadcn/button";
import React from "react";
import DashboardHeaderSelectDate from "./DashboardHeaderSelectDate";
import DashboardHeaderCompare from "./DashboardHeaderCompare";
import {CloudDownload} from "lucide-react";

const DashboardHeader = ({
  setDateRange,
  dateRange,
  setCompareDateRange,
  compareDateRange,
}: {
  setDateRange: (dateRange: string) => void;
  dateRange: string;
  setCompareDateRange: (compareDateRange: string) => void;
  compareDateRange: string;
}) => {
  return (
    <div className="@container">
      <div className="flex @max-[825px]:flex-col justify-between @min-[825px]:items-center @max-[825px]:gap-6">
        <PageTitle
          title="Dashboard Overview"
          subtitle="Track your followers, posts, and projects all in one place"
        />
        <div className="flex gap-1.5">
          <DashboardHeaderSelectDate setDateRange={setDateRange} dateRange={dateRange} />
          <DashboardHeaderCompare
            setCompareDateRange={setCompareDateRange}
            compareDateRange={compareDateRange}
          />
          <Button size="icon">
            <CloudDownload size={16} strokeWidth={2} className="opacity-90" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
