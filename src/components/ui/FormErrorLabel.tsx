import {AnimatePresence, motion} from "framer-motion";
import React from "react";

const FormErrorLabel = ({
  error,
  children,
}: {
  error?: {message?: string} | undefined;
  children?: React.ReactNode;
}) => {
  return (
    <AnimatePresence>
      {error?.message && (
        <motion.p
          className="text-destructive text-xs"
          layout
          initial={{opacity: 0, height: 0, marginTop: 0}}
          animate={{opacity: 1, height: "auto", marginTop: 8}}
          exit={{opacity: 0, height: 0, marginTop: 0}}
          transition={{duration: 0.1, ease: "easeInOut"}}>
          {children ? children : error.message}
        </motion.p>
      )}
    </AnimatePresence>
  );
};

export default FormErrorLabel;
