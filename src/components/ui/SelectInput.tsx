import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {DropdownOption} from "@/types/settingsFieldsTypes";
import {AnimatePresence, motion} from "framer-motion";
import {useFormContext, UseFormRegisterReturn} from "react-hook-form";

export default function SelectInput({
  id,
  placeholder,
  name,
  className,
  options,
  register,
  error,
}: {
  id: string;
  placeholder: string;
  name: string;
  className: string;
  register?: UseFormRegisterReturn<string>;
  options: DropdownOption[];
  error?: {message?: string} | undefined;
}) {
  const {setValue, watch} = useFormContext();
  const selectedValue = watch(name);
  return (
    <div className="space-y-2">
      <Select
        onValueChange={(value) => setValue(name, value, {shouldValidate: true})}
        value={selectedValue}>
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
      <AnimatePresence>
        {error?.message && (
          <motion.p
            className="text-xs text-destructive"
            layout
            initial={{opacity: 0, height: 0, marginTop: 0}}
            animate={{opacity: 1, height: "auto", marginTop: 8}}
            exit={{opacity: 0, height: 0, marginTop: 0}}
            transition={{duration: 0.1, ease: "easeInOut"}}>
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
