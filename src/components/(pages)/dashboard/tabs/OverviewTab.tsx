import StatsCardWithLineChart from "@/components/analytics/StatsCardWithLineChart";
import {useEffect, useState} from "react";

const OverviewTab = () => {
  const [views, setViews] = useState([]);

  useEffect(() => {
    const fetchViews = async () => {
      const res = await fetch("/api/profile-views?slug=gameovcad");
      const data = await res.json();
      console.log(data);
    };

    fetchViews();
  }, []);

  return (
    <div>
      <StatsCardWithLineChart />
    </div>
  );
};

export default OverviewTab;
