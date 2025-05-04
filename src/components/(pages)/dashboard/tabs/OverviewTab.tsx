import {AnalyticsCardListProps} from "@/components/analytics/AnalyticsCardList";
import StatsCardWithLineChart from "@/components/analytics/StatsCardWithLineChart";
import {useDashboardStore} from "@/store/useDashboardStore";
import {User} from "@supabase/supabase-js";
import {useEffect, useState} from "react";

const OverviewTab = ({user}: {user: User}) => {
  const userUsername = user.user_metadata.username;

  const {dateRange} = useDashboardStore();

  useEffect(() => {
    const fetchViews = async () => {
      const startTime = new Date();
      const res = await fetch(
        `/api/profile-views?slug=${userUsername}&dateRange=${encodeURIComponent(dateRange)}`,
      );
      const data = await res.json();
      console.log(data);
      const endTime = new Date();
      console.log(`Fetched views in ${endTime.getTime() - startTime.getTime()}ms`);
    };

    fetchViews();
  }, [dateRange]);

  const data = [
    {
      title: "Total Views",
      number: 17461,
      type: "positive",
      analyticsNumber: 12,
      chartData: [
        {month: "January", desktop: 186, mobile: 80},
        {month: "February", desktop: 305, mobile: 200},
        {month: "March", desktop: 237, mobile: 120},
        {month: "April", desktop: 73, mobile: 190},
        {month: "May", desktop: 209, mobile: 130},
        {month: "June", desktop: 214, mobile: 140},
      ],
    },
    {
      title: "Followers Gained",
      number: 53,
      type: "positive",
      analyticsNumber: 6,
    },
    {
      title: "Posts Created",
      number: 163,
      type: "positive",
      analyticsNumber: 12,
    },
    {
      title: "Posts Likes",
      number: 6,
      type: "negative",
      analyticsNumber: 7,
    },
  ] as AnalyticsCardListProps["data"];

  return (
    <div>
      <StatsCardWithLineChart data={data} />
    </div>
  );
};

export default OverviewTab;
