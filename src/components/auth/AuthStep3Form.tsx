import React from "react";
import SimpleInput from "../ui/SimpleInput";
import {Controller, useFormContext} from "react-hook-form";

const AuthStep3Form = ({
  usernameLoading,
  isUsernameAvailable,
}: {
  usernameLoading?: boolean;
  isUsernameAvailable?: boolean | null;
}) => {
  const {
    control,
    register,
    formState: {errors},
  } = useFormContext();

  return (
    <div className="flex flex-col gap-3 ">
      <SimpleInput
        label="Full Name"
        register={register("name")}
        error={errors.name}
        placeholder="Joe Doe"
        type="name"
        id="name"
        name="name"
      />
      <Controller
        control={control}
        name="username"
        render={({field}) => (
          <SimpleInput
            label="Username"
            placeholder="joedoe"
            error={errors.username}
            isUsernameAvailable={isUsernameAvailable}
            type="username"
            id="username"
            loading={usernameLoading}
            name="username"
            value={field.value || ""}
            onChange={(e) => field.onChange(e.target.value.toLowerCase())}
          />
        )}
      />
    </div>
  );
};

export default AuthStep3Form;
