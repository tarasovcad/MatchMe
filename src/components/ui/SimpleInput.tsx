import {Label} from "@/components/shadcn/label";
import {Mail} from "lucide-react";
import {cn} from "@/lib/utils";
import {UseFormRegisterReturn} from "react-hook-form";
interface SimpleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mail?: boolean;
  label: string;
  placeholder: string;
  type: string;
  id: string;
  register?: UseFormRegisterReturn<string>;
  name: string;
  error?: {message?: string} | undefined;
}

const SimpleInput = ({
  mail,
  label = "undefined",
  placeholder = "undefined",
  type,
  id,
  register,
  className,
  name,
  error,
  ...props
}: SimpleInputProps) => {
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <input
          className={cn(
            "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
            type === "search" &&
              "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
            type === "file" &&
              "p-0 pr-3 italic text-muted-foreground/70 file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-input file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic file:text-foreground",
            mail && "peer ps-9",
            error &&
              "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
            className,
          )}
          type={type}
          id={id}
          placeholder={placeholder}
          name={name}
          {...register}
          {...props}
        />
        {mail && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Mail size={16} strokeWidth={2} aria-hidden="true" />
          </div>
        )}
      </div>
      {error?.message && (
        <p className="mt-2 text-xs text-destructive">{error.message}</p>
      )}
    </div>
  );
};

export default SimpleInput;
