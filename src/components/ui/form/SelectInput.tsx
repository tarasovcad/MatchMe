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

export default function SelectInput({
  id,
  placeholder,
  name,
  className,
  options,
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

  return (
    <div className="space-y-2">
      <Select onValueChange={handleSelectChange} value={selectedValue}>
        <SelectTrigger id={id} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto">
          {options.map((option, index) => {
            return (
              <SelectItem
                key={index}
                value={option.title}
                onClick={() => handleSelectChange(option.title)}>
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
