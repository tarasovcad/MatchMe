"use client";
import {ChevronDown, ChevronUp} from "lucide-react";
import {Button, Group, Input, NumberField} from "react-aria-components";
import {Controller, useFormContext} from "react-hook-form";
import FormErrorLabel from "./FormErrorLabel";
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
            aria-label="Number input"
            name={name}>
            <div className="space-y-2 w-full">
              <Group className="inline-flex relative items-center data-disabled:opacity-50 shadow-black/5 shadow-xs m-0 border border-input data-focus-within:border-ring rounded-lg data-focus-within:outline-hidden data-focus-within:ring-[3px] data-focus-within:ring-ring/20 w-full h-9 overflow-hidden text-sm whitespace-nowrap transition-shadow">
                <Input
                  className="flex-1 bg-background px-3 py-2 focus:outline-hidden tabular-nums text-foreground"
                  placeholder="23"
                  inputMode="numeric"
                  pattern="\d*"
                  id={id}
                  aria-label="Number input"
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
              <FormErrorLabel error={error} />
            </div>
          </NumberField>
        );
      }}
    />
  );
}
