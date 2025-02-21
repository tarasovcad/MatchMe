import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {DropdownOption} from "@/types/settingsFieldsTypes";

export default function SelectInput({
  id,
  placeholder,
  name,
  className,
  options,
}: {
  id: string;
  placeholder: string;
  name: string;
  className: string;
  options: DropdownOption[];
}) {
  return (
    <div className="space-y-2">
      <Select name={name}>
        <SelectTrigger id={id} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
          {options.map((option, index) => {
            return (
              <SelectItem key={index} value={option.title}>
                {option.title}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

{
  /* <InputComponent
id={fieldInputProps[0].id}
placeholder={fieldInputProps[0].placeholder}
type={fieldType}
disabled={fieldInputProps[0].disabled}
name="firstName"
className={`${fieldInputProps[0].disabled && "bg-muted shadow-none !text-foreground"}`}
/> */
}
