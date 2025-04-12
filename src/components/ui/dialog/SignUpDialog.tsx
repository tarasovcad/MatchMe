"use client";
import {useEffect, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import {LogoImage} from "../Logo";
import AuthStep1Form from "@/components/auth/AuthStep1Form";
import {signUpConfig} from "@/data/auth/stepsConfigs";
import AuthButton from "@/components/auth/AuthButton";
import AuthProvidersLinks from "@/components/auth/AuthProvidersLinks";
import {handleProviderAuthAction} from "@/components/auth/handleProviderAuthAction";
import {useRouter} from "next/navigation";
import AuthBottomSubTitle from "@/components/auth/AuthBottomSubTitle";
import {FormProvider, useForm} from "react-hook-form";
import {
  SignUpFormData,
  signUpSchemaStep1,
  signUpSchemaStep3,
} from "@/validation/auth/signUpValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {handleFormSubmitStep1} from "@/components/auth/handleFormSubmitStep1";
import {motion} from "framer-motion";
import {containerVariants, itemVariants} from "@/utils/other/variants";
import {handleFormSubmitStep2} from "@/components/auth/handleFormSubmitStep2";
import AuthOTP from "@/components/auth/AuthOTP";

export default function SignUpDialog({children}: {children: React.ReactNode}) {
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

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <motion.form
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col gap-[22px] w-full"
          onSubmit={methods.handleSubmit((data) => onSubmit(data, "signup"))}>
          <FormProvider {...methods}>
            <motion.div
              variants={itemVariants}
              className="flex justify-center items-center self-center border rounded-full size-11 shrink-0"
              aria-hidden="true">
              <LogoImage size={25} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <DialogHeader>
                <DialogTitle className="sm:text-center">{title}</DialogTitle>
                <DialogDescription className="sm:text-center">
                  {subtitle}
                </DialogDescription>
              </DialogHeader>
            </motion.div>

            {currentStep === 1 && (
              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-4">
                <AuthStep1Form page="signup" />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                variants={itemVariants}
                className="flex justify-center items-center w-full">
                <AuthOTP setOtp={setOtp} size={40} />
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
          </FormProvider>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
