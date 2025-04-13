import Link from "next/link";
import React from "react";

const AuthBottomSubTitle = ({
  maintext,
  link,
  href,
  isResendLink,
  handleResendOTP,
}: {
  maintext: string | undefined;
  link: string | undefined;
  href?: string | undefined;
  isResendLink?: boolean;
  handleResendOTP?: () => void;
}) => {
  if (isResendLink) {
    return (
      <p className="text-secondary text-sm text-center">
        {maintext}{" "}
        <button
          type="button"
          onClick={handleResendOTP}
          className="font-medium text-primary hover:text-primary-hover transition-colors duration-300 ease-in-out cursor-pointer">
          {link}
        </button>
      </p>
    );
  }
  return (
    <p className="text-secondary text-sm text-center">
      {maintext}{" "}
      <Link
        href={href || "#"}
        className="font-medium text-primary hover:text-primary-hover transition-colors duration-300 ease-in-out">
        {link}
      </Link>
    </p>
  );
};

export default AuthBottomSubTitle;
