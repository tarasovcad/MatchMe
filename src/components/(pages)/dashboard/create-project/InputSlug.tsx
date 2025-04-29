"use client";
import React, {useCallback, useEffect, useState} from "react";
import SimpleInput from "../../../ui/form/SimpleInput";
import {Button} from "@/components/shadcn/button";
import {Controller, useFormContext} from "react-hook-form";
import {debounce} from "lodash";
import {toast} from "sonner";
import {hasProfanity} from "@/utils/other/profanityCheck";
import {checkSlugAvailabilityAction} from "@/actions/dashboard/create-project/checkSlugAvailabilityAction";
import {projectCreationValidationSchema} from "@/validation/project/projectCreationValidation";

// Add this array with your reserved slugs
const RESERVED_SLUGS = [
  "admin",
  "dashboard",
  "settings",
  "profile",
  "login",
  "signup",
  "home",
  "blog",
];

const InputSlug = ({
  placeholder,
  name = "slug",
  label,
}: {
  placeholder: string;
  name?: string;
  label?: string;
}) => {
  const [slugLoading, setSlugLoading] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const {
    control,
    setValue,
    watch,
    formState: {errors},
  } = useFormContext();

  const nameValue = watch("name");
  const slugValue = watch(name);

  const slugSchema = projectCreationValidationSchema.shape.slug;

  const checkSlugAvailability = async (slug: string) => {
    setSlugLoading(true);
    setIsSlugAvailable(null);

    if (hasProfanity(slug)) {
      toast.error("Slug contains inappropriate language. Please choose another.");
      setSlugLoading(false);
      setIsSlugAvailable(false);
      return;
    }

    try {
      const response = await checkSlugAvailabilityAction(slug);
      setSlugLoading(false);

      if (response.error) {
        console.log(response.error);
        toast.error(response.error);
        return;
      }

      if (response.message === "Slug is available") {
        setIsSlugAvailable(true);
      }

      if (response.message === "Slug is already taken") {
        setIsSlugAvailable(false);
        return;
      }
    } catch (error) {
      console.error("Error checking slug availability:", error);
      setSlugLoading(false);
      toast.error("Failed to check slug availability");
    }
  };

  const debouncedCheckSlug = useCallback(
    debounce((slug: string) => {
      if (!slug || !slugSchema.safeParse(slug).success) return;

      if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
        setIsSlugAvailable(false);
        toast.error("This slug is reserved and cannot be used");
        return;
      }

      if (hasProfanity(slug)) {
        setIsSlugAvailable(false);
        toast.error("Slug contains inappropriate language. Please choose another.");
        return;
      }

      checkSlugAvailability(slug);
    }, 500),
    [],
  );

  useEffect(() => {
    if (!slugValue || slugValue.length < 3) {
      debouncedCheckSlug.cancel();
      setIsSlugAvailable(null);
      setSlugLoading(false);
      return;
    }

    setIsSlugAvailable(null);
    setSlugLoading(true);

    if (RESERVED_SLUGS.includes(slugValue.toLowerCase())) {
      setIsSlugAvailable(false);
      setSlugLoading(false);
      return;
    }

    debouncedCheckSlug.cancel();
    debouncedCheckSlug(slugValue);

    return () => {
      debouncedCheckSlug.cancel();
    };
  }, [slugValue]);

  const generateSlug = () => {
    if (!nameValue) return;

    const newSlug = nameValue
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");

    setValue(name, newSlug, {shouldValidate: true});
  };

  return (
    <div className="flex items-start gap-2">
      <Controller
        control={control}
        name={name}
        render={({field}) => (
          <SimpleInput
            label={label}
            placeholder={placeholder}
            error={errors[name]}
            type="text"
            id={name}
            loading={slugLoading}
            name={field.name}
            isUsernameAvailable={isSlugAvailable}
            value={field.value}
            onChange={(e) => {
              const newValue = e.target.value.toLowerCase();
              field.onChange(newValue);
            }}
          />
        )}
      />
      <Button type="button" size="xs" onClick={generateSlug}>
        Generate
      </Button>
    </div>
  );
};

export default InputSlug;
