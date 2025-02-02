"use client";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import {LogoImage} from "@/components/ui/Logo";
import {Button} from "@/components/shadcn/button";
import Image from "next/image";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {SignUpFormData, signUpSchema} from "@/validation/signUpValidation";
import AuthHomeLink from "@/components/auth/AuthHomeLink";
import AuthTopText from "@/components/auth/AuthTopText";
import AuthButton from "@/components/auth/AuthButton";
import AuthBottomSubTitle from "@/components/auth/AuthBottomSubTitle";
import AuthStep1Form from "@/components/auth/AuthStep1Form";
import {AuthStepConfig} from "@/types/AuthStepConfig";
import AuthStepDots from "@/components/auth/AuthStepsDots";
import AuthOTP from "@/components/auth/AuthOTP";
import {supabase} from "@/utils/superbase/client";

import {toast} from "sonner";
const SignUp = () => {
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpHas6Symbols, setOtpHas6Symbols] = useState(false);
  const methods = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      agreement: false,
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    let toastId;
    try {
      if (currentStep === 1) {
        toastId = toast.loading("Sending OTP...");
        const res = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            shouldCreateUser: true,
          },
        });

        const {error} = res;

        if (error) {
          console.log(error);
          toast.error(error.message, {id: toastId});
          setLoading(false);
          return;
        }

        toast.success("Code sent successfully!", {id: toastId});
        setCurrentStep(2);
        setEmail(data.email);
      } else if (currentStep === 2) {
        toastId = toast.loading("Verifying OTP...");
        const {error} = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "email",
        });

        if (error) {
          setOtpError(true);
          toast.error(error.message, {id: toastId});
          setLoading(false);
          return;
        }

        toast.success("OTP verified successfully!", {id: toastId});
        setCurrentStep(3);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      if (toastId) {
        toast.error("An error occurred. Please try again.", {id: toastId});
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      setOtpHas6Symbols(true);
    } else {
      setOtpHas6Symbols(false);
    }
  }, [otp]);

  const stepConfig: AuthStepConfig = {
    1: {
      title: "Start Your Journey",
      subtitle: "Join and start connecting instantly",
      buttonText: "Send 6-digit code",
      bottomSubTitle: "Already have an account?",
      bottomSubTitleLinkText: "Log in",
      bottomSubTitleHfref: "/signin",
    },
    2: {
      title: "Verify Your Email",
      subtitle: `We sent a code to ${email} `,
      buttonText: "Explore Projects",
      bottomSubTitle: "Didn't get a code?",
      bottomSubTitleLinkText: "Click to resend",
      bottomSubTitleHfref: "/signin",
    },
    3: {
      title: "Verify Your Email",
      subtitle: `We sent a code to ${email} `,
      buttonText: "Explore Projects",
      bottomSubTitle: "Didn't get a code?",
      bottomSubTitleLinkText: "Click to resend",
      bottomSubTitleHfref: "/signin",
    },
  };

  const {
    title,
    subtitle,
    buttonText,
    bottomSubTitleHfref,
    bottomSubTitleLinkText,
    bottomSubTitle,
  } = stepConfig[currentStep];

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <AuthHomeLink />

      {/* Signup form */}
      <form
        className="flex-1 flex items-center justify-center px-4 py-10"
        onSubmit={methods.handleSubmit(onSubmit)}>
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

            <AuthButton
              key={loading ? "loading" : "idle"}
              loading={loading}
              text={buttonText}
              disabled={currentStep === 2 && !otpHas6Symbols}
            />
            {currentStep === 1 && (
              <>
                <div className="flex items-center justify-center w-full">
                  <div className="flex-1 border-t border-[#71717A] opacity-20 h-[1px]"></div>
                  <span className="mx-3 text-secondary/80 text-xs">OR</span>
                  <div className="flex-1 border-t border-[#71717A]  opacity-20 h-[1px]"></div>
                </div>
                <div className="w-full flex flex-col gap-3 justify-center">
                  <Button asChild className="gap-3 w-full">
                    <Link href="#">
                      <Image
                        src="/google.webp"
                        alt="Google"
                        width={16}
                        height={16}
                      />
                      Sign up with Google
                    </Link>
                  </Button>
                  <Button asChild className="gap-3 w-full">
                    <Link href="#">
                      <Image
                        src="github.svg"
                        alt="Github"
                        width={16}
                        height={16}
                      />
                      Sign up with Github
                    </Link>
                  </Button>
                </div>
              </>
            )}
            {currentStep === 3 && "Step 3"}

            <AuthBottomSubTitle
              maintext={bottomSubTitle}
              link={bottomSubTitleLinkText}
              href={bottomSubTitleHfref}
            />
          </div>
        </FormProvider>
      </form>

      <AuthStepDots totalSteps={totalSteps} currentStep={currentStep} />
    </div>
  );
};

export default SignUp;
