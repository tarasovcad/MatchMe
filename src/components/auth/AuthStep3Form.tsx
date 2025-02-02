import React from "react";
import SimpleInput from "../ui/SimpleInput";
import {useFormContext} from "react-hook-form";

const AuthStep3Form = () => {
  const {
    register,
    control,
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
        name="username"
      />
    </div>
  );
};

export default AuthStep3Form;
