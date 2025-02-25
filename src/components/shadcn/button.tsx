import {Slot} from "@radix-ui/react-slot";
import {cva, type VariantProps} from "class-variance-authority";
import * as React from "react";

import {cn} from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 gap-1.5 transition-colors duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-black/5 hover:bg-primary/90 ",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90",
        outline:
          "border border-input bg-background  shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "text-[#f4f4f5] dark:text-[#09090B] bg-[#292929] dark:bg-[#fff]  shadow-sm shadow-black/5 hover:opacity-90 ",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-[38px] py-[10px] text-sm",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size, asChild = false, disabled, ...props}, ref) => {
    const Comp = asChild ? Slot : "button";
    const computedClassName = cn(
      buttonVariants({variant, size, className}),
      disabled && "pointer-events-none opacity-50",
    );

    return (
      <Comp
        className={computedClassName}
        ref={ref}
        // {...(!asChild ? {disabled} : {})}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export {Button, buttonVariants};
