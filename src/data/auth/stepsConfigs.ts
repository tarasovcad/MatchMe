import {AuthStepConfig} from "@/types/AuthStepConfig";

export const signInConfig = (email: string): AuthStepConfig => ({
  1: {
    title: "Start Your Journey",
    subtitle: "Join and start connecting instantly",
    buttonText: "Sign Up",
    bottomSubTitle: "Already have an account?",
    bottomSubTitleLinkText: "Log in",
    bottomSubTitleHfref: "/signin",
  },
  2: {
    title: "Verify Your Email",
    subtitle: `We sent a code to ${email}`,
    buttonText: "Continue",
    bottomSubTitle: "Didn't get a code?",
    bottomSubTitleLinkText: "Click to resend",
    bottomSubTitleHfref: "/signin",
  },
  3: {
    title: "Complete your profile",
    subtitle: `Please provide your name and choose a username.`,
    buttonText: "Explore Projects",
  },
});
