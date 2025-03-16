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
import {useCallback, useId, useState, memo} from "react";
import {Controller, useFormContext} from "react-hook-form";
import FormErrorLabel from "@/components/ui/FormErrorLabel";

// Memoize timezone data calculation
const timezones = Intl.supportedValuesOf("timeZone");

const formattedTimezones = timezones
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
      label: fullLabel,
      numericOffset: parseInt(
        offset.replace("GMT", "").replace("+", "") || "0",
      ),
    };
  })
  .sort((a, b) => a.numericOffset - b.numericOffset);

function TimeZoneInput({name}: {name: string}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const {getValues} = useFormContext();

  // Memoize filter function
  const filterTimezone = useCallback((value: string, search: string) => {
    const normalizedValue = value.toLowerCase();
    const normalizedSearch = search.toLowerCase().replace(/\s+/g, "");
    return normalizedValue.includes(normalizedSearch) ? 1 : 0;
  }, []);

  return (
    <Controller
      name={name}
      defaultValue={getValues(name)}
      render={({field, fieldState: {error}}) => {
        // Memoize select handler with functional update
        const handleSelect = useCallback(
          (currentValue: string) => {
            field.onChange(currentValue === field.value ? "" : currentValue);
            setOpen(false);
          },
          [field.onChange, field.value],
        );

        return (
          <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "justify-between bg-background hover:bg-background px-3 border-input outline-none focus-visible:outline-[3px] outline-offset-0 w-full h-9 font-normal text-foreground m-0",
                    error &&
                      "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20 hover:text-destructive",
                  )}>
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
                    className={cn(
                      "text-muted-foreground/80 shrink-0",
                      error && "text-destructive",
                    )}
                    aria-hidden="true"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 border-input w-full min-w-[var(--radix-popper-anchor-width)]"
                align="start">
                <Command filter={filterTimezone}>
                  <CommandInput placeholder="Search timezone..." />
                  <CommandList>
                    <CommandEmpty>No timezone found.</CommandEmpty>
                    <CommandGroup>
                      {formattedTimezones.map(({value: itemValue, label}) => (
                        <CommandItem
                          key={itemValue}
                          value={itemValue}
                          onSelect={handleSelect}>
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
            <FormErrorLabel error={error} />
          </div>
        );
      }}
    />
  );
}

export default memo(TimeZoneInput);
