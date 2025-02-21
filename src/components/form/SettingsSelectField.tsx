"use client";
import React, {useState} from "react";
import {DropdownOption} from "@/types/settingsFieldsTypes";
import {RadioGroup, RadioGroupItem} from "../shadcn/radio-group";
import {cn} from "@/lib/utils";

const SettingsSelectField = ({
  id,
  options,
}: {
  id: string;
  placeholder: string;
  name: string;
  options?: DropdownOption[];
}) => {
  const [selectedValue, setSelectedValue] = useState<string>("");
  return (
    <RadioGroup
      className="flex w-full gap-4"
      value={selectedValue}
      onValueChange={setSelectedValue}>
      {options?.map((option) => {
        const isActive = selectedValue === option.title;
        return (
          <label
            htmlFor={`${id}-${option.title}`}
            key={option.title}
            className={cn(
              "py-4 px-[18px] border border-border rounded-[8px] w-full relative transition-colors cursor-pointer ",
              isActive
                ? "bg-primary/[9%] border-primary"
                : "bg-background hover:bg-primary/[7%] hover:border-primary/[30%]",
            )}>
            <RadioGroupItem
              value={option.title}
              id={`${id}-${option.title}`}
              aria-describedby={`${id}-2-description`}
              className="absolute top-3 right-3 w-[14px] h-[14px]"
            />
            <div className="max-w-[134px] w-full flex flex-col gap-[4px]">
              <p className="text-sm text-foreground font-medium">
                {option.title}
              </p>
              <p className="text-secondary text-xs">{option.description}</p>
            </div>
          </label>
        );
      })}
    </RadioGroup>
  );
};

export default SettingsSelectField;
