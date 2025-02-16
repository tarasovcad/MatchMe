"use client";

import {useTheme} from "next-themes";
import {useEffect} from "react";

const FaviconUpdater = () => {
  const {theme} = useTheme();

  useEffect(() => {
    const favicon: HTMLLinkElement | null =
      document.querySelector("link[rel~='icon']");
    if (!favicon) return;

    favicon.href = theme === "dark" ? "/dark-icon.svg" : "/light-icon.svg";
  }, [theme]);

  return null;
};

export default FaviconUpdater;
