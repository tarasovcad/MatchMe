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
import {Controller, useFormContext} from "react-hook-form";
import {AnimatePresence, motion} from "framer-motion";
import {FieldError} from "react-hook-form";
import {useCallback, useMemo, memo} from "react";

// Memoized SelectItem to prevent unnecessary re-renders
const MemoSelectItem = memo(({option}: {option: DropdownOption}) => (
  <SelectItem value={option.title}>{option.title}</SelectItem>
));
MemoSelectItem.displayName = "MemoSelectItem";

// Memoized SocialLink component to prevent parent re-renders
const SocialLink = memo(
  ({
    social,
    index,
    name,
    id,
    placeholder,
    availableOptions,
  }: {
    social: SocialOption;
    index: number;
    name: string;
    id: string;
    placeholder: string;
    availableOptions: DropdownOption[];
  }) => {
    const {
      control,
      formState: {errors},
    } = useFormContext();
    const fieldName = `${name}_${index + 1}`;
    const selectName = `${name}_${index + 1}_platform`;

    const fieldError = errors[fieldName];
    const selectError = errors[selectName];

    return (
      <div className="space-y-2">
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
                    {availableOptions.map((option) => (
                      <MemoSelectItem key={option.title} option={option} />
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
            render={({field}) => (
              <Input
                placeholder={placeholder}
                className={cn(
                  "-ms-px rounded-s-none shadow-none focus-visible:z-10",
                  fieldError &&
                    "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
                )}
                {...field}
              />
            )}
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
  },
);
SocialLink.displayName = "SocialLink";

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
}) {
  const {control} = useFormContext();

  // Memoize platform values calculation
  const platformValues = useMemo(
    () => socials.map((_, index) => `${name}_${index + 1}_platform`),
    [name, socials],
  );

  // Memoize available options calculation
  const getAvailableOptions = useCallback(
    (currentIndex: number, currentValue: string) => {
      return (
        options?.filter((option) => {
          const isSelectedElsewhere = platformValues
            .filter((_, index) => index !== currentIndex)
            .some((name) => control._getWatch(name) === option.title);
          return !isSelectedElsewhere || option.title === currentValue;
        }) || []
      );
    },
    [options, platformValues, control],
  );

  return (
    <div className="flex flex-col gap-3">
      {socials.map((social, index) => {
        const currentValue = control._getWatch(`${name}_${index + 1}_platform`);
        const availableOptions = getAvailableOptions(index, currentValue);

        return (
          <SocialLink
            key={`${name}_${index}`}
            social={social}
            index={index}
            name={name}
            id={id}
            placeholder={placeholder}
            availableOptions={availableOptions}
          />
        );
      })}
    </div>
  );
}
