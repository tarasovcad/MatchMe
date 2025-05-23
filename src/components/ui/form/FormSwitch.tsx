import React from "react";
import {useFormContext} from "react-hook-form";
import {AnimatePresence, motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {Switch} from "@/components/shadcn/switch";

type FormSwitchProps = {
  id: string;
  name: string;
  disabled?: boolean;
  visibleLabel?: string;
  hiddenLabel?: string;
  customDisabledLogic?: () => boolean;
};

const FormSwitch = ({
  id,
  name,
  disabled = false,
  visibleLabel = "Visible",
  hiddenLabel = "Hidden",
  customDisabledLogic,
}: FormSwitchProps) => {
  const {watch, setValue} = useFormContext();
  const isChecked = watch(name);

  const isDisabled = customDisabledLogic ? !customDisabledLogic() : disabled;

  return (
    <div className="flex justify-end items-center gap-2 h-9">
      <Switch
        id={id}
        checked={isChecked}
        onCheckedChange={(checked) => setValue(name, checked)}
        aria-label="Toggle switch"
        disabled={isDisabled}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={isChecked ? "visible" : "hidden"}
          initial={{opacity: 0, height: 0, marginTop: 0}}
          animate={{opacity: 1, height: "auto"}}
          exit={{opacity: 0, height: 0, marginTop: 0}}
          transition={{duration: 0.1, ease: "easeInOut"}}
          className={cn(
            "inline-block w-[46px] font-medium text-foreground text-sm",
            isDisabled && "text-muted-foreground",
          )}>
          {isChecked ? visibleLabel : hiddenLabel}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default FormSwitch;
