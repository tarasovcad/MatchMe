import React, {useState} from "react";
import {Button} from "../shadcn/button";
import Link from "next/link";
import Image from "next/image";
import LoadingButtonCirlce from "../ui/LoadingButtonCirlce";
interface handleProviderAuthActionProps {
  handleProviderAuthAction: (provider: "google" | "github") => Promise<void>;
  googleProviderLoading?: boolean;
  githubProviderLoading?: boolean;
  page: "signup" | "login";
}

const AuthProvidersLinks = ({
  handleProviderAuthAction,
  googleProviderLoading,
  githubProviderLoading,
  page,
}: handleProviderAuthActionProps) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const handleClick = async (provider: "google" | "github") => {
    setIsAuthenticating(true);
    await handleProviderAuthAction(provider);
  };

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex justify-center items-center w-full">
        <div className="flex-1 opacity-20 border-[#71717A] border-t h-[1px]"></div>
        <span className="mx-3 text-secondary/80 text-xs">OR</span>
        <div className="flex-1 opacity-20 border-[#71717A] border-t h-[1px]"></div>
      </div>
      <div className="flex flex-col justify-center gap-3 w-full">
        <Button
          asChild
          className="gap-3 w-full"
          onClick={() => handleClick("google")}
          disabled={isAuthenticating || googleProviderLoading}>
          <Link href="#">
            {googleProviderLoading ? (
              <LoadingButtonCirlce size={16} />
            ) : (
              <Image src="/google.webp" alt="Google" width={16} height={16} />
            )}
            {page === "login" ? "Log In" : "Sign Up"} with Google
          </Link>
        </Button>
        <Button
          asChild
          className="gap-3 w-full"
          onClick={() => handleClick("github")}
          disabled={isAuthenticating || githubProviderLoading}>
          <Link href="#">
            {githubProviderLoading ? (
              <LoadingButtonCirlce size={16} />
            ) : (
              <Image
                src="/social_links/github.svg"
                alt="Github"
                width={16}
                height={16}
              />
            )}
            {page === "login" ? "Log In" : "Sign Up"} with Github
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AuthProvidersLinks;
