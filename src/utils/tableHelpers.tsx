import React from "react";

export const renderOrDash = (value: React.ReactNode) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return <span className="text-muted-foreground">—</span>;
  }
  return value;
};

export const getOptionTitle = <T extends {title: string; value: string}>(
  value: string,
  options: T[],
) => {
  const option = options.find((option) => option.value === value);
  return option ? option.title : value;
};

export const renderSkills = (skills: string[], maxDisplay = 3) => {
  if (!skills || skills.length === 0) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex flex-no-wrap gap-2 items-center">
      {skills.slice(0, maxDisplay).map((skill) => (
        <div
          key={skill}
          className="h-6 bg-tag dark:bg-muted border border-input rounded-[6px] font-medium text-xs px-2 flex items-center text-foreground">
          {skill}
        </div>
      ))}
      {skills.length > maxDisplay && (
        <span className="text-xs text-muted-foreground">+{skills.length - maxDisplay}</span>
      )}
    </div>
  );
};

export const createProfileLink = (username: string | undefined, name: string | undefined) => {
  if (!name || !username) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <a href={`/profiles/${username}`} className="leading-none text-foreground/90 hover:underline">
      {name}
    </a>
  );
};

export const removeProtocol = (url: string | null | undefined): string => {
  if (!url) return "";

  // Remove common protocols
  return url.replace(/^(https?:\/\/|wss?:\/\/|ftp:\/\/|sftp:\/\/)/i, "");
};

export const tableStatusConfig = {
  open: "bg-[#009E61]",
  closed: "bg-[#EF1A2C]",
  draft: "bg-[#F5A623]",
};
