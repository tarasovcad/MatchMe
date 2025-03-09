"use client";

import {ChangeEvent, useEffect, useRef} from "react";
import {Textarea} from "../shadcn/textarea";
import {cn} from "@/lib/utils";
import {UseFormRegisterReturn} from "react-hook-form";
import {AnimatePresence, motion} from "framer-motion";

export default function AutogrowingTextarea({
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
  const defaultRows = 1;
  const maxRows = undefined;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
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

      const newHeight = Math.min(
        textarea.scrollHeight + borderHeight,
        maxHeight,
      );
      textarea.style.height = `${newHeight}px`;
    }
  }, [maxRows, textareaRef.current?.value]);

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
    <div className="space-y-2">
      <Textarea
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
        className={cn(
          "min-h-[none] resize-none h-9",
          error &&
            "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
          className,
        )}
        onBlur={register?.onBlur}
      />
      <AnimatePresence>
        {error?.message && (
          <motion.p
            className="text-destructive text-xs"
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
