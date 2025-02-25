import Link from "next/link";
import React from "react";

const AuthBottomSubTitle = ({
  maintext,
  link,
  href,
}: {
  maintext: string | undefined;
  link: string | undefined;
  href?: string | undefined;
}) => {
  return (
    <p className="text-center text-sm text-secondary">
      {maintext}{" "}
      <Link
        href={href || "#"}
        className="transition-colors duration-300 ease-in-out text-primary hover:text-primary-hover font-medium">
        {link}
      </Link>
    </p>
  );
};

export default AuthBottomSubTitle;
