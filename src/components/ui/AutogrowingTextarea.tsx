// "use client";

// import {Textarea} from "@/components/shadcn/textarea";
// import {cn} from "@/lib/utils";
// import {useRef, useEffect, useState} from "react";

// export default function AutogrowingTextarea({
//   id,
//   placeholder,
//   name,
//   className,
// }: {
//   id: string;
//   placeholder: string;
//   name: string;
//   className?: string;
// }) {
//   const textareaRef = useRef<HTMLTextAreaElement | null>(null);
//   const [value, setValue] = useState("");

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
//     }
//   }, [value]);

//   return (
//     <div className="w-full">
//       <Textarea
//         id={id}
//         name={name}
//         ref={textareaRef}
//         placeholder={placeholder || ""}
//         className={cn(
//           "resize-none overflow-hidden max-h-[150px] min-h-0",
//           className,
//         )}
//         value={value}
//         onChange={(e) => setValue(e.target.value)}
//       />
//     </div>
//   );
// }

"use client";

import {ChangeEvent, useRef} from "react";
import {Textarea} from "../shadcn/textarea";
import {cn} from "@/lib/utils";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  return (
    <Textarea
      id={id}
      placeholder={placeholder}
      ref={textareaRef}
      name={name}
      onChange={handleInput}
      rows={defaultRows}
      className={cn("min-h-[none] resize-none h-9", className)}
    />
  );
}
