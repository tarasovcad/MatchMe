import React from "react";
import {Controller, useFormContext} from "react-hook-form";
import SimpleInput from "../ui/form/SimpleInput";
import CustomCheckbox from "../ui/CustomCheckbox";
import {AnimatePresence, motion} from "framer-motion";

export default function AuthStep1Form({page}: {page: "signup" | "login"}) {
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
      {page === "signup" && (
        <div>
          <Controller
            name="agreement"
            control={control}
            render={({field}) => (
              <CustomCheckbox
                checked={field.value}
                onCheckedChange={field.onChange}
                id="agreement"
                name="agreement"
              />
            )}
          />

          <AnimatePresence>
            {errors.agreement && (
              <motion.p
                className="text-destructive text-xs"
                layout
                initial={{opacity: 0, height: 0, marginTop: 0}}
                animate={{opacity: 1, height: "auto", marginTop: 8}}
                exit={{opacity: 0, height: 0, marginTop: 0}}
                transition={{duration: 0.1, ease: "easeInOut"}}>
                {errors.agreement.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
