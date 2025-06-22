"use client";
import React from "react";
import {Button} from "@/components/shadcn/button";
import {ArrowRight} from "lucide-react";
import {motion} from "framer-motion";
import Link from "next/link";
import PixelatedGrid from "@/components/ui/PixelatedGrid";
import NavbarProvider from "@/components/providers/NavbarProvider";

const NotFound = () => {
  return (
    <NavbarProvider>
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 md:px-8">
        {/* Header Content */}
        <div className="text-center mb-8 sm:mb-12 max-w-2xl">
          {/* Title */}
          <motion.h1
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3, ease: "easeOut"}}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-foreground/80">
            Oops! Page not found.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3, delay: 0.1, ease: "easeOut"}}
            className="text-base sm:text-lg text-secondary mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
            Sorry, the page you are looking for does not exist or has been moved.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.3, delay: 0.2, ease: "easeOut"}}
            className="flex flex-col sm:flex-row justify-center items-center group gap-4">
            <motion.div whileHover="hover" initial="initial" className="w-full sm:w-auto">
              <Button
                variant="default"
                size="default"
                className="w-full sm:w-auto px-4 pr-13 relative">
                Back to Homepage
                <div className="bg-[#6459CE] w-6 h-6  group-hover:bg-[#6459CE]/70 transition-all duration-300 rounded-md p-1 absolute right-4 top-1/2 -translate-y-1/2 overflow-hidden">
                  <motion.div
                    variants={{
                      initial: {x: 0},
                      hover: {x: "300%"},
                    }}
                    transition={{duration: 0.3, ease: "easeInOut"}}
                    className="absolute inset-0 flex items-center justify-center">
                    <ArrowRight size={16} />
                  </motion.div>

                  <motion.div
                    variants={{
                      initial: {x: "-300%"},
                      hover: {x: 0},
                    }}
                    transition={{duration: 0.3, ease: "easeInOut"}}
                    className="absolute inset-0 flex items-center justify-center">
                    <ArrowRight size={16} />
                  </motion.div>
                </div>
              </Button>
            </motion.div>

            <Link href="/help" className="relative group">
              <Button
                variant="link"
                size="default"
                className="w-full sm:w-auto px-4 text-foreground hover:no-underline">
                Visit our Help Center
              </Button>
              <div className="absolute h-[1.5px] bg-foreground/80 w-[calc(100%-2rem)] bottom-[7px] left-4"></div>
              <div className="absolute h-[1.5px] bg-[#6459CE] z-10 w-0 group-hover:w-[calc(100%-2rem)] bottom-[7px] left-4 transition-all duration-600 ease-out"></div>
            </Link>
          </motion.div>
        </div>

        {/* Pixelated Grid */}
        <div className="w-full flex justify-center px-2 sm:px-4 md:px-0">
          <PixelatedGrid />
        </div>
      </div>
    </NavbarProvider>
  );
};

export default NotFound;
