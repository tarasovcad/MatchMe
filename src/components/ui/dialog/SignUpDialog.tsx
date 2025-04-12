"use client";
import {useState} from "react";
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
} from "@/validation/auth/signUpValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {handleFormSubmitStep1} from "@/components/auth/handleFormSubmitStep1";

export default function SignUpDialog({children}: {children: React.ReactNode}) {
  const {
    title,
    subtitle,
    buttonText,
    bottomSubTitleHfref,
    bottomSubTitleLinkText,
    bottomSubTitle,
  } = signUpConfig(1)[1];
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleProviderLoading, setGoogleProviderLoading] = useState(false);
  const [githubProviderLoading, setGithubProviderLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [totalSteps, setTotalSteps] = useState(3);
  const router = useRouter();

  const onProviderClick = async (provider: string) => {
    await handleProviderAuthAction(
      provider,
      setGoogleProviderLoading,
      setGithubProviderLoading,
      router,
    );
  };

  const methods = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchemaStep1),
    mode: "onChange",
    defaultValues: {
      email: "",
      agreement: false,
      name: "",
      username: "",
    },
  });

  const onSubmit = async (data: SignUpFormData, page: "signup" | "login") => {
    await handleFormSubmitStep1(
      page,
      data,
      setLoading,
      setEmail,
      setCurrentStep,
      setIsNewUser,
      setTotalSteps,
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form
          className="flex flex-col gap-[22px] w-full"
          onSubmit={methods.handleSubmit((data) => onSubmit(data, "signup"))}>
          <FormProvider {...methods}>
            <div
              className="flex justify-center items-center self-center border rounded-full size-11 shrink-0"
              aria-hidden="true">
              <LogoImage size={25} />
            </div>

            <DialogHeader>
              <DialogTitle className="sm:text-center">{title}</DialogTitle>
              <DialogDescription className="sm:text-center">
                {subtitle}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <AuthStep1Form page="signup" />
            </div>

            <AuthButton
              key={loading ? "loading" : "idle"}
              loading={loading}
              text={buttonText}
            />
            <AuthProvidersLinks
              handleProviderAuthAction={onProviderClick}
              googleProviderLoading={googleProviderLoading}
              githubProviderLoading={githubProviderLoading}
              page="signup"
            />

            <AuthBottomSubTitle
              maintext={bottomSubTitle}
              link={bottomSubTitleLinkText}
              href={bottomSubTitleHfref}
            />
          </FormProvider>
        </form>
      </DialogContent>
    </Dialog>
  );
}
