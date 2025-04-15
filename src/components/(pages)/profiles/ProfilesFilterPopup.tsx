"use client";
import {useId, useState} from "react";
import {
  Calendar,
  ChevronRight,
  PanelBottomClose,
  Search,
  Clock,
  MapPin,
  Link2,
  CheckCircle,
  Briefcase,
  LucideIcon,
  Wrench,
  Languages,
  X,
  XIcon,
  Filter,
} from "lucide-react";

import {Button} from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import {cn} from "@/lib/utils";
import {RadioGroup, RadioGroupItem} from "@/components/shadcn/radio-group";
import NumberSliderWithGraph from "@/components/ui/NumberSliderWithGraph";
import {languages} from "@/data/forms/(settings)/languages";
import {Input} from "@/components/shadcn/input";
import SimpleInput from "@/components/ui/form/SimpleInput";
import CustomCheckbox from "@/components/ui/CustomCheckbox";

const filterProfileOptions: {
  id: string;
  label: string;
  description?: string;
  img?: LucideIcon;
  type?: string;
  data?: {value: string}[];
  options?: Array<{
    id: string;
    label: string;
    value?: string;
    from?: number;
    to?: number;
  }>;
}[] = [
  {
    id: "age",
    label: "Age",
    description: "Select age range",
    img: Calendar,
    type: "select",
    options: [
      {id: "18-24", label: "18-24 years old", from: 18, to: 24},
      {id: "25-34", label: "25-34 years old", from: 25, to: 34},
      {id: "35-44", label: "35-44 years old", from: 35, to: 44},
      {id: "45-54", label: "45-54 years old", from: 45, to: 54},
      {id: "55-64", label: "55-64 years old", from: 55, to: 64},
      {id: "65+", label: "65+ years old", from: 65},
    ],
  },
  {
    id: "looking-for",
    label: "Looking for",
    description: "Select looking for",
    img: Search,
    type: "select",
    options: [
      {id: "team-member", label: "Team member", value: "team-member"},
      {id: "co-founder", label: "Co-founder", value: "co-founder"},
      {id: "startups", label: "Startups", value: "startups"},
    ],
  },
  {
    id: "availability",
    label: "Work availability",
    type: "number",
    img: Clock,
  },
  {
    id: "location",
    label: "Location",
    img: MapPin,
  },
  {
    id: "languages",
    label: "Languages",
    img: Languages,
    data: languages,
    type: "searchSelect",
  },
  {
    id: "website",
    label: "Personal website",
    img: Link2,
  },
  {
    id: "verified",
    label: "Is verified",
    img: CheckCircle,
    type: "select",
    options: [
      {id: "true", label: "Yes", value: "true"},
      {id: "false", label: "No", value: "false"},
    ],
  },
  {
    id: "current-role",
    label: "Current role",
    img: Briefcase,
  },
  {
    id: "skills",
    label: "Skills",
    img: Wrench,
  },
];

export default function ProfilesFilterPopup() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const selectedFilter = filterProfileOptions.find((option) => option.id === activeCategory);

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const renderSelectedComponent = () => {
    switch (selectedFilter?.type) {
      case "select":
        return (
          <RadioGroup className="gap-2">
            {selectedFilter.options?.map((option, index) => {
              return (
                <label
                  htmlFor={`${option.id}-${option.label}`}
                  key={option.id}
                  className={cn(
                    "flex items-center gap-2 p-2 pl-8.5 border border-border rounded-[8px] w-full text-foreground hover:text-foreground bg-background hover:bg-primary/[7%] hover:border-primary/[30%] relative cursor-pointer",
                    "has-data-[state=checked]:bg-primary/[9%] has-data-[state=checked]:border-primary has-data-[state=checked]:text-primary",
                  )}
                  onClick={() => {
                    const radioButton = document.getElementById(`${option.id}-${index}`);
                    if (radioButton) {
                      radioButton.click();
                    }
                  }}>
                  <RadioGroupItem
                    value={option.id}
                    id={`${option.id}-${index}`}
                    aria-describedby={`${option.id}-${index}-option`}
                    className="left-3 absolute w-[14px] h-[14px]"
                  />
                  <p className="text-sm f">{option.label}</p>
                </label>
              );
            })}
          </RadioGroup>
        );
      case "number":
        return <NumberSliderWithGraph />;
      case "searchSelect":
        return (
          <div>
            <SimpleInput placeholder="Search for languages" search />
            <div className="flex flex-col gap-2 mt-3">
              {selectedFilter.data?.map((option) => (
                <div key={option.value} className="flex justify-between items-center gap-2 w-full">
                  <div className="flex items-center gap-2">
                    <CustomCheckbox id={option.value} name={option.value} showTerms={false} />
                    <div className="flex items-center gap-1">
                      <p className="text-sm">{option.value}</p>
                      <span className="text-muted-foreground text-sm">
                        {`(${getRandomInt(1, 281)})`}
                      </span>
                    </div>
                  </div>
                  <div className="p-1 cursor-pointer">
                    <XIcon size={16} className="opacity-60 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <p className="text-muted-foreground text-sm">Select a filter to see options</p>;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"xs"} className="max-[480px]:w-full">
          <Filter size={16} strokeWidth={2} className="text-foreground/90" />
          Filter
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 p-0 !max-w-[680px]">
        <div className="flex flex-col gap-2 p-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-left">Filter for: Profiles</DialogTitle>
            <DialogDescription className="text-left">
              See results in your view based on the filters you select here.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex">
          <div className="p-3 border-r border-border w-full max-w-[250px] h-[350px] overflow-y-auto">
            <div className="mb-2 px-2">
              <span className="font-medium">Filters</span>
            </div>
            {filterProfileOptions.map((option) => {
              return (
                <div key={option.id} className="relative">
                  <Button
                    className={cn(
                      "flex justify-between items-center gap-2 px-2 py-1.5 border-none w-full text-sidebar-foreground hover:text-foreground",
                      option.id === activeCategory
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "",
                    )}
                    onClick={() => setActiveCategory(option.id)}>
                    <div className="flex items-center gap-2">
                      {option.img && <option.img size={16} strokeWidth={2} />}
                      <span className="text-sm">{option.label}</span>
                    </div>

                    <ChevronRight size={16} strokeWidth={2} />
                    {/* <div className="top-1/2 right-7 absolute flex justify-center items-center bg-primary rounded-full w-[18px] h-[18px] font-medium text-white text-xs -translate-y-1/2">
                      2
                    </div> */}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="p-3 w-full h-[350px] overflow-y-auto">
            {selectedFilter ? (
              <>
                <div className="mb-3 pb-3 border-b border-border">
                  <p className="font-medium text-foreground">{selectedFilter.label}</p>
                  <p className="text-muted-foreground text-sm break-words">
                    {selectedFilter.description || "Select an option"}
                  </p>
                </div>
                {renderSelectedComponent()}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Select a filter to see options</p>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center bg-sidebar-background shadow-lg p-4 border-t border-border">
          <div>
            <span className="text-sidebar-foreground">Results: </span>
            <span className="font-medium">2,240</span>
          </div>
          <div className="flex gap-[10px]">
            <Button size={"xs"}>Cancel</Button>
            <Button size={"xs"} variant={"default"}>
              Apply filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
