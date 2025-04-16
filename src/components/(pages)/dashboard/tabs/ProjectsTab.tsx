import React from "react";
import AnalyticsCardList, {AnalyticsCardListProps} from "@/components/analytics/AnalyticsCardList";

const ProjectsTab = () => {
  const analyticsData = [
    {title: "Projects Created", number: 16, type: "positive", analyticsNumber: 9},
    {title: "Projects Joined", number: 4, type: "negative", analyticsNumber: 1},
    {title: "Requests Sent & Received", number: 52, type: "positive", analyticsNumber: 23},
    {title: "Total Projects Joined", number: 4, type: "negative", analyticsNumber: 15},
  ] as AnalyticsCardListProps["data"];

  return <AnalyticsCardList data={analyticsData} />;
};

export default ProjectsTab;
