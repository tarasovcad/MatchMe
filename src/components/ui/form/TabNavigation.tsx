import Link from "next/link";
import React from "react";

interface TabItemProps {
  link: string;
  title: string;
  active?: boolean;
  customLinkGenerator?: (link: string) => string;
}

const TabNavigation = ({
  tabsData,
  activeTab,
  customLinkGenerator,
}: {
  tabsData: {query: string; title: string}[];
  activeTab: string | string[] | undefined;
  customLinkGenerator?: (link: string) => string;
}) => {
  return (
    <div className="flex items-center gap-2">
      {tabsData.map((tabItem) => {
        return (
          <TabItem
            key={tabItem.query}
            link={tabItem.query}
            title={tabItem.title}
            active={tabItem.query === activeTab}
            customLinkGenerator={customLinkGenerator}
          />
        );
      })}
    </div>
  );
};

const TabItem = ({link, title, active, customLinkGenerator}: TabItemProps) => {
  const defaultLink = `?tab=${link}`;
  const linkHref = customLinkGenerator ? customLinkGenerator(link) : defaultLink;

  return (
    <>
      {active ? (
        <button className="bg-[#F4F4F5] dark:bg-[#18181B] px-[14px] py-2 border border-border rounded-radius font-medium text-[#09090B] dark:text-[#E4E4E7] text-sm whitespace-nowrap cursor-default">
          {title}
        </button>
      ) : (
        <Link
          href={linkHref}
          className="hover:bg-[#F2F2F5] dark:hover:bg-[#18181B] px-[14px] py-2 border border-border rounded-radius font-medium text-secondary hover:text-[#09090B]! dark:hover:text-[#E4E4E7]! text-sm whitespace-nowrap transition-colors duration-200 cursor-pointer">
          {title}
        </Link>
      )}
    </>
  );
};

export default TabNavigation;
