import React, {useId} from "react";
import {Label} from "../shadcn/label";
import {Checkbox} from "../shadcn/checkbox";
import Link from "next/link";

interface CustomCheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id: string;
  name: string;
  showTerms?: boolean;
}

const CustomCheckbox = ({
  checked,
  onCheckedChange,
  id,
  name,
  showTerms = true,
  ...props
}: CustomCheckboxProps) => {
  return (
    <div>
      <div
        className="flex items-center gap-2"
        style={
          {
            "--primary": "238.7 83.5% 66.7%",
            "--ring": "238.7 83.5% 66.7%",
          } as React.CSSProperties
        }>
        <Checkbox
          id={id}
          checked={checked}
          name={name}
          onCheckedChange={onCheckedChange}
          {...props}
        />
        {showTerms && <TermsAndPolicy id={id} />}
      </div>
    </div>
  );
};

const TermsAndPolicy = ({id}: {id: string}) => {
  return (
    <Label htmlFor={id} className="font-normal text-sm">
      I agree to the{" "}
      <Link
        href={"#"}
        className="text-primary hover:text-primary-hover transition-colors duration-300 ease-in-out">
        Terms & Policy
      </Link>
    </Label>
  );
};

export default CustomCheckbox;
