import React from "react";
import {Controller, useFormContext} from "react-hook-form";
import SimpleInput from "../ui/SimpleInput";
import CustomCheckbox from "../ui/CustomCheckbox";

export default function AuthStep1Form() {
  const {
    register,
    control,
    formState: {errors},
  } = useFormContext();

  return (
    <>
      <SimpleInput
        mail
        label="Enter your email"
        placeholder="example@gmail.com"
        type="email"
        register={register("email")}
        id="email"
        name="email"
        error={errors.email}
      />
      <div>
        <Controller
          name="agreement"
          control={control}
          render={({field}) => (
            <CustomCheckbox
              checked={field.value}
              onCheckedChange={field.onChange}
              id="agreement"
            />
          )}
        />
        {errors.agreement && (
          <p className="mt-2 text-xs text-destructive">
            {errors.agreement.message as string}
          </p>
        )}
      </div>
    </>
  );
}
