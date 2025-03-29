import {MatchMeUser} from "@/types/user/matchMeUser";
import {ArrowUpRight} from "lucide-react";
import Link from "next/link";
import React from "react";

const PROFILE_DETAILS = [
  {title: "Current role", value: "public_current_role"},
  {title: "Looking For", value: "looking_for"},
  {title: "Languages Spoken", value: "languages"},
  {title: "Timezone", value: "location_timezone"},
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
  const range = AGE_RANGES.find(
    (range) => age >= range.min && age <= range.max,
  );
  return range?.label || "";
};

const formatValue = (
  key: string,
  value: string | number | boolean | string[] | null,
): string => {
  if (!value) return "";

  switch (key) {
    case "languages":
      return Array.isArray(value) ? value.join(", ") : String(value);
    case "personal_website":
      return typeof value === "string"
        ? value.replace(/^[a-zA-Z]+:\/\//, "")
        : String(value);
    case "work_availability":
      return `${value} hours / week`;
    case "age":
      return getAgeRangeLabel(Number(value));
    default:
      return String(value);
  }
};

const ProfileDetails = ({user}: {user: MatchMeUser}) => {
  return (
    <div className="gap-4 grid grid-cols-3 max-[1100px]:grid-cols-2 max-[450px]:grid-cols-1">
      {PROFILE_DETAILS.map(({title, value}) => {
        const rawValue = user[value as keyof MatchMeUser];

        if (!rawValue || rawValue instanceof Date) {
          return null;
        }

        const formattedValue = formatValue(value, rawValue);

        return (
          <div key={value} className="">
            <p className="text-muted-foreground text-xs break-words">{title}</p>

            {value === "personal_website" ? (
              <Link
                href={user.personal_website ?? ""}
                className="group flex items-center gap-[3px]">
                <p className="text-[14px] text-foreground group-hover:underline underline-offset-4 transition-all">
                  {formattedValue}
                </p>
                <ArrowUpRight
                  size={16}
                  className="group-hover:rotate-12 transition-transform duration-200"
                />
              </Link>
            ) : (
              <p className="text-[14px] text-foreground">{formattedValue}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProfileDetails;
