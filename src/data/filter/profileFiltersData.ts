import {Briefcase, Calendar, Clock, Languages, MapPin, Search, Wrench} from "lucide-react";
import {Filter} from "@/store/filterStore";
import {languages} from "../forms/(settings)/languages";

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
    title: "Availability",
    icon: Clock,
    value: "work_availability",
    type: "numberSelect",
    showSearchInput: false,
    numberSelectProps: {
      maxValue: 40,
    },
    showInFilterBtn: true,
  },
  {
    title: "Age",
    icon: Calendar,
    value: "age",
    type: "numberSelect",
    showSearchInput: false,
    numberSelectProps: {
      maxValue: 100,
    },
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
