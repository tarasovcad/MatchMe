"use client";
import {Button} from "@/components/shadcn/button";
import {Input} from "@/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {cn} from "@/lib/utils";
import {DropdownOption, SocialOption} from "@/types/settingsFieldsTypes";
import {Plus} from "lucide-react";
import {useState} from "react";
import {useFormContext} from "react-hook-form";

export default function SocialLinksInput({
  id,
  placeholder,
  name,
  socials,
  error,
}: {
  id: string;
  placeholder: string;
  name: string;
  socials: SocialOption[];
  error?: {message?: string} | undefined;
  options?: DropdownOption[];
}) {
  const {control, setValue} = useFormContext();

  return (
    <div className="flex flex-col gap-3  ">
      {socials.map((social) => {
        return (
          <div className="flex rounded-lg shadow-xs" key={social.title}>
            <span className="border-input bg-background text-muted-foreground  inline-flex items-center rounded-s-lg border px-3 text-sm ">
              {social.title}
            </span>

            <Input
              id={id}
              className="-ms-px rounded-s-none shadow-none"
              placeholder={placeholder}
              type="text"
              name={name}
            />
          </div>
        );
      })}
    </div>
  );
}
