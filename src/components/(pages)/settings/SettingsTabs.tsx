import {settingsTabsData} from "@/data/tabs/settingsTabsData";
import Link from "next/link";
import React from "react";
interface SingleTabProps {
  link: string;
  title: string;
  active?: boolean;
}

const SettingsTabs = ({tab}: {tab: string | string[] | undefined}) => {
  return (
    <div className="overflow-x-auto whitespace-nowrap">
      <div className="flex items-center gap-2">
        {settingsTabsData.map((settingsTab) => {
          return (
            <SingleTab
              key={settingsTab.query}
              link={settingsTab.query}
              title={settingsTab.title}
              active={settingsTab.query === tab}
            />
          );
        })}
      </div>
    </div>
  );
};

const SingleTab = ({link, title, active}: SingleTabProps) => {
  return (
    <>
      {active ? (
        <button className="py-2 px-[14px] border border-border rounded-radius font-medium bg-[#F4F4F5] dark:bg-[#18181B] text-[#09090B] dark:text-[#E4E4E7] cursor-default text-sm">
          {title}
        </button>
      ) : (
        <Link
          href={`?tab=${link}`}
          className="py-2 px-[14px] border border-border rounded-radius text-secondary font-medium transition-colors duration-200 hover:bg-[#F2F2F5] hover:!text-[#09090B] dark:hover:bg-[#18181B] dark:hover:!text-[#E4E4E7] cursor-pointer text-sm">
          {title}
        </Link>
      )}
    </>
  );
};

export default SettingsTabs;
