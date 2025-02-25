"use client";

import * as React from "react";
import {cn} from "@/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({className, ...props}, ref) => (
  <label
    ref={ref}
    className={cn(
      "bg-maingradient bg-clip-text text-transparent w-fit text-sm font-medium leading-4  peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

export {Label};
