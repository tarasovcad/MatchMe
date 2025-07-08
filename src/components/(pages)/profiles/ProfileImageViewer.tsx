"use client";

import React, {useEffect} from "react";
import {Fancybox} from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import Image from "next/image";
import Avatar from "boring-avatars";
import {getNameInitials} from "@/functions/getNameInitials";

interface ProfileImageViewerProps {
  profileImage?: {fileName: string; fileSize: number; uploadedAt: string; url: string}[] | null;
  name: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ProfileImageViewer = ({
  profileImage,
  name,
  width = 125,
  height = 125,
  className = "",
  style,
}: ProfileImageViewerProps) => {
  // Initialize Fancybox
  useEffect(() => {
    Fancybox.bind('[data-fancybox="profile-image"]');

    // Cleanup
    return () => {
      Fancybox.destroy();
    };
  }, [profileImage]);

  if (profileImage && profileImage.length > 0) {
    return (
      <a href={profileImage[0].url} data-fancybox="profile-image" className="cursor-pointer">
        <Image
          src={profileImage[0].url}
          alt={name}
          width={width}
          height={height}
          className={className}
          loading="eager"
          style={style}
          unoptimized
        />
      </a>
    );
  }

  return (
    <Avatar
      name={getNameInitials(name)}
      width={width}
      height={height}
      className={className}
      style={style}
      variant="beam"
    />
  );
};

export default ProfileImageViewer;
