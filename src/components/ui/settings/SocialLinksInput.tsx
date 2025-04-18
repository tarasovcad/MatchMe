"use client";
import {Input} from "@/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {cn} from "@/lib/utils";
import {DropdownOption, SocialOption} from "@/types/settingsFieldsTypes";
import {Controller, useFormContext, useWatch} from "react-hook-form";
import {Option} from "../../shadcn/multiselect";
import {AnimatePresence, motion} from "framer-motion";
import {FieldError} from "react-hook-form";

export default function SocialLinksInput({
  id,
  placeholder,
  name,
  socials,
  options,
}: {
  id: string;
  placeholder: string;
  name: string;
  socials: SocialOption[];
  options?: DropdownOption[];
  tags?: Option[];
}) {
  const {
    control,
    formState: {errors},
  } = useFormContext();

  const platformValues = useWatch({
    control,
    name: socials.map((_, index) => `${name}_${index + 1}_platform`),
  });

  return (
    <div className="flex flex-col gap-3">
      {socials.map((social, index) => {
        const fieldName = `${name}_${index + 1}`;
        const selectName = `${name}_${index + 1}_platform`;

        const fieldError = errors[fieldName];
        const selectError = errors[selectName];

        // Get available options by filtering out selected platforms
        const availableOptions = options?.filter((option) => {
          const isCurrentlySelected = platformValues[index] === option.title;
          const isSelectedElsewhere =
            platformValues.includes(option.title) && !isCurrentlySelected;
          return !isSelectedElsewhere;
        });

        return (
          <div className="space-y-2" key={index + social.title}>
            <div className="flex shadow-2xs rounded-lg">
              <div className="relative">
                <Controller
                  name={selectName}
                  control={control}
                  defaultValue={social.title}
                  render={({field}) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id={`${id}`}
                        className={cn(
                          "appearance-none items-center rounded-none rounded-s-lg border text-sm transition-shadow focus:z-10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-muted-foreground",
                          fieldError &&
                            "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
                        )}>
                        <SelectValue placeholder={social.title} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOptions?.map((option) => (
                          <SelectItem value={option.title} key={option.title}>
                            {option.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Controller
                name={fieldName}
                control={control}
                defaultValue=""
                render={({field}) => {
                  const handleChange = (
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    const value =
                      e.target.value === undefined || e.target.value === null
                        ? ""
                        : e.target.value;
                    field.onChange(value);
                  };

                  return (
                    <Input
                      placeholder={placeholder}
                      className={cn(
                        "-ms-px rounded-s-none shadow-none focus-visible:z-10",
                        fieldError &&
                          "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
                      )}
                      {...field}
                      onChange={handleChange}
                      value={field.value ?? ""}
                    />
                  );
                }}
              />
            </div>
            <AnimatePresence>
              {(fieldError || selectError) && (
                <motion.p
                  className="mt-1 text-destructive text-xs"
                  layout
                  initial={{opacity: 0, height: 0}}
                  animate={{opacity: 1, height: "auto"}}
                  exit={{opacity: 0, height: 0}}
                  transition={{duration: 0.1, ease: "easeInOut"}}>
                  {(fieldError as FieldError)?.message ||
                    (selectError as FieldError)?.message ||
                    "Invalid input"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
