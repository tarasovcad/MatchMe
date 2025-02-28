"use client";
import React, {useCallback, useEffect, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {
  SignUpFormData,
  signUpSchemaStep3,
} from "@/validation/auth/signUpValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {LogoImage} from "@/components/ui/Logo";
import AuthTopText from "@/components/auth/AuthTopText";
import {signInConfig, signUpConfig} from "@/data/auth/stepsConfigs";
import AuthButton from "@/components/auth/AuthButton";
import AuthStep3Form from "@/components/auth/AuthStep3Form";
import {useRouter, useSearchParams} from "next/navigation";
import AuthStepsDots from "@/components/auth/AuthStepsDots";
import {toast} from "sonner";
import {handleStep3} from "@/actions/(auth)/handleStep3";
import {debounce} from "lodash";
import {checkUsernameAvailabilityAuth} from "@/actions/(auth)/checkUsernameAvailabilityAuth";
import {RESERVED_USERNAMES} from "@/data/auth/reservedUsernames";
import {hasProfanity} from "@/utils/other/profanityCheck";
import {Suspense} from "react";
import {motion} from "framer-motion";

const CompleteProfileClient = () => {
  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);
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

  const {title, subtitle, buttonText} = signUpConfig()[3];

  const handleFormSubmitStep3 = async (data: SignUpFormData) => {
    let toastId;

    if (usernameLoading) {
      toast.error("Checking username... Please wait.");
      return;
    }

    if (hasProfanity(data.username)) {
      toast.error(
        "Username contains inappropriate language. Please choose another.",
      );
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
      router.push("/");
    } catch (error) {
      toast.error("Signup failed. Please try again.", {id: toastId});
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    setUsernameLoading(true);
    setIsUsernameAvailable(null);

    if (hasProfanity(username)) {
      setUsernameLoading(false);
      setIsUsernameAvailable(false);
      toast.error(
        "Username contains inappropriate language. Please choose another.",
      );
      return;
    }
    const response = await checkUsernameAvailabilityAuth(username);
    setUsernameLoading(false);
    if (response.error) {
      console.log(response.error);
      toast.error(response.error);
      return;
    }
    if (response.message === "Username is available") {
      setIsUsernameAvailable(true);
    }
    if (response.message === "Username is already taken") {
      setIsUsernameAvailable(false);
      return;
    }
  };

  const debouncedCheckUsername = useCallback(
    debounce((username: string) => {
      if (!username || !isUsernameValid) return;

      if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
        setIsUsernameAvailable(false);
        toast.error("This username is reserved and cannot be used");
        return;
      }
      if (hasProfanity(username)) {
        setIsUsernameAvailable(false);
        toast.error(
          "Username contains inappropriate language. Please choose another.",
        );
        return;
      }
      checkUsernameAvailability(username);
    }, 500),
    [isUsernameValid],
  );

  useEffect(() => {
    setIsUsernameAvailable(null);

    if (!isUsernameValid) return;

    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      setIsUsernameAvailable(false);
      return;
    }

    // Cleanup: cancel any pending debounce calls when username changes
    debouncedCheckUsername(username);
    return () => debouncedCheckUsername.cancel();
  }, [username, debouncedCheckUsername, isUsernameValid]);

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
    <Suspense fallback={<div>Loading...</div>}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen flex flex-col px-4 py-8">
        <motion.form
          variants={containerVariants}
          className="flex-1 flex items-center justify-center px-4 py-10"
          onSubmit={methods.handleSubmit(handleFormSubmitStep3)}>
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
              </motion.div>
              <motion.div variants={itemVariants}>
                <AuthStep3Form
                  usernameLoading={usernameLoading}
                  isUsernameAvailable={isUsernameAvailable}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <AuthButton
                  key={loading ? "loading" : "idle"}
                  loading={loading}
                  text={buttonText}
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
