"use client";
import React from "react";
import {DropdownOption} from "@/types/settingsFieldsTypes";
import {RadioGroup, RadioGroupItem} from "../../shadcn/radio-group";
import {cn} from "@/lib/utils";
import {Controller, useFormContext} from "react-hook-form";
import FormErrorLabel from "../FormErrorLabel";

const SettingsSelectField = ({
  id,
  name,
  options,
  error,
}: {
  id: string;
  error?: {message?: string} | undefined;
  placeholder: string;
  name: string;
  options?: DropdownOption[];
}) => {
  const {control} = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({field}) => (
        <div className="space-y-2">
          <RadioGroup
            value={field.value || ""}
            className="flex max-[1165px]:flex-col gap-4 max-[1165px]:gap-0 w-full"
            onValueChange={(value) => field.onChange(value)}>
            {options?.map((option, index) => {
              const isActive = field.value === option.title;
              return (
                <label
                  htmlFor={`${id}-${option.title}`}
                  key={option.title}
                  className={cn(
                    "py-4 px-[18px] border border-border  w-full relative transition-colors cursor-pointer min-[1165px]:rounded-[8px] min-[1165px]:  ",
                    index === 0 && "max-[1165px]:rounded-t-[8px]",
                    index === 2 && "max-[1165px]:rounded-b-[8px]",

                    isActive
                      ? "bg-primary/[9%] border-primary"
                      : "bg-background hover:bg-primary/[7%] hover:border-primary/[30%]",
                  )}>
                  <RadioGroupItem
                    value={option.title}
                    id={`${id}-${option.title}`}
                    aria-describedby={`${id}-2-description`}
                    className="top-3 right-3 absolute w-[14px] h-[14px]"
                  />
                  <div className="flex flex-col gap-[4px] w-full min-[1165px]:max-w-[134px]">
                    <p className="font-medium text-foreground text-sm">{option.title}</p>
                    <p className="text-secondary text-xs">{option.description}</p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
          <FormErrorLabel error={error} />
        </div>
      )}
    />
  );
};

export default SettingsSelectField;
