"use client";

import {cn} from "@/lib/utils";
import {OTPInput, SlotProps} from "input-otp";
import {Minus} from "lucide-react";
import {useId} from "react";
import {motion} from "framer-motion";

const containerVariants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {
      duration: 0.1,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {y: 20, opacity: 0},
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 12,
      duration: 0.2,
    },
  },
};

interface AuthOTPProps {
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  otpError?: boolean;
}

export default function AuthOTP({setOtp}: AuthOTPProps) {
  const id = useId();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex items-center gap-3 has-disabled:opacity-50 transition-all">
      <OTPInput
        id={id}
        containerClassName="flex items-center gap-3"
        maxLength={6}
        onChange={setOtp}
        render={({slots}) => (
          <>
            <motion.div variants={itemVariants} className="flex gap-1">
              {slots.slice(0, 3).map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-muted-foreground/80">
              <Minus size={16} strokeWidth={2} aria-hidden="true" />
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-1">
              {slots.slice(3).map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </motion.div>
          </>
        )}
      />
    </motion.div>
  );
}

function Slot({char, hasError}: SlotProps & {hasError?: boolean}) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "flex size-12 items-center justify-center rounded-lg border bg-background font-medium text-foreground shadow-xs shadow-black/5 transition-shadow",
        hasError
          ? "border-destructive ring-[3px] ring-ring/20"
          : "border-input",
        char !== null && !hasError
          ? "border-primary ring-[3px] ring-ring/20"
          : "",
      )}>
      {char !== null && <div>{char}</div>}
    </motion.div>
  );
}
