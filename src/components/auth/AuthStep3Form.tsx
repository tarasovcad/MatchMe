import React from "react";
import SimpleInput from "../ui/SimpleInput";
import {useFormContext} from "react-hook-form";

const AuthStep3Form = ({
  usernameLoading,
  isUsernameAvailable,
}: {
  usernameLoading?: boolean;
  isUsernameAvailable?: boolean | null;
}) => {
  const {
    register,
    formState: {errors},
  } = useFormContext();

  return (
    <div className="flex flex-col gap-3">
      <SimpleInput
        label="Full Name"
        register={register("name")}
        error={errors.name}
        placeholder="Joe Doe"
        type="name"
        id="name"
        name="name"
      />
      <SimpleInput
        label="Username"
        placeholder="joedoe"
        register={register("username")}
        error={errors.username}
        type="username"
        id="username"
        loading={usernameLoading}
        name="username"
        isUsernameAvailable={isUsernameAvailable}
      />
    </div>
  );
};

export default AuthStep3Form;
