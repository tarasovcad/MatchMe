import * as React from "react";

import {cn} from "@/lib/utils";

function Textarea({className, ...props}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/25",
        className,
      )}
      {...props}
    />
  );
}
Textarea.displayName = "Textarea";

export {Textarea};
