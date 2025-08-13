import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {DropdownOption} from "@/types/settingsFieldsTypes";
import {useState} from "react";
import {useFormContext} from "react-hook-form";
import FormErrorLabel from "../FormErrorLabel";
import {cn} from "@/lib/utils";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";

export default function SelectInput({
  id,
  placeholder,
  name,
  className,
  options,
  error,
  disabled,
  loading,
}: {
  id: string;
  placeholder: string;
  name: string;
  className: string;
  options: DropdownOption[];
  error?: {message?: string} | undefined;
  disabled?: boolean;
  loading?: boolean;
}) {
  const {setValue, watch} = useFormContext();
  const selectedValue = watch(name);
  const [internalValue, setInternalValue] = useState<string | null>(selectedValue || null);

  const handleSelectChange = (value: string) => {
    if (value === internalValue) {
      setValue(name, "", {shouldValidate: true});
      setInternalValue(null);
    } else {
      setValue(name, value, {shouldValidate: true});
      setInternalValue(value);
    }
  };

  const isDisabled = !!disabled || !!loading;

  return (
    <div className="space-y-2">
      <Select onValueChange={handleSelectChange} value={selectedValue} disabled={isDisabled}>
        <SelectTrigger
          id={id}
          className={cn(
            error &&
              "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
            className,
          )}>
          {loading ? (
            <div className="flex items-center gap-2">
              <LoadingButtonCircle size={16} />
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto">
          {options.map((option, index) => {
            return (
              <SelectItem
                key={index}
                value={option.value ?? option.title}
                onClick={() => handleSelectChange(option.value ?? option.title)}>
                {option.title}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <FormErrorLabel error={error} />
    </div>
  );
}
