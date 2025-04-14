import {Button} from "@/components/shadcn/button";
import React from "react";
import {useFormContext} from "react-hook-form";

const VerifyAccountButton = ({name}: {name: string}) => {
  const {watch} = useFormContext();
  const isVerified = watch(name);

  return (
    <div className="flex justify-end items-center gap-2 h-9">
      {isVerified ? (
        <span>Verified</span>
      ) : (
        <Button
          variant="outline"
          size="xs"
          className="w-full max-w-[117px] h-fit text-[13px]">
          Verify Now
        </Button>
      )}
    </div>
  );
};

export default VerifyAccountButton;
