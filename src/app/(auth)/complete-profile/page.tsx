"use client";
import React, {useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {SignUpFormData, signUpSchemaStep3} from "@/validation/signUpValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {LogoImage} from "@/components/ui/Logo";
import AuthTopText from "@/components/auth/AuthTopText";
import {signInConfig} from "@/data/auth/stepsConfigs";
import AuthButton from "@/components/auth/AuthButton";
import AuthStep3Form from "@/components/auth/AuthStep3Form";
const page = () => {
  const [loading, setLoading] = useState(false);

  const methods = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchemaStep3),
    mode: "onChange",
    defaultValues: {
      email: "",
      agreement: false,
      name: "",
      username: "",
    },
  });

  const config = signInConfig();

  const {title, subtitle, buttonText} = config[3];

  const handleSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    console.log(data);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <form
        className="flex-1 flex items-center justify-center px-4 py-10"
        onSubmit={methods.handleSubmit(handleSubmit)}>
        <FormProvider {...methods}>
          <div className="w-full max-w-[400px] flex flex-col gap-[22px]">
            <LogoImage size={32} />
            <div className="flex flex-col gap-9  w-full justify-center ">
              <AuthTopText maintext={title} secText={subtitle} />
            </div>
            <AuthStep3Form />
            <AuthButton
              key={loading ? "loading" : "idle"}
              loading={loading}
              text={buttonText}
            />
          </div>
        </FormProvider>
      </form>
    </div>
  );
};

export default page;
