import React from "react";
import SimpleInput from "../ui/SimpleInput";
import {useFormContext} from "react-hook-form";
import UserNameInput from "../ui/(auth)/UserNameInput";

const AuthStep3Form = () => {
  const {
    register,
    watch,
    formState: {errors},
  } = useFormContext();
  const username = watch("username");
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
      <UserNameInput label="Username" username={username} name="username" />
    </div>
  );
};

export default AuthStep3Form;
