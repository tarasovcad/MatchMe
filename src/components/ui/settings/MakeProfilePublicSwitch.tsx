import {Switch} from "@/components/shadcn/switch";
import React from "react";
import {useFormContext} from "react-hook-form";
import {motion, AnimatePresence} from "framer-motion";

const MakeProfilePublicSwitch = ({id, name}: {id: string; name: string}) => {
  const {watch, setValue} = useFormContext();
  const isVisible = watch(name);

  return (
    <div className="flex justify-end items-center gap-2 h-9">
      <Switch
        id={id}
        checked={isVisible}
        onCheckedChange={(checked) => setValue(name, checked)}
        aria-label="Toggle switch"
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={isVisible ? "visible" : "hidden"}
          initial={{opacity: 0, height: 0, marginTop: 0}}
          animate={{opacity: 1, height: "auto"}}
          exit={{opacity: 0, height: 0, marginTop: 0}}
          transition={{duration: 0.1, ease: "easeInOut"}}
          className="text-sm font-medium text-foreground inline-block">
          {isVisible ? "Visible" : "Hidden"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default MakeProfilePublicSwitch;
