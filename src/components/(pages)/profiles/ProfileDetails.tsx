"use client";
import {useCountryFlag} from "@/hooks/useCountryFlag";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {ArrowUpRight} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, {JSX} from "react";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";

const PROFILE_DETAILS = [
  {title: "Current role", value: "public_current_role"},
  {title: "Looking For", value: "looking_for"},
  {title: "Years of Experience", value: "years_of_experience"},
  {title: "Seniority Level", value: "seniority_level"},
  {title: "Languages Spoken", value: "languages"},
  {title: "Location", value: "location"},
  {title: "Pronouns", value: "pronouns"},
  {title: "Personal Website", value: "personal_website"},
  {title: "Time Commitment", value: "time_commitment"},
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
    case "time_commitment": {
      const found = timeCommitment.find((opt) => opt.value === String(value));
      return <p className="text-[14px] text-foreground">{found?.title ?? String(value)}</p>;
    }
    case "years_of_experience": {
      const years = Number(value);
      const yearText = years === 1 ? "year" : "years";
      return (
        <p className="text-[14px] text-foreground">
          {years} {yearText}
        </p>
      );
    }
    case "seniority_level":
      return <p className="text-[14px] text-foreground">{String(value)}</p>;
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
        const hasValue = (() => {
          if (rawValue === null || rawValue === undefined) return false;
          if (Array.isArray(rawValue)) return rawValue.length > 0;
          if (typeof rawValue === "string") return rawValue.trim() !== "";
          return true;
        })();
        if (!hasValue) return null;
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
