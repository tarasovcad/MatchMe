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
      render={({field}) => (
        <NumberField
          minValue={0}
          maxValue={100}
          step={1}
          value={field.value}
          onChange={(value) => field.onChange(value)}
          className={`w-full`}
          name={name}>
          <div className="space-y-2 w-full">
            <Group className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20">
              <Input
                className="flex-1 bg-background px-3 py-2 tabular-nums text-foreground focus:outline-none"
                placeholder="23"
                inputMode="numeric"
                pattern="\d*"
                id={id}
                {...field}
              />
              <div className="flex h-[calc(100%+2px)] flex-col">
                <Button
                  slot="increment"
                  className="-me-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50">
                  <ChevronUp size={12} strokeWidth={2} aria-hidden="true" />
                </Button>
                <Button
                  slot="decrement"
                  className="-me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50">
                  <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
                </Button>
              </div>
            </Group>
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
        </NumberField>
      )}
    />
  );
}
