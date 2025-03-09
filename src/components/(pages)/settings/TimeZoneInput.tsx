"use client";

import {cn} from "@/lib/utils";
import {Button} from "@/components/shadcn/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import {CheckIcon, ChevronDownIcon} from "lucide-react";
import {useId, useMemo, useState} from "react";
import {Controller, useFormContext} from "react-hook-form";

export default function TimeZoneInput({name}: {name: string}) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const {getValues} = useFormContext();
  const timezones = Intl.supportedValuesOf("timeZone");

  const formattedTimezones = useMemo(() => {
    return timezones
      .map((timezone) => {
        const formatter = new Intl.DateTimeFormat("en", {
          timeZone: timezone,
          timeZoneName: "shortOffset",
        });
        const parts = formatter.formatToParts(new Date());
        const offset =
          parts.find((part) => part.type === "timeZoneName")?.value || "";
        const modifiedOffset = offset === "GMT" ? "GMT+0" : offset;
        const fullLabel = `(${modifiedOffset}) ${timezone.replace(/_/g, " ")}`;

        return {
          value: fullLabel,
          label: `(${modifiedOffset}) ${timezone.replace(/_/g, " ")}`,
          numericOffset: parseInt(
            offset.replace("GMT", "").replace("+", "") || "0",
          ),
        };
      })
      .sort((a, b) => a.numericOffset - b.numericOffset);
  }, [timezones]);

  return (
    <Controller
      name={name}
      defaultValue={getValues(name)}
      render={({field, fieldState: {error}}) => {
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id={id}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between bg-background hover:bg-background px-3 border-input outline-none focus-visible:outline-[3px] outline-offset-0 w-full h-9 font-normal text-foreground">
                <span
                  className={cn(
                    "truncate",
                    !field.value && "text-muted-foreground",
                  )}>
                  {field.value
                    ? formattedTimezones.find(
                        (timezone) => timezone.value === field.value,
                      )?.label
                    : "Select timezone"}
                </span>
                <ChevronDownIcon
                  size={16}
                  className="text-muted-foreground/80 shrink-0"
                  aria-hidden="true"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 border-input w-full min-w-[var(--radix-popper-anchor-width)]"
              align="start">
              <Command
                filter={(value, search) => {
                  const normalizedValue = value.toLowerCase();
                  const normalizedSearch = search
                    .toLowerCase()
                    .replace(/\s+/g, "");
                  return normalizedValue.includes(normalizedSearch) ? 1 : 0;
                }}>
                <CommandInput placeholder="Search timezone..." />
                <CommandList>
                  <CommandEmpty>No timezone found.</CommandEmpty>
                  <CommandGroup>
                    {formattedTimezones.map(({value: itemValue, label}) => (
                      <CommandItem
                        key={itemValue}
                        value={itemValue}
                        onSelect={(currentValue) => {
                          console.log(currentValue);
                          field.onChange(
                            currentValue === field.value ? "" : currentValue,
                          );
                          setOpen(false);
                        }}>
                        {label}
                        {field.value === itemValue && (
                          <CheckIcon size={16} className="ml-auto" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }}
    />
  );
}
