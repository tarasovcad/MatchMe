import {hasProfanity} from "@/utils/other/profanityCheck";
import {toast} from "sonner";
import {checkUsernameAvailabilityAuth} from "@/actions/(auth)/checkUsernameAvailabilityAuth";
import {debounce} from "lodash";
import {RESERVED_USERNAMES} from "@/data/auth/reservedUsernames";
import {signUpSchemaStep3} from "@/validation/auth/signUpValidation";
import React, {useCallback, useEffect} from "react";
import SimpleInput from "../form/SimpleInput";
import {Controller, useFormContext} from "react-hook-form";

const UserNameInput = ({
  label,
  username,
  name = "username",
  onAvailabilityChange,
  autoFocus,
  usernameLoading,
  isUsernameAvailable,
  setUsernameLoading,
  setIsUsernameAvailable,
}: {
  label?: string;
  username?: string;
  name?: string;
  onAvailabilityChange?: (isAvailable: boolean | null) => void;
  autoFocus?: boolean;
  usernameLoading: boolean;
  isUsernameAvailable: boolean | null;
  setUsernameLoading: (loading: boolean) => void;
  setIsUsernameAvailable: (isAvailable: boolean | null) => void;
}) => {
  useEffect(() => {
    if (onAvailabilityChange) {
      onAvailabilityChange(isUsernameAvailable);
    }
  }, [isUsernameAvailable, onAvailabilityChange]);

  const {
    control,
    formState: {errors},
  } = useFormContext();

  const usernameSchema = signUpSchemaStep3.shape.username;

  const checkUsernameAvailability = async (username: string) => {
    setUsernameLoading(true);
    setIsUsernameAvailable(null);

    if (hasProfanity(username)) {
      toast.error("Username contains inappropriate language. Please choose another.");
      setUsernameLoading(false);
      setIsUsernameAvailable(false);
      return;
    }
    const response = await checkUsernameAvailabilityAuth(username);
    setUsernameLoading(false);
    if (response.error) {
      console.log(response.error);
      toast.error(response.error);
      return;
    }
    if (response.message === "Username is available") {
      setIsUsernameAvailable(true);
    }
    if (response.message === "Username is already taken") {
      setIsUsernameAvailable(false);
      return;
    }
  };

  const debouncedCheckUsername = useCallback(
    debounce((username: string) => {
      if (!username || !usernameSchema.safeParse(username).success) return;

      if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
        setIsUsernameAvailable(false);
        toast.error("This username is reserved and cannot be used");
        return;
      }
      if (hasProfanity(username)) {
        setIsUsernameAvailable(false);
        toast.error("Username contains inappropriate language. Please choose another.");
        return;
      }
      checkUsernameAvailability(username);
    }, 500),
    [],
  );

  useEffect(() => {
    if (!username || !usernameSchema.safeParse(username).success) {
      debouncedCheckUsername.cancel();
      setIsUsernameAvailable(null);
      setUsernameLoading(false);
      return;
    }

    setIsUsernameAvailable(null);
    setUsernameLoading(true);

    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      setIsUsernameAvailable(false);
      setUsernameLoading(false);
      return;
    }

    debouncedCheckUsername.cancel();
    debouncedCheckUsername(username);
    return () => {
      debouncedCheckUsername.cancel();
    };
  }, [username]);

  return (
    <Controller
      control={control}
      name={name}
      render={({field}) => (
        <SimpleInput
          label={label}
          placeholder="joedoe"
          error={errors[name]}
          type="text"
          id={name}
          loading={usernameLoading}
          name={field.name}
          isUsernameAvailable={isUsernameAvailable}
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

export default UserNameInput;
