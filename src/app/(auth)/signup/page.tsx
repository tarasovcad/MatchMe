"use client";
import React, {useEffect, useState} from "react";
import {LogoImage} from "@/components/ui/Logo";
import {FormProvider, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
  SignUpFormData,
  signUpSchemaStep1,
  signUpSchemaStep3,
} from "@/validation/auth/signUpValidation";
import AuthHomeLink from "@/components/auth/AuthHomeLink";
import AuthTopText from "@/components/auth/AuthTopText";
import AuthButton from "@/components/auth/AuthButton";
import AuthBottomSubTitle from "@/components/auth/AuthBottomSubTitle";
import AuthStep1Form from "@/components/auth/AuthStep1Form";
import AuthStepDots from "@/components/auth/AuthStepsDots";
import AuthOTP from "@/components/auth/AuthOTP";
import {signUpConfig} from "@/data/auth/stepsConfigs";
import AuthProvidersLinks from "@/components/auth/AuthProvidersLinks";
import {useRouter} from "next/navigation";
import {handleFormSubmitStep1} from "@/components/auth/handleFormSubmitStep1";
import {handleFormSubmitStep2} from "@/components/auth/handleFormSubmitStep2";
import {handleProviderAuthAction} from "@/components/auth/handleProviderAuthAction";
import {motion} from "framer-motion";

const SignUpPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleProviderLoading, setGoogleProviderLoading] = useState(false);
  const [githubProviderLoading, setGithubProviderLoading] = useState(false);
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
    setOtpHas6Symbols(otp.length === 6);
  }, [otp]);

  const {
    title,
    subtitle,
    buttonText,
    bottomSubTitleHfref,
    bottomSubTitleLinkText,
    bottomSubTitle,
  } = signUpConfig(email)[currentStep];

  const onProviderClick = async (provider: string) => {
    await handleProviderAuthAction(
      provider,
      setGoogleProviderLoading,
      setGithubProviderLoading,
      router,
    );
  };

  const onSubmit = async (data: SignUpFormData, page: "signup" | "login") => {
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
  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        duration: 0.1,
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {y: 20, opacity: 0},
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 12,
        duration: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <AuthHomeLink />

      <motion.form
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex-1 flex items-center justify-center px-4 py-10"
        onSubmit={methods.handleSubmit((data) => onSubmit(data, "signup"))}>
        <FormProvider {...methods}>
          <motion.div
            variants={containerVariants}
            className="w-full max-w-[400px] flex flex-col gap-[22px]">
            <motion.div variants={itemVariants}>
              <LogoImage size={32} />
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-9 w-full justify-center">
              <AuthTopText maintext={title} secText={subtitle} />
              {currentStep === 1 && (
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col gap-4">
                  <AuthStep1Form page="signup" />
                </motion.div>
              )}
            </motion.div>
            {currentStep === 2 && (
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center w-full">
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
                  page="signup"
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

export default SignUpPage;
