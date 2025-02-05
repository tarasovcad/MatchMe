"use client";

import React, {useEffect, useState} from "react";
import {LogoImage} from "@/components/ui/Logo";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  SignUpFormData,
  signUpSchemaStep1,
  signUpSchemaStep3,
} from "@/validation/signUpValidation";
import AuthHomeLink from "@/components/auth/AuthHomeLink";
import AuthTopText from "@/components/auth/AuthTopText";
import AuthButton from "@/components/auth/AuthButton";
import AuthBottomSubTitle from "@/components/auth/AuthBottomSubTitle";
import AuthStep1Form from "@/components/auth/AuthStep1Form";
import AuthStepDots from "@/components/auth/AuthStepsDots";
import AuthOTP from "@/components/auth/AuthOTP";
import {supabase} from "@/utils/superbase/client";
import {toast} from "sonner";
import {signInConfig} from "@/data/auth/stepsConfigs";
import AuthProvidersLinks from "@/components/auth/AuthProvidersLinks";
import AuthStep3Form from "@/components/auth/AuthStep3Form";
import {useRouter} from "next/navigation";
import {handleStep1} from "@/actions/(auth)/handleStep1";
import {handleStep2} from "@/actions/(auth)/handleStep2";
import {handleStep3} from "@/actions/(auth)/handleStep3";
const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpHas6Symbols, setOtpHas6Symbols] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [totalSteps, setTotalSteps] = useState(3);
  const router = useRouter();
  const getSchemaForStep = (step: number) => {
    switch (step) {
      case 1:
        return signUpSchemaStep1;
      case 3:
        return signUpSchemaStep3;
      default:
        return signUpSchemaStep1;
    }
  };
  console.log(email, "email");

  const methods = useForm<SignUpFormData>({
    resolver: zodResolver(getSchemaForStep(currentStep)),
    mode: "onChange",
    defaultValues: {
      email: "",
      agreement: false,
      name: "",
      username: "",
    },
  });

  useEffect(() => {
    if (otp.length === 6) {
      setOtpHas6Symbols(true);
    } else {
      setOtpHas6Symbols(false);
    }
  }, [otp]);

  const config = signInConfig(email);

  const {
    title,
    subtitle,
    buttonText,
    bottomSubTitleHfref,
    bottomSubTitleLinkText,
    bottomSubTitle,
  } = config[currentStep];

  const handleFormSubmitStep1 = async (data: SignUpFormData) => {
    let toastId;
    try {
      setLoading(true);
      toastId = toast.loading("Checking account...");
      const response = await handleStep1(data);

      if (response.isNewUser) {
        setIsNewUser(true);
        setTotalSteps(3);
      } else {
        setTotalSteps(2);
      }
      toast.success(response.message, {id: toastId});
      setEmail(data.email);
      setCurrentStep(2);
    } catch (error) {
      toast.error("Signup failed. Please try again.", {id: toastId});
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmitStep2 = async () => {
    let toastId;
    try {
      toastId = toast.loading("Verifying OTP...");
      setLoading(true);
      const response = await handleStep2({email, otp});
      console.log(response);
      if (response?.error) {
        toast.error(response.error, {id: toastId});
        setLoading(false);
        return;
      }
      toast.success(response?.message, {id: toastId});
      if (isNewUser) {
        setCurrentStep(3);
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error("Signup failed. Please try again.", {id: toastId});
      setLoading(false);
      return;
    } finally {
      setLoading(false);
      toast.success("OTP verified successfully!", {id: toastId});
    }
  };
  const handleFormSubmitStep3 = async (data: SignUpFormData) => {
    let toastId;
    try {
      toastId = toast.loading("Creating account...");
      const response = await handleStep3(data, email);
      console.log(response);
      if (response.error) {
        toast.error(response.error, {id: toastId});
        setLoading(false);
        return;
      }
      toast.success(response.message, {id: toastId});
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      toast.error("Signup failed. Please try again.", {id: toastId});
      setLoading(false);
      return;
    } finally {
      setLoading(false);
      toast.success("Account created successfully!", {id: toastId});
    }
  };

  const handleFormSchema = (step: number) => {
    switch (step) {
      case 1:
        return handleFormSubmitStep1;
      case 2:
        return handleFormSubmitStep2;
      case 3:
        return handleFormSubmitStep3;
      default:
        return handleFormSubmitStep1;
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <AuthHomeLink />

      {/* Signup form */}
      <form
        className="flex-1 flex items-center justify-center px-4 py-10"
        onSubmit={methods.handleSubmit(handleFormSchema(currentStep))}>
        <FormProvider {...methods}>
          <div className="w-full max-w-[400px] flex flex-col gap-[22px]">
            <LogoImage size={32} />
            <div className="flex flex-col gap-9  w-full justify-center ">
              <AuthTopText maintext={title} secText={subtitle} />
              {currentStep === 1 && (
                <div className="flex flex-col gap-4">
                  <AuthStep1Form />
                </div>
              )}
            </div>
            {currentStep === 2 && (
              <div className="flex items-center justify-center w-full">
                <AuthOTP setOtp={setOtp} otpError={otpError} />
              </div>
            )}
            {currentStep === 3 && <AuthStep3Form />}
            <AuthButton
              key={loading ? "loading" : "idle"}
              loading={loading}
              text={buttonText}
              disabled={currentStep === 2 && !otpHas6Symbols}
            />
            {currentStep === 1 && <AuthProvidersLinks />}

            {currentStep !== 3 && (
              <AuthBottomSubTitle
                maintext={bottomSubTitle}
                link={bottomSubTitleLinkText}
                href={bottomSubTitleHfref}
              />
            )}
          </div>
        </FormProvider>
      </form>

      <AuthStepDots totalSteps={totalSteps} currentStep={currentStep} />
    </div>
  );
};

export default SignUp;
