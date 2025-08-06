"use client";
import {useCountryFlag} from "@/hooks/useCountryFlag";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {ArrowUpRight} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, {JSX} from "react";

const PROFILE_DETAILS = [
  {title: "Current role", value: "public_current_role"},
  {title: "Looking For", value: "looking_for"},
  {title: "Languages Spoken", value: "languages"},
  {title: "Location", value: "location"},
  {title: "Pronouns", value: "pronouns"},
  {title: "Personal Website", value: "personal_website"},
  {title: "Availability", value: "work_availability"},
  {title: "Age Range", value: "age"},
];

const AGE_RANGES = [
  {min: 18, max: 24, label: "18-24 years old"},
  {min: 25, max: 34, label: "25-34 years old"},
  {min: 35, max: 44, label: "35-44 years old"},
  {min: 45, max: 54, label: "45-54 years old"},
  {min: 55, max: 64, label: "55-64 years old"},
  {min: 65, max: Infinity, label: "65+ years old"},
];

const getAgeRangeLabel = (age: number) => {
  const range = AGE_RANGES.find((range) => age >= range.min && age <= range.max);
  return range?.label || "";
};

export const LocationWithFlag = ({location}: {location?: string | null}) => {
  if (!location) return <p className="text-[14px] text-foreground">N/A</p>;

  const {flag, isLoading} = useCountryFlag(location);

  return (
    <div className="flex items-center gap-1.5">
      {!isLoading && flag && (
        <div className="rounded-full w-4 h-4">
          <Image
            src={flag}
            alt={`${location} flag`}
            className="rounded-full w-full h-full object-cover"
            width={16}
            height={16}
          />
        </div>
      )}
      <p className="text-[14px] text-foreground">{location}</p>
    </div>
  );
};

const displayValue = (
  key: string,
  value: string | number | boolean | string[] | null,
  user: MatchMeUser,
): JSX.Element | string => {
  if (!value) return "";

  switch (key) {
    case "languages":
      return (
        <p className="text-[14px] text-foreground">
          {Array.isArray(value) ? value.join(", ") : String(value)}
        </p>
      );
    case "personal_website":
      return (
        <Link href={user.personal_website ?? ""} className="group flex items-center gap-[3px]">
          <p className="text-[14px] text-foreground group-hover:underline underline-offset-4 transition-all">
            {typeof value === "string" ? value.replace(/^[a-zA-Z]+:\/\//, "") : String(value)}
          </p>
          <ArrowUpRight
            size={16}
            className="group-hover:rotate-12 transition-transform duration-200"
          />
        </Link>
      );
    case "work_availability":
      return <p className="text-[14px] text-foreground">{`${value} hours / week`}</p>;
    case "age":
      return <p className="text-[14px] text-foreground">{getAgeRangeLabel(Number(value))}</p>;
    case "location":
      return <LocationWithFlag location={String(value)} />;
    default:
      return <p className="text-[14px] text-foreground">{String(value)}</p>;
  }
};

const ProfileDetails = ({user}: {user: MatchMeUser}) => {
  return (
    <div className="gap-4 grid grid-cols-3 max-[1100px]:grid-cols-2 max-[450px]:grid-cols-1">
      {PROFILE_DETAILS.map(({title, value}) => {
        const rawValue = user[value as keyof MatchMeUser];
        return (
          <div key={value} className="">
            <p className="text-muted-foreground text-xs break-words">{title}</p>
            {displayValue(value, rawValue as string | number | boolean | string[] | null, user)}
          </div>
        );
      })}
    </div>
  );
};

export default ProfileDetails;
