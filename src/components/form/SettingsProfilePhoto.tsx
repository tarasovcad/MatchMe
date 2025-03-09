import Image from "next/image";
import React from "react";
import {Avatar, AvatarFallback, AvatarImage} from "../shadcn/avatar";
import {CloudAdd} from "iconsax-react";
import MainGradient from "../ui/Text";
const SettingsProfilePhoto = () => {
  return (
    <div className="flex items-start gap-6 w-full max-[1015px]:gap-3 max-[990px]:gap-6">
      <Avatar className="h-[85px] w-[85px] rounded-full max-[1015px]:h-[75px] max-[1015px]:w-[75px]">
        <AvatarImage
          src={
            "https://lh3.googleusercontent.com/a/ACg8ocKgWPBgzrCGrCCv9RX38lQamdwTQ6VZWgFMipM4DLxjLDXh2nk=s96-c"
          }
          alt={"avatar"}
        />
        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
      </Avatar>
      <div className="border border-border rounded-[8px] flex flex-col items-center justify-center gap-[6px] text-center max-w-[329px] w-full py-6 bg-sidebar-background ">
        <div className="p-[6px] rounded-full bg-muted-foreground/10 flex items-center justify-center">
          <CloudAdd
            size="24"
            color="hsl(var(--foreground))"
            className="opacity-80"
          />
        </div>

        <div className="flex flex-col gap-[4px]">
          <p className="font-medium ">
            <button className="text-primary cursor-pointer">
              Click to upload
            </button>{" "}
            <span className="text-foreground/80">or drag and drop</span>
          </p>
          <p className="text-[12px] text-secondary">
            SVG, PNG and JPG formats, up to 10MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfilePhoto;
