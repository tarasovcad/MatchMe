"use client";

import {cn} from "@/lib/utils";
import {OTPInput, SlotProps} from "input-otp";
import {Minus} from "lucide-react";
import {useId} from "react";

interface AuthOTPProps {
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  otpError?: boolean;
}

export default function AuthOTP({setOtp}: AuthOTPProps) {
  const id = useId();

  return (
    <OTPInput
      id={id}
      containerClassName={cn(
        "flex items-center gap-3 has-[:disabled]:opacity-50 transition-all",
      )}
      maxLength={6}
      onChange={setOtp}
      render={({slots}) => (
        <>
          <div className="flex gap-1">
            {slots.slice(0, 3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>

          <div className="text-muted-foreground/80">
            <Minus size={16} strokeWidth={2} aria-hidden="true" />
          </div>

          <div className="flex gap-1">
            {slots.slice(3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        </>
      )}
    />
  );
}

function Slot({char, hasError}: SlotProps & {hasError?: boolean}) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-lg border bg-background font-medium text-foreground shadow-sm shadow-black/5 transition-shadow",
        hasError
          ? "border-destructive ring-[3px] ring-ring/20"
          : "border-input",
        char !== null && !hasError
          ? "border-primary ring-[3px] ring-ring/20"
          : "", // Apply ring only if there's no error
      )}>
      {char !== null && <div>{char}</div>}
    </div>
  );
}
