"use client";
import React, {useCallback, useEffect, useState, useMemo} from "react";
import SimpleInput from "../../../ui/form/SimpleInput";
import {Button} from "@/components/shadcn/button";
import {Controller, useFormContext} from "react-hook-form";
import {debounce} from "lodash";
import {hasProfanity} from "@/utils/other/profanityCheck";
import {useSlugAvailability} from "@/hooks/query/use-slug-availability";
import {projectCreationValidationSchema} from "@/validation/project/projectCreationValidation";
import {RESERVED_PROJECT_SLUGS} from "@/data/reserved_slugs";

const InputSlug = ({
  placeholder,
  name = "slug",
  label,
}: {
  placeholder: string;
  name?: string;
  label?: string;
}) => {
  const [debouncedSlug, setDebouncedSlug] = useState("");

  const {
    control,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: {errors},
  } = useFormContext();

  const nameValue = watch("name");
  const slugValue = watch(name);

  const slugSchema = projectCreationValidationSchema.shape.slug;

  // Debounce the slug value for the query
  const debouncedSetSlug = useCallback(
    debounce((slug: string) => {
      setDebouncedSlug(slug);
    }, 500),
    [],
  );

  const {
    data: slugAvailabilityData,
    isLoading: isSlugLoading,
    error: slugError,
    isError,
  } = useSlugAvailability(debouncedSlug);

  // Check for client-side validations (profanity, reserved slugs)
  const clientSideValidation = useMemo(() => {
    if (!debouncedSlug || debouncedSlug.length < 3) {
      return null;
    }

    if (!slugSchema.safeParse(debouncedSlug).success) {
      return null;
    }

    if (RESERVED_PROJECT_SLUGS.includes(debouncedSlug.toLowerCase())) {
      return {
        isValid: false,
        message: "This slug is reserved and cannot be used",
      };
    }

    if (hasProfanity(debouncedSlug)) {
      return {
        isValid: false,
        message: "Slug contains inappropriate language. Please choose another.",
      };
    }

    return {isValid: true};
  }, [debouncedSlug, slugSchema]);

  // Determine overall slug availability state
  const slugState = useMemo(() => {
    // If slug is too short or invalid, don't show any state
    if (
      !debouncedSlug ||
      debouncedSlug.length < 3 ||
      !slugSchema.safeParse(debouncedSlug).success
    ) {
      return {
        isAvailable: null,
        isLoading: false,
        message: null,
      };
    }

    // Check client-side validation first
    if (clientSideValidation && !clientSideValidation.isValid) {
      return {
        isAvailable: false,
        isLoading: false,
        message: clientSideValidation.message,
      };
    }

    // If client-side validation passes, check server response
    if (isSlugLoading) {
      return {
        isAvailable: null,
        isLoading: true,
        message: null,
      };
    }

    if (isError) {
      return {
        isAvailable: false,
        isLoading: false,
        message: slugError?.message || "Failed to check slug availability",
      };
    }

    if (slugAvailabilityData) {
      return {
        isAvailable: slugAvailabilityData.isAvailable,
        isLoading: false,
        message: slugAvailabilityData.isAvailable
          ? "Slug is available"
          : "This slug is already taken. Please choose another.",
      };
    }

    return {
      isAvailable: null,
      isLoading: false,
      message: null,
    };
  }, [
    debouncedSlug,
    slugSchema,
    clientSideValidation,
    isSlugLoading,
    isError,
    slugError,
    slugAvailabilityData,
  ]);

  // Update form state based on slug availability
  useEffect(() => {
    setValue("_slugLoading", slugState.isLoading, {shouldValidate: false});

    if (slugState.message && !slugState.isAvailable) {
      setError(name, {
        type: "manual",
        message: slugState.message,
      });
    } else if (slugState.isAvailable === true) {
      clearErrors(name);
    }
  }, [slugState, name, setError, clearErrors, setValue]);

  // Update debounced slug when slug value changes
  useEffect(() => {
    if (slugValue) {
      debouncedSetSlug(slugValue);
    } else {
      setDebouncedSlug("");
      debouncedSetSlug.cancel();
    }

    return () => {
      debouncedSetSlug.cancel();
    };
  }, [slugValue, debouncedSetSlug]);

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
            loading={slugState.isLoading}
            name={field.name}
            isUsernameAvailable={slugState.isAvailable}
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
