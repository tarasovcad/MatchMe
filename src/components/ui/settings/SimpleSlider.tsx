"use client";

import {Input} from "@/components/shadcn/input";
import {Slider} from "@/components/shadcn/slider";
import {Controller, useFormContext} from "react-hook-form";
import FormErrorLabel from "../FormErrorLabel";

export default function SimpleSlider({
  name,
  error,
}: {
  name: string;
  error?: {message?: string} | undefined;
}) {
  const {control} = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({field}) => {
        const value = field.value || 0;

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Slider
                className="grow"
                value={[value]}
                onValueChange={(values) => field.onChange(values[0])}
                min={0}
                max={168}
                aria-label="Slider with input"
              />
              <Input
                className="px-2 py-1 w-12 h-8"
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(e) => {
                  const newValue = Math.max(
                    0,
                    Math.min(168, Number(e.target.value) || 0),
                  );
                  field.onChange(newValue);
                }}
                onBlur={field.onBlur}
                aria-label="Enter value"
              />
            </div>
            <FormErrorLabel error={error} />
          </div>
        );
      }}
    />
  );
}
