import {Switch} from "@/components/shadcn/switch";
import React from "react";
import {useFormContext} from "react-hook-form";
import {motion, AnimatePresence} from "framer-motion";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {canUserMakeProfilePublic} from "@/functions/canUserMakeProfilePublic";
import {cn} from "@/lib/utils";

const MakeProfilePublicSwitch = ({
  id,
  name,
  profile,
}: {
  id: string;
  name: string;
  profile?: MatchMeUser;
}) => {
  const {watch, setValue} = useFormContext();
  const isVisible = watch(name);

  const {canMakeProfilePublic} = canUserMakeProfilePublic(
    profile as MatchMeUser,
  );

  return (
    <div className="flex justify-end items-center gap-2 h-9">
      <Switch
        id={id}
        checked={isVisible}
        onCheckedChange={(checked) => setValue(name, checked)}
        aria-label="Toggle switch"
        disabled={!canMakeProfilePublic}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={isVisible ? "visible" : "hidden"}
          initial={{opacity: 0, height: 0, marginTop: 0}}
          animate={{opacity: 1, height: "auto"}}
          exit={{opacity: 0, height: 0, marginTop: 0}}
          transition={{duration: 0.1, ease: "easeInOut"}}
          className={cn(
            "inline-block w-[46px] font-medium text-foreground text-sm",
            !canMakeProfilePublic && "text-muted-foreground",
          )}>
          {isVisible ? "Visible" : "Hidden"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default MakeProfilePublicSwitch;
