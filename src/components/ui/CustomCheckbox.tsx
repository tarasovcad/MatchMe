import React, {useId} from "react";
import {Label} from "../shadcn/label";
import {Checkbox} from "../shadcn/checkbox";
import Link from "next/link";

const CustomCheckbox = () => {
  const id = useId();
  return (
    <div
      className="flex items-center gap-2"
      style={
        {
          "--primary": "238.7 83.5% 66.7%",
          "--ring": "238.7 83.5% 66.7%",
        } as React.CSSProperties
      }>
      <Checkbox id={id} />
      <TermsAndPolicy />
    </div>
  );
};

const TermsAndPolicy = () => {
  const id = useId();
  return (
    <Label htmlFor={id} className="text-sm font-normal">
      I agree to the{" "}
      <Link
        href={"#"}
        className="transition-colors duration-300 ease-in-out text-primary hover:text-primary-hover">
        Terms & Policy
      </Link>
    </Label>
  );
};

export default CustomCheckbox;
