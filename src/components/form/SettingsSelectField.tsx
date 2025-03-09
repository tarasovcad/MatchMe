"use client";
import React, {useState} from "react";
import {DropdownOption} from "@/types/settingsFieldsTypes";
import {RadioGroup, RadioGroupItem} from "../shadcn/radio-group";
import {cn} from "@/lib/utils";
import {Controller, useFormContext} from "react-hook-form";
import {AnimatePresence, motion} from "framer-motion";

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
            className="flex w-full gap-4 max-[1165px]:gap-0 max-[1165px]:flex-col  "
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
                    className="absolute top-3 right-3 w-[14px] h-[14px]"
                  />
                  <div className="min-[1165px]:max-w-[134px] w-full flex flex-col gap-[4px]">
                    <p className="text-sm text-foreground font-medium">
                      {option.title}
                    </p>
                    <p className="text-secondary text-xs">
                      {option.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
          <AnimatePresence>
            {error?.message && (
              <motion.p
                className="text-xs text-destructive"
                layout
                initial={{opacity: 0, height: 0, marginTop: 0}}
                animate={{opacity: 1, height: "auto", marginTop: 8}}
                exit={{opacity: 0, height: 0, marginTop: 0}}
                transition={{duration: 0.1, ease: "easeInOut"}}>
                {error.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    />
  );
};

export default SettingsSelectField;
