"use client";

import {ChangeEvent, useRef, useState} from "react";
import {Textarea} from "../shadcn/textarea";
import {cn} from "@/lib/utils";
import {UseFormRegisterReturn} from "react-hook-form";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "../shadcn/button";
import {Bold, Italic, Link} from "lucide-react";

export default function DescriptionEditor({
  id,
  placeholder,
  name,
  className,
  register,
  error,
}: {
  id: string;
  placeholder: string;
  name: string;
  className?: string;
  register?: UseFormRegisterReturn<string>;
  error?: {message?: string} | undefined;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const defaultRows = 1;
  const maxRows = undefined;

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";

    const style = window.getComputedStyle(textarea);
    const borderHeight =
      parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
    const paddingHeight =
      parseInt(style.paddingTop) + parseInt(style.paddingBottom);

    const lineHeight = parseInt(style.lineHeight);
    const maxHeight = maxRows
      ? lineHeight * maxRows + borderHeight + paddingHeight
      : Infinity;

    const newHeight = Math.min(textarea.scrollHeight + borderHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
  };

  // Merge the refs and event handlers to prevent {...register} from overwriting the ref
  const combinedOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (register?.onChange) {
      register.onChange(e);
    }
    handleInput(e);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-input bg-background px-2 py-2 text-foreground shadow-sm shadow-black/5 transition-shadow",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isFocused && "border-ring ring-[3px] ring-ring/20",
      )}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).tagName !== "BUTTON") {
          e.preventDefault();
          textareaRef.current?.focus();
        }
      }}>
      <div className="flex items-center gap-0.5 mb-1.5">
        <Button
          size={"icon"}
          className="border-none w-8 h-8"
          onMouseDown={(e) => e.preventDefault()}>
          <Bold size={16} />
        </Button>
        <Button
          size={"icon"}
          className="border-none w-8 h-8"
          onMouseDown={(e) => e.preventDefault()}>
          <Italic size={16} />
        </Button>
        {/* <Button
          size={"icon"}
          className="border-none"
          onMouseDown={(e) => e.preventDefault()}>
          <Link size={16} />
        </Button> */}
      </div>

      <textarea
        id={id}
        placeholder={placeholder}
        ref={(e) => {
          textareaRef.current = e;
          if (typeof register?.ref === "function") {
            register.ref(e);
          }
        }}
        name={name}
        onChange={combinedOnChange}
        rows={defaultRows}
        onBlur={(e) => {
          setIsFocused(false);
          register?.onBlur?.(e);
        }}
        onFocus={() => setIsFocused(true)}
        className={cn(
          "px-[6px] flex min-h-[80px] w-full text-sm placeholder:text-muted-foreground/70 ",
          "min-h-[none] resize-none focus-visible:ring-ring/0 focus-visible:ring-[0px] focus-visible:border-ring focus-visible:outline-none",
          error &&
            "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
          className,
        )}
      />
      <AnimatePresence>
        {error?.message && (
          <motion.p
            className="text-xs text-destructive"
            layout
            initial={{opacity: 0, height: 0, marginTop: 0}}
            animate={{opacity: 1, height: "auto", marginTop: 8}}
            exit={{opacity: 0, height: 0, marginTop: 0}}
            transition={{duration: 0.1, ease: "easeInOut"}}>
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
