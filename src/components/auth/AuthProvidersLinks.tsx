import React from "react";
import {Button} from "../shadcn/button";
import Link from "next/link";
import Image from "next/image";
const AuthProvidersLinks = () => {
  return (
    <>
      <div className="flex items-center justify-center w-full">
        <div className="flex-1 border-t border-[#71717A] opacity-20 h-[1px]"></div>
        <span className="mx-3 text-secondary/80 text-xs">OR</span>
        <div className="flex-1 border-t border-[#71717A]  opacity-20 h-[1px]"></div>
      </div>
      <div className="w-full flex flex-col gap-3 justify-center">
        <Button asChild className="gap-3 w-full">
          <Link href="#">
            <Image src="/google.webp" alt="Google" width={16} height={16} />
            Sign up with Google
          </Link>
        </Button>
        <Button asChild className="gap-3 w-full">
          <Link href="#">
            <Image src="github.svg" alt="Github" width={16} height={16} />
            Sign up with Github
          </Link>
        </Button>
      </div>
    </>
  );
};

export default AuthProvidersLinks;
