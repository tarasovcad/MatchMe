import {Briefcase, Calendar, Clock, Languages, MapPin, Search, Wrench} from "lucide-react";
import {Filter} from "@/store/filterStore";
import {languages} from "../forms/(settings)/languages";
import {timeCommitment} from "@/data/projects/timeCommitmentOptions";
import {seniorityLevels} from "../forms/(settings)/seniorityLevels";

export const profileFiltersData: Filter[] = [
  {
    title: "Current Role",
    icon: Briefcase,
    value: "public_current_role",
    type: "searchInput",
    showSearchInput: false,
    showInFilterBtn: true,
  },
  {
    title: "Lookling for",
    icon: Search,
    value: "looking_for",
    type: "multiSelect",
    options: [{title: "Team Member"}, {title: "Co-Founder"}, {title: "Startups"}],
    showSearchInput: true,
    showInFilterBtn: true,
  },
  {
    title: "Skills",
    icon: Wrench,
    value: "skills",
    type: "tagsSearch",
    showSearchInput: true,
    showInFilterBtn: true,
  },
  {
    title: "Seniority Level",
    icon: Briefcase,
    value: "seniority_level",
    type: "multiSelect",
    options: seniorityLevels,
    showSearchInput: true,
    showInFilterBtn: true,
  },
  {
    title: "Time Commitment",
    icon: Clock,
    value: "time_commitment",
    type: "multiSelect",
    options: timeCommitment.map((opt) => ({title: opt.title, value: opt.value})),
    showSearchInput: true,
    showInFilterBtn: true,
  },
  {
    title: "Age",
    icon: Calendar,
    value: "age",
    type: "multiSelect",
    options: [
      {title: "18-24 years old", value: "18-24"},
      {title: "25-34 years old", value: "25-34"},
      {title: "35-44 years old", value: "35-44"},
      {title: "45-54 years old", value: "45-54"},
      {title: "55-64 years old", value: "55-64"},
      {title: "65+ years old", value: "65-150"},
    ],
    showSearchInput: true,
    showInFilterBtn: true,
  },
  {
    title: "Location",
    icon: MapPin,
    value: "location",
    type: "multiSelect",
    showInFilterBtn: true,
  },
  {
    title: "Languages",
    icon: Languages,
    value: "languages",
    type: "multiSelect",
    options: languages.map((language) => ({title: language.value})),
    showInFilterBtn: true,
  },
];
