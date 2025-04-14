import {DropdownOption} from "@/types/settingsFieldsTypes";
import {useState} from "react";
import {useFormContext} from "react-hook-form";
import FormErrorLabel from "./FormErrorLabel";
import {CheckIcon, ChevronDownIcon, SearchIcon} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/command";
import {Button} from "../shadcn/button";
import {cn} from "@/lib/utils";
import {useCountries} from "@/hooks/useCountries";

export default function SelectInputWithSearch({
  id,
  placeholder,
  name,
  className,
  options: defaultOptions,
  error,
}: {
  id: string;
  placeholder: string;
  name: string;
  className: string;
  options: DropdownOption[];
  error?: {message?: string} | undefined;
}) {
  const {setValue, watch} = useFormContext();
  const selectedValue = watch(name);
  const [internalValue, setInternalValue] = useState<string | null>(
    selectedValue || null,
  );
  const [open, setOpen] = useState<boolean>(false);

  const isCountrySelect = name === "location";
  const {countries} = useCountries(isCountrySelect && open);

  const options = isCountrySelect ? countries : defaultOptions;

  const handleSelectChange = (value: string) => {
    if (value === internalValue) {
      setValue(name, "", {shouldValidate: true});
      setInternalValue(null);
    } else {
      setValue(name, value, {shouldValidate: true});
      setInternalValue(value);
    }
    setOpen(false);
  };

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
              "bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
              className,
            )}>
            <span
              className={cn(
                "truncate",
                !selectedValue && "text-muted-foreground",
              )}>
              {selectedValue
                ? options.find((option) => option.title === selectedValue)
                    ?.title
                : placeholder}
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
          <Command>
            <CommandInput placeholder="Search options..." />
            <CommandList>
              <CommandEmpty>No option found</CommandEmpty>
              <CommandGroup>
                {options.map((option, index) => (
                  <CommandItem
                    key={index}
                    value={option.title}
                    onSelect={(currentValue) => {
                      handleSelectChange(currentValue);
                    }}>
                    {option.title}
                    {selectedValue === option.title && (
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
}
