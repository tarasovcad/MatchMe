import Link from "next/link";
import React from "react";

interface SingleTabProps {
  link: string;
  title: string;
  active?: boolean;
}

const SettingsTabs = () => {
  return (
    <div className="flex items-center gap-2">
      <SingleTab link="/settings/profile" title="Profile" />
      <SingleTab link="/settings/profile" title="Profile" active />
    </div>
  );
};

const SingleTab = ({link, title, active}: SingleTabProps) => {
  return (
    <div>
      <Link
        href={link}
        className={`py-2 px-[14px] border border-border rounded-radius text-secondary font-medium ${active && "bg-[#F4F4F5] text-foreground"}`}>
        {title}
      </Link>
    </div>
  );
};

export default SettingsTabs;
