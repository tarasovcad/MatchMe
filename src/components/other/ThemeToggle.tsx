"use client";

import {Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {useId} from "react";

export default function ThemeToggle() {
  const id = useId();
  const {theme, setTheme} = useTheme();

  return (
    <div className="flex flex-col justify-center">
      <input
        type="checkbox"
        name="theme-toggle"
        id={id}
        className="peer sr-only"
        checked={theme === "dark"}
        onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle dark mode"
      />
      <label
        className="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ring/70"
        htmlFor={id}
        aria-hidden="true">
        <Sun className="dark:hidden" size={20} aria-hidden="true" />
        <Moon className="hidden dark:block" size={20} aria-hidden="true" />
        <span className="sr-only">Switch to light / dark version</span>
      </label>
    </div>
  );
}
