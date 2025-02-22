"use client";

import {Textarea} from "@/components/shadcn/textarea";
import {cn} from "@/lib/utils";
import {useRef, useEffect, useState} from "react";

export default function AutogrowingTextarea({
  id,
  placeholder,
  name,
  className,
}: {
  id: string;
  placeholder: string;
  name: string;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="w-full">
      <Textarea
        id={id}
        name={name}
        ref={textareaRef}
        placeholder={placeholder || ""}
        className={cn(
          "resize-none overflow-hidden max-h-[150px] min-h-0",
          className,
        )}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
