import {toast} from "sonner";
import {checkSlugAvailabilityAction} from "@/actions/dashboard/create-project/checkSlugAvailabilityAction";
import {RESERVED_PROJECT_SLUGS} from "@/data/reserved_slugs";
import React, {useEffect, useMemo, useState} from "react";
import SimpleInput from "./SimpleInput";
import {Controller, useFormContext} from "react-hook-form";
import {projectSecurityValidationSchema} from "@/validation/project/projectSecurityValidation";
import {useQuery} from "@tanstack/react-query";

interface SlugInputProps {
  label?: string;
  slug?: string;
  name?: string;
  onAvailabilityChange?: (isAvailable: boolean | null) => void;
  autoFocus?: boolean;
}

const SlugInput = ({
  label,
  slug,
  name = "slug",
  onAvailabilityChange,
  autoFocus,
}: SlugInputProps) => {
  const {
    control,
    formState: {errors},
    watch,
  } = useFormContext();

  const slugSchema = projectSecurityValidationSchema.shape.slug;

  const currentValue = (slug ?? watch(name) ?? "").toString();
  const [debouncedValue, setDebouncedValue] = useState(currentValue);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(currentValue), 300);
    return () => clearTimeout(handler);
  }, [currentValue]);

  const isValidFormat = useMemo(
    () => !!currentValue && slugSchema.safeParse(currentValue).success,
    [currentValue],
  );
  const isReserved = useMemo(
    () => !!currentValue && RESERVED_PROJECT_SLUGS.includes(currentValue.toLowerCase()),
    [currentValue],
  );

  const enabled = isValidFormat && !isReserved && debouncedValue.length > 0;

  const {data, isFetching, error} = useQuery({
    queryKey: ["project-slug-availability", debouncedValue],
    queryFn: async () => {
      const response = await checkSlugAvailabilityAction(debouncedValue.toLowerCase());
      if (response.error) throw new Error(response.error);
      return response;
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : "Failed to check slug availability");
    }
  }, [error]);

  useEffect(() => {
    if (!isValidFormat) {
      onAvailabilityChange?.(null);
      return;
    }
    if (isReserved) {
      onAvailabilityChange?.(false);
      return;
    }
    if (!enabled) {
      onAvailabilityChange?.(null);
      return;
    }
    if (!data) return;

    if (data.message === "Slug is available") onAvailabilityChange?.(true);
    else if (data.message === "Slug is already taken") onAvailabilityChange?.(false);
    else onAvailabilityChange?.(null);
  }, [data, enabled, isReserved, isValidFormat, onAvailabilityChange]);

  const isAvailable = !isValidFormat
    ? null
    : isReserved
      ? false
      : data?.message === "Slug is available"
        ? true
        : data?.message === "Slug is already taken"
          ? false
          : null;

  return (
    <Controller
      control={control}
      name={name}
      render={({field}) => (
        <SimpleInput
          label={label}
          placeholder="my-awesome-project"
          error={errors[name]}
          type="text"
          id={name}
          loading={enabled && isFetching}
          name="slug"
          isUsernameAvailable={isAvailable}
          value={field.value}
          autoFocus={autoFocus}
          onChange={(e) => {
            const newValue = e.target.value.toLowerCase();
            field.onChange(newValue);
          }}
        />
      )}
    />
  );
};

export default SlugInput;
