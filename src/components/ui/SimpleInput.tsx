import {Input} from "@/components/shadcn/input";
import {Label} from "@/components/shadcn/label";
import {Mail} from "lucide-react";
import {useId} from "react";

interface SimpleInputProps {
  mail?: boolean;
  label: string;
  placeholder: string;
  type: string;
}

const SimpleInput = ({
  mail,
  label = "undefined",
  placeholder = "undefined",
  type,
}: SimpleInputProps) => {
  const id = useId();
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          type={type}
          className={`w-full ${mail ? "peer ps-9" : ""} `}
        />
        {mail && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Mail size={16} strokeWidth={2} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleInput;
