"use client";
import React, {useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {SignUpFormData, signUpSchemaStep3} from "@/validation/auth/signUpValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {LogoImage} from "@/components/ui/Logo";
import AuthTopText from "@/components/auth/AuthTopText";
import {signUpConfig} from "@/data/auth/stepsConfigs";
import AuthButton from "@/components/auth/AuthButton";
import {useRouter, useSearchParams} from "next/navigation";
import AuthStepsDots from "@/components/auth/AuthStepsDots";
import {toast} from "sonner";
import {handleStep3} from "@/actions/(auth)/handleStep3";
import {RESERVED_USERNAMES} from "@/data/auth/reservedUsernames";
import {hasProfanity} from "@/utils/other/profanityCheck";
import {Suspense} from "react";
import {motion} from "framer-motion";
import {containerVariants, itemVariants} from "@/utils/other/variants";
import SimpleInput from "@/components/ui/form/SimpleInput";
import UserNameInput from "@/components/ui/(auth)/UserNameInput";

const CompleteProfileClient = () => {
  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const referrer = searchParams.get("from");
  const nameFromQuery = searchParams.get("name") || "";
  const usernameFromQuery = searchParams.get("username") || "";

  const router = useRouter();

  const methods = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchemaStep3),
    mode: "onChange",
    defaultValues: {
      name: nameFromQuery,
      username: usernameFromQuery,
    },
  });

  const username = methods.watch("username");
  const usernameSchema = signUpSchemaStep3.shape.username;
  const isUsernameValid = usernameSchema.safeParse(username).success;

  const {
    register,
    formState: {errors, isValid},
  } = methods;

  const {title, subtitle, buttonText} = signUpConfig()[3];

  const handleFormSubmitStep3 = async (data: SignUpFormData) => {
    let toastId;

    if (usernameLoading) {
      toast.error("Checking username... Please wait.");
      return;
    }

    if (hasProfanity(data.username)) {
      toast.error("Username contains inappropriate language. Please choose another.");
      return;
    }
    if (RESERVED_USERNAMES.includes(data.username.toLowerCase())) {
      toast.error("This username is reserved and cannot be used.");
      return;
    }
    if (isUsernameAvailable !== true) {
      toast.error("Username is not available. Please choose another.");
      return;
    }
    try {
      toastId = toast.loading("Creating account...");
      const response = await handleStep3(data);
      if (response.error) {
        toast.error(response.error, {id: toastId});
        setLoading(false);
        return;
      }
      toast.success(response.message, {id: toastId});
      router.push("/profiles");
    } catch (error) {
      toast.error("Signup failed. Please try again.", {id: toastId});
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col px-4 py-8 min-h-screen">
        <motion.form
          variants={containerVariants}
          className="flex flex-1 justify-center items-center px-4 py-10"
          onSubmit={methods.handleSubmit(handleFormSubmitStep3)}>
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
              </motion.div>
              <motion.div variants={itemVariants}>
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
                  <UserNameInput
                    label="Username"
                    username={username}
                    name="username"
                    usernameLoading={usernameLoading}
                    isUsernameAvailable={isUsernameAvailable}
                    setUsernameLoading={setUsernameLoading}
                    setIsUsernameAvailable={setIsUsernameAvailable}
                  />
                </div>
              </motion.div>
              <motion.div variants={itemVariants}>
                <AuthButton
                  key={loading ? "loading" : "idle"}
                  loading={loading || usernameLoading}
                  text={buttonText}
                  disabled={!isValid || !isUsernameValid}
                />
              </motion.div>
            </motion.div>
          </FormProvider>
        </motion.form>

        {referrer === "/signup" && (
          <motion.div variants={itemVariants}>
            <AuthStepsDots totalSteps={3} currentStep={3} />
          </motion.div>
        )}
      </motion.div>
    </Suspense>
  );
};

export default CompleteProfileClient;
