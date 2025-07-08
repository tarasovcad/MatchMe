"use client";

import React, {useEffect} from "react";
import {Fancybox} from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import Image from "next/image";

interface BackgroundImageViewerProps {
  backgroundImage?: {fileName: string; fileSize: number; uploadedAt: string; url: string}[] | null;
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

const BackgroundImageViewer = ({
  backgroundImage,
  name,
  className = "",
  style,
}: BackgroundImageViewerProps) => {
  // Initialize Fancybox
  useEffect(() => {
    Fancybox.bind('[data-fancybox="background-image"]');

    // Cleanup
    return () => {
      Fancybox.destroy();
    };
  }, [backgroundImage]);

  if (backgroundImage && backgroundImage.length > 0) {
    return (
      <a
        href={backgroundImage[0].url}
        data-fancybox="background-image"
        className="cursor-pointer block">
        <Image
          src={backgroundImage[0].url}
          unoptimized
          alt={`${name} background`}
          width={0}
          height={0}
          sizes="100vw"
          className={className}
          style={style}
        />
      </a>
    );
  }

  return <div className={className} style={style} />;
};

export default BackgroundImageViewer;
