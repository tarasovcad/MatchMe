import {Slot} from "@radix-ui/react-slot";
import {cva, type VariantProps} from "class-variance-authority";
import * as React from "react";

import {cn} from "@/lib/utils";
import LoadingButtonCirlce from "../ui/LoadingButtonCirlce";

const buttonVariants = cva(
  "inline-flex justify-center items-center gap-1.5 disabled:opacity-50 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 outline-offset-2 font-medium text-sm whitespace-nowrap transition-colors transition-colors duration-300 ease-in-out cursor-pointer [&_svg]:pointer-events-none disabled:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs shadow-sm hover:bg-primary/90 ",
        destructive:
          "border border-input bg-background shadow-xs shadow-black/5 hover:bg-accent  text-destructive hover:text-destructive/90",
        outline:
          "border border-input bg-background  shadow-xs shadow-black/5 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "text-[#f4f4f5] dark:text-[#09090B] bg-[#292929] dark:bg-[#fff]  shadow-xs shadow-black/5 hover:opacity-90 ",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-[38px] py-[10px] h-[38px] text-sm",
        sm: "py-[10px] px-[16px]",
        xs: "h-9 px-4 py-2",
        lg: "h-10 px-8",
        icon: "h-[38px] w-[38px]",
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
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size, asChild = false, disabled, isLoading, children, ...props}, ref) => {
    const Comp = asChild ? Slot : "button";
    const computedClassName = cn(
      buttonVariants({variant, size, className}),
      disabled && "pointer-events-none opacity-50",
    );

    return (
      <Comp className={computedClassName} ref={ref} {...props} disabled={disabled || isLoading}>
        {isLoading ? <LoadingButtonCirlce /> : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export {Button, buttonVariants};
