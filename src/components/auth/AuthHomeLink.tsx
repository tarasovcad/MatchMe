import {motion} from "framer-motion";
import {ChevronLeft} from "lucide-react";
import Link from "next/link";
import React from "react";

const AuthHomeLink = () => {
  return (
    <Link href={"/home"} className="absolute top-4 left-4 w-fit">
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
            className="text-[#48494A] group-hover:opacity-60 transition-all duration-300 ease-in-out"
          />
        </motion.div>

        <span className="bg-maingradient bg-clip-text text-transparent w-fit text-sm font-medium transition-all duration-300 ease-in-out group-hover:opacity-60 ">
          Home
        </span>
      </motion.div>
    </Link>
  );
};

export default AuthHomeLink;
