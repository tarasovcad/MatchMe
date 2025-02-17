"use client";
import {useHotkeys} from "react-hotkeys-hook";
import {useTheme} from "next-themes";

export default function GlobaleHotkeys() {
  const {theme, setTheme} = useTheme();

  useHotkeys("ctrl+m", () => setTheme(theme === "dark" ? "light" : "dark"), {
    preventDefault: true,
  });

  return null;
}
