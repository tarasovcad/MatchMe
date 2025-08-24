import {Input} from "@/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {cn} from "@/lib/utils";
import {Controller, useFormContext} from "react-hook-form";
import FormErrorLabel from "../FormErrorLabel";

export default function PersonalWebsiteInput({
  id,
  placeholder,
  name,
  error,
  readOnly,
}: {
  id: string;
  placeholder: string;
  name: string;
  error?: {message?: string} | undefined;
  readOnly?: boolean;
}) {
  const {control, setValue, watch} = useFormContext();
  const websiteValue = watch(name) || "";

  // Extract protocol from current value or default to https://
  const getProtocolFromValue = (value: string) => {
    const match = value.match(/^(https?|ftp|sftp|wss?):\/\//);
    return match ? match[0] : "https://";
  };

  // Extract domain part without protocol
  const getDomainFromValue = (value: string) => {
    return value.replace(/^(https?|ftp|sftp|wss?):\/\//, "");
  };

  const currentProtocol = getProtocolFromValue(websiteValue);
  const domain = getDomainFromValue(websiteValue);

  return (
    <div className="space-y-2">
      <div className="flex rounded-lg">
        <div className="relative">
          <Select
            value={currentProtocol}
            onValueChange={
              readOnly
                ? undefined
                : (newProtocol) => {
                    setValue(name, newProtocol + domain, {shouldValidate: !!domain});
                  }
            }>
            <SelectTrigger
              id={`${id}-protocol`}
              className={cn(
                "appearance-none items-center rounded-none rounded-s-lg border text-sm transition-shadow focus:z-10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-muted-foreground",
                error &&
                  "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
                readOnly && "bg-muted",
              )}>
              <SelectValue placeholder="https://" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem disabled={readOnly} value="https://">
                https://
              </SelectItem>
              <SelectItem disabled={readOnly} value="http://">
                http://
              </SelectItem>
              <SelectItem disabled={readOnly} value="ftp://">
                ftp://
              </SelectItem>
              <SelectItem disabled={readOnly} value="sftp://">
                sftp://
              </SelectItem>
              <SelectItem disabled={readOnly} value="ws://">
                ws://
              </SelectItem>
              <SelectItem disabled={readOnly} value="wss://">
                wss://
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Controller
          name={name}
          control={control}
          render={({field}) => (
            <Input
              id={id}
              className={cn(
                "-ms-px rounded-s-none shadow-none focus-visible:z-10",
                error &&
                  "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
                readOnly && "bg-muted",
              )}
              placeholder={placeholder}
              type="text"
              value={domain}
              readOnly={readOnly}
              onChange={
                readOnly
                  ? undefined
                  : (e) => {
                      const newDomain = e.target.value.trim();
                      field.onChange(newDomain ? currentProtocol + newDomain : "");
                    }
              }
              onBlur={field.onBlur}
            />
          )}
        />
      </div>
      <FormErrorLabel error={error} />
    </div>
  );
}
