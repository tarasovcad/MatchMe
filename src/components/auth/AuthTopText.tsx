import React from "react";
import MainGradient, {SecGradient} from "../ui/Text";

const AuthTopText = ({
  maintext,
  secText,
}: {
  maintext: string;
  secText: string;
}) => {
  return (
    <div>
      <MainGradient
        as="h1"
        className="text-center text-[36px] font-bold sm:text-[32px] xs:text-[30px] max-[396px]:text-[24px]">
        {maintext}
      </MainGradient>
      <SecGradient as="h3" className=" text-base">
        {secText}
      </SecGradient>
    </div>
  );
};

export default AuthTopText;
