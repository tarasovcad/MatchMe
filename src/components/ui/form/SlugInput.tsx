import {toast} from "sonner";
import {checkSlugAvailabilityAction} from "@/actions/dashboard/create-project/checkSlugAvailabilityAction";
import {debounce} from "lodash";
import {RESERVED_PROJECT_SLUGS} from "@/data/reserved_slugs";
import React, {useCallback, useEffect} from "react";
import SimpleInput from "./SimpleInput";
import {Controller, useFormContext} from "react-hook-form";
import {projectSecurityValidationSchema} from "@/validation/project/projectSecurityValidation";

interface SlugInputProps {
  label?: string;
  slug?: string;
  name?: string;
  onAvailabilityChange?: (isAvailable: boolean | null) => void;
  autoFocus?: boolean;
  slugLoading: boolean;
  isSlugAvailable: boolean | null;
  setSlugLoading: (loading: boolean) => void;
  setIsSlugAvailable: (isAvailable: boolean | null) => void;
}

const SlugInput = ({
  label,
  slug,
  name = "slug",
  onAvailabilityChange,
  autoFocus,
  slugLoading,
  isSlugAvailable,
  setSlugLoading,
  setIsSlugAvailable,
}: SlugInputProps) => {
  useEffect(() => {
    if (onAvailabilityChange) {
      onAvailabilityChange(isSlugAvailable);
    }
  }, [isSlugAvailable, onAvailabilityChange]);

  const {
    control,
    formState: {errors},
  } = useFormContext();

  const slugSchema = projectSecurityValidationSchema.shape.slug;

  const checkSlugAvailability = async (value: string) => {
    setSlugLoading(true);
    setIsSlugAvailable(null);

    const response = await checkSlugAvailabilityAction(value);
    setSlugLoading(false);
    if (response.error) {
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
  };

  const debouncedCheck = useCallback(
    debounce((value: string) => {
      if (!value || !slugSchema.safeParse(value).success) return;

      if (RESERVED_PROJECT_SLUGS.includes(value.toLowerCase())) {
        setIsSlugAvailable(false);
        toast.error("This slug is reserved and cannot be used");
        return;
      }
      checkSlugAvailability(value);
    }, 500),
    [],
  );

  useEffect(() => {
    if (!slug || !slugSchema.safeParse(slug).success) {
      debouncedCheck.cancel();
      setIsSlugAvailable(null);
      setSlugLoading(false);
      return;
    }

    setIsSlugAvailable(null);
    setSlugLoading(true);

    if (RESERVED_PROJECT_SLUGS.includes(slug.toLowerCase())) {
      setIsSlugAvailable(false);
      setSlugLoading(false);
      return;
    }

    debouncedCheck.cancel();
    debouncedCheck(slug);
    return () => {
      debouncedCheck.cancel();
    };
  }, [slug]);

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
          loading={slugLoading}
          name={field.name}
          isUsernameAvailable={isSlugAvailable}
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
