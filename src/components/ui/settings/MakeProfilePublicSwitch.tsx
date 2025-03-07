import {Label} from "@/components/shadcn/label";
import {Switch} from "@/components/shadcn/switch";
import React from "react";
import {useState} from "react";
import {useFormContext} from "react-hook-form";
const MakeProfilePublicSwitch = ({id, name}: {id: string; name: string}) => {
  const {watch, setValue} = useFormContext();
  const isVisible = watch(name);
  console.log(isVisible);
  return (
    <div className="flex justify-end items-center gap-2 h-9">
      <Switch
        id={id}
        checked={isVisible}
        onCheckedChange={(checked) => setValue(name, checked)}
        aria-label="Toggle switch"
      />

      <span className="text-sm font-medium text-foreground">
        {isVisible ? "Visible" : "Hidden"}
      </span>
    </div>
  );
};

export default MakeProfilePublicSwitch;
