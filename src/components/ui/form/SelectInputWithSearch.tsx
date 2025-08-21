import {DropdownOption} from "@/types/settingsFieldsTypes";
import {useEffect, useState} from "react";
import {useFormContext} from "react-hook-form";
import FormErrorLabel from "../FormErrorLabel";
import {CheckIcon, ChevronDownIcon} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/shadcn/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/command";
import {Button} from "../../shadcn/button";
import {cn} from "@/lib/utils";
import {useCountries} from "@/hooks/useCountries";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";

export default function SelectInputWithSearch({
  id,
  placeholder,
  name,
  className,
  options: defaultOptions,
  error,
  disabled,
  loading,
}: {
  id: string;
  placeholder: string;
  name: string;
  className?: string;
  options: DropdownOption[];
  error?: {message?: string} | undefined;
  disabled?: boolean;
  loading?: boolean;
}) {
  const {setValue, watch} = useFormContext();
  const selectedValue = watch(name);

  const [internalValue, setInternalValue] = useState<string | null>(selectedValue || null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setInternalValue(selectedValue || null);
  }, [selectedValue]);

  const isCountrySelect = name === "location";
  const {countries} = useCountries(isCountrySelect ? true : open);

  const options = isCountrySelect ? countries : defaultOptions;

  const handleSelectChange = (optionValue: string, optionTitle: string) => {
    // Use value if it exists, otherwise use title (for backwards compatibility)
    const valueToSet = optionValue || optionTitle;

    if (valueToSet === selectedValue) {
      setValue(name, "", {shouldValidate: true});
      setInternalValue(null);
    } else {
      setValue(name, valueToSet, {shouldValidate: true});
      setInternalValue(valueToSet);
    }
    setOpen(false);
  };

  // Find the selected option to display its title
  const selectedOption = options.find((option) => {
    const optionValue = (option as DropdownOption).value || option.title;
    return optionValue === selectedValue;
  });

  const isDisabled = !!disabled || !!loading;

  return (
    <div>
      <Popover open={open} onOpenChange={(val) => !isDisabled && setOpen(val)}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isDisabled}
            className={cn(
              "bg-background hover:bg-background border-input max-h-[36px]  w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
              error &&
                "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
              className,
            )}>
            <span
              className={cn(
                "truncate flex items-center gap-2",
                !selectedValue && "text-muted-foreground/70",
              )}>
              {selectedOption?.title || (loading ? <LoadingButtonCircle size={16} /> : placeholder)}
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
            <CommandInput placeholder="Search options..." className="" />
            <CommandList>
              <CommandEmpty>No option found</CommandEmpty>
              <CommandGroup className="p-1">
                {options.map((option, index) => {
                  const optionValue = (option as DropdownOption).value || option.title;
                  const isSelected = selectedValue === optionValue;

                  return (
                    <CommandItem
                      key={index}
                      value={option.title}
                      onSelect={() => {
                        handleSelectChange(optionValue, option.title);
                      }}>
                      {option.title}
                      {isSelected && <CheckIcon size={16} className="ml-auto" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormErrorLabel error={error} />
    </div>
  );
}
