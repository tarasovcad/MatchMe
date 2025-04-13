import React from "react";
import MainGradient, {SecGradient} from "../ui/Text";
import {cn} from "@/lib/utils";

const AuthTopText = ({
  maintext,
  secText,
  mainGradientClassName = "",
  secGradientClassName = "",
}: {
  maintext: string;
  secText: string;
  mainGradientClassName?: string;
  secGradientClassName?: string;
}) => {
  return (
    <div>
      <MainGradient
        as="h1"
        className={cn(
          "font-bold text-[36px] max-[396px]:text-[24px] xs:text-[30px] sm:text-[32px] text-center",
          mainGradientClassName,
        )}>
        {maintext}
      </MainGradient>
      <SecGradient as="h3" className={cn(secGradientClassName)}>
        {secText}
      </SecGradient>
    </div>
  );
};

export default AuthTopText;
