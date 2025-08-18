"use client";

import React, {useEffect} from "react";
import {Fancybox} from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import Image from "next/image";

interface ImageViewerProps {
  image?: {fileName: string; fileSize: number; uploadedAt: string; url: string}[] | string | null;
  name: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  fallbackImage?: string;
  type?: "profile" | "project";
  alt?: string;
}

const ImageViewer = ({
  image,
  name,
  width = 125,
  height = 125,
  className = "",
  style,
  fallbackImage = "/avatar/default-user-avatar.png",
  type = "profile",
  alt,
}: ImageViewerProps) => {
  // Handle different image formats
  const getImageUrl = () => {
    if (!image) return fallbackImage;

    if (typeof image === "string") {
      return image;
    }

    if (Array.isArray(image) && image.length > 0) {
      return image[0].url;
    }

    return fallbackImage;
  };

  const imageUrl = getImageUrl();
  const fancyboxGroup = `${type}-image-${name}`;
  const displayAlt = alt || `${name} ${type} image`;

  useEffect(() => {
    Fancybox.bind(`[data-fancybox="${fancyboxGroup}"]`);

    // Cleanup
    return () => {
      Fancybox.destroy();
    };
  }, [image, fancyboxGroup]);

  return (
    <a href={imageUrl} data-fancybox={fancyboxGroup} className="cursor-pointer shrink-0">
      <Image
        src={imageUrl}
        alt={displayAlt}
        width={width}
        height={height}
        className={className}
        loading="eager"
        style={style}
        unoptimized
      />
    </a>
  );
};

export default ImageViewer;
