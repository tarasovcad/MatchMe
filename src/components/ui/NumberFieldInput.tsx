"use client";

import {AnimatePresence, motion} from "framer-motion";
import {ChevronDown, ChevronUp} from "lucide-react";
import {Button, Group, Input, NumberField} from "react-aria-components";
import {Controller, useFormContext} from "react-hook-form";
export default function NumberFieldInput({
  id,
  name,
  error,
}: {
  id: string;
  name: string;
  error?: {message?: string} | undefined;
}) {
  const {control} = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({field}) => {
        console.log(field.value, "field.value");
        const handleChange = (value: number | string) => {
          // If the input is empty or NaN, pass an empty string to the form
          if (value === "" || Number.isNaN(value)) {
            field.onChange("");
          } else {
            field.onChange(value);
          }
        };

        return (
          <NumberField
            minValue={0}
            maxValue={100}
            step={1}
            value={field.value}
            onChange={handleChange}
            className={`w-full`}
            name={name}>
            <div className="space-y-2 w-full">
              <Group className="inline-flex relative items-center data-disabled:opacity-50 shadow-black/5 shadow-xs m-0 border border-input data-focus-within:border-ring rounded-lg data-focus-within:outline-hidden data-focus-within:ring-[3px] data-focus-within:ring-ring/20 w-full h-9 overflow-hidden text-sm whitespace-nowrap transition-shadow">
                <Input
                  className="flex-1 bg-background px-3 py-2 focus:outline-hidden tabular-nums text-foreground"
                  placeholder="23"
                  inputMode="numeric"
                  pattern="\d*"
                  id={id}
                  {...field}
                />
                <div className="flex flex-col h-[calc(100%+2px)]">
                  <Button
                    slot="increment"
                    className="flex flex-1 justify-center items-center bg-background hover:bg-accent disabled:opacity-50 -me-px border border-input w-6 h-1/2 text-muted-foreground/80 hover:text-foreground text-sm transition-shadow disabled:cursor-not-allowed disabled:pointer-events-none">
                    <ChevronUp size={12} strokeWidth={2} aria-hidden="true" />
                  </Button>
                  <Button
                    slot="decrement"
                    className="flex flex-1 justify-center items-center bg-background hover:bg-accent disabled:opacity-50 -me-px -mt-px border border-input w-6 h-1/2 text-muted-foreground/80 hover:text-foreground text-sm transition-shadow disabled:cursor-not-allowed disabled:pointer-events-none">
                    <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </div>
              </Group>
              <AnimatePresence>
                {error?.message && (
                  <motion.p
                    className="text-destructive text-xs"
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
          </NumberField>
        );
      }}
    />
  );
}
