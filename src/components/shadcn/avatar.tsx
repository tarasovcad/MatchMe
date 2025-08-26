"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import {cn} from "@/lib/utils";

function Avatar({className, ...props}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

function AvatarImage({className, ...props}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

type AvatarFallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  fallbackImage?: string;
  fallbackImageAlt?: string;
};

function AvatarFallback({
  className,
  fallbackImage,
  fallbackImageAlt,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-background  border-foreground/20  border-dashed flex size-full items-center justify-center rounded-full",
        className,
        !fallbackImage && "border",
      )}
      {...props}>
      {fallbackImage ? (
        <img
          src={fallbackImage}
          alt={fallbackImageAlt ?? "Avatar"}
          className="size-full object-cover rounded-full"
        />
      ) : (
        children
      )}
    </AvatarPrimitive.Fallback>
  );
}

export {Avatar, AvatarImage, AvatarFallback};
