"use client";
import React, {useEffect, useState} from "react";
import {LogoImage} from "@/components/ui/Logo";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import AuthHomeLink from "@/components/auth/AuthHomeLink";
import AuthTopText from "@/components/auth/AuthTopText";
import AuthButton from "@/components/auth/AuthButton";
import AuthBottomSubTitle from "@/components/auth/AuthBottomSubTitle";
import AuthStep1Form from "@/components/auth/AuthStep1Form";
import AuthStepDots from "@/components/auth/AuthStepsDots";
import AuthOTP from "@/components/auth/AuthOTP";
import {signInConfig} from "@/data/auth/stepsConfigs";
import AuthProvidersLinks from "@/components/auth/AuthProvidersLinks";
import {useRouter} from "next/navigation";
import {handleFormSubmitStep1} from "@/components/auth/handleFormSubmitStep1";
import {handleFormSubmitStep2} from "@/components/auth/handleFormSubmitStep2";
import {handleProviderAuthAction} from "@/components/auth/handleProviderAuthAction";
import {LoginFormData, signInSchema} from "@/validation/auth/loginValidation";
import {motion} from "framer-motion";
import {containerVariants, itemVariants} from "@/utils/other/variants";

const LoginPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleProviderLoading, setGoogleProviderLoading] = useState(false);
  const [githubProviderLoading, setGithubProviderLoading] = useState(false);
  const [otpHas6Symbols, setOtpHas6Symbols] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [totalSteps, setTotalSteps] = useState(2);
  const router = useRouter();

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    setOtpHas6Symbols(otp.length === 6);
  }, [otp]);

  const {
    title,
    subtitle,
    buttonText,
    bottomSubTitleHfref,
    bottomSubTitleLinkText,
    bottomSubTitle,
  } = signInConfig(email)[currentStep];

  const onProviderClick = async (provider: string) => {
    await handleProviderAuthAction(
      provider,
      setGoogleProviderLoading,
      setGithubProviderLoading,
      router,
    );
  };

  const onSubmit = async (
    data: LoginFormData,
    page: "signup" | "login" = "login",
  ) => {
    if (currentStep === 1) {
      await handleFormSubmitStep1(
        page,
        data,
        setLoading,
        setEmail,
        setCurrentStep,
        setIsNewUser,
        setTotalSteps,
      );
    } else if (currentStep === 2) {
      await handleFormSubmitStep2(
        page,
        email,
        otp,
        isNewUser,
        setLoading,
        router,
      );
    }
  };

  return (
    <div className="flex flex-col px-4 py-8 min-h-screen">
      <AuthHomeLink />

      <motion.form
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-1 justify-center items-center px-4 py-10"
        onSubmit={methods.handleSubmit((data) => onSubmit(data, "login"))}>
        <FormProvider {...methods}>
          <motion.div
            variants={containerVariants}
            className="flex flex-col gap-[22px] w-full max-w-[400px]">
            <motion.div variants={itemVariants}>
              <LogoImage size={32} />
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex flex-col justify-center gap-9 w-full">
              <AuthTopText maintext={title} secText={subtitle} />
              {currentStep === 1 && (
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col gap-4">
                  <AuthStep1Form page="login" />
                </motion.div>
              )}
            </motion.div>
            {currentStep === 2 && (
              <motion.div
                variants={itemVariants}
                className="flex justify-center items-center w-full">
                <AuthOTP setOtp={setOtp} />
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <AuthButton
                key={loading ? "loading" : "idle"}
                loading={loading}
                text={buttonText}
                disabled={currentStep === 2 && !otpHas6Symbols}
              />
            </motion.div>

            {currentStep === 1 && (
              <motion.div variants={itemVariants}>
                <AuthProvidersLinks
                  handleProviderAuthAction={onProviderClick}
                  googleProviderLoading={googleProviderLoading}
                  githubProviderLoading={githubProviderLoading}
                  page="login"
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <AuthBottomSubTitle
                maintext={bottomSubTitle}
                link={bottomSubTitleLinkText}
                href={bottomSubTitleHfref}
              />
            </motion.div>
          </motion.div>
        </FormProvider>
      </motion.form>

      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <AuthStepDots totalSteps={totalSteps} currentStep={currentStep} />
      </motion.div>
    </div>
  );
};

export default LoginPage;
