import {motion} from "framer-motion";
import {ChevronLeft} from "lucide-react";
import Link from "next/link";
import React from "react";

const AuthHomeLink = () => {
  return (
    <Link href={"/"} className="absolute top-4 left-4 w-fit">
      <motion.div
        className="flex gap-[6px] items-center px-2 py-1 rounded-md cursor-pointer group"
        whileHover="hover"
        initial="initial">
        <motion.div
          variants={{
            initial: {x: 0},
            hover: {x: -2},
          }}
          transition={{type: "spring", stiffness: 200}}>
          <ChevronLeft
            size={16}
            className="text-[#48494A] group-hover:text-[#2b2b2c]"
          />
        </motion.div>

        <motion.div
          variants={{
            initial: {opacity: 1},
            hover: {opacity: 1},
          }}
          transition={{duration: 0.3}}>
          <span
            className={`bg-maingradient bg-clip-text text-transparent w-fit text-sm font-medium group-hover:text-[#2b2b2c] transition-all duration-300 ease-in-out`}>
            Home
          </span>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default AuthHomeLink;
