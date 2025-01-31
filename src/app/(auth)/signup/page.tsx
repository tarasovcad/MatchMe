"use client";
import {ChevronLeft} from "lucide-react";
import Link from "next/link";
import {motion} from "framer-motion";
import React, {useState} from "react";
import {LogoImage} from "@/components/ui/Logo";
import MainGradient, {SecGradient} from "@/components/ui/Text";
import SimpleInput from "@/components/ui/SimpleInput";
import CustomCheckbox from "@/components/ui/CustomCheckbox";
import {Button} from "@/components/shadcn/button";
import Image from "next/image";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
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
      {/* Signup form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px] flex flex-col gap-[22px]">
          <LogoImage size={32} />
          <div className="flex flex-col gap-9  w-full justify-center ">
            <div>
              <MainGradient
                as="h1"
                className="text-center text-[36px] font-bold sm:text-[32px] xs:text-[30px] max-[396px]:text-[24px]">
                Start Your Journey
              </MainGradient>
              <SecGradient as="h3" className=" text-base">
                Join and start connecting instantly
              </SecGradient>
            </div>
            <div className="flex flex-col gap-4">
              <SimpleInput
                mail
                label="Enter your email"
                placeholder="example@gmail.com"
                type="email"
              />
              <CustomCheckbox />
            </div>
          </div>
          <Button
            disabled
            variant={"default"}
            size={"default"}
            className="relative transition-all duration-300 ease-in-out w-full 
             bg-purplegradient 
             hover:before:opacity-100 
             overflow-hidden 
             before:content-[''] 
             before:absolute 
             before:inset-0 
             before:bg-hoverpurplegradient 
             before:opacity-0 
             before:transition-opacity 
             before:duration-300
             disabled:opacity-50 
             disabled:cursor-not-allowed
             disabled:hover:before:opacity-0">
            <span className="relative z-10">Send 4-digit code</span>
          </Button>
          <div className="flex items-center justify-center w-full">
            <div className="flex-1 border-t border-[#71717A] opacity-20 h-[1px]"></div>
            <span className="mx-3 text-secondary/80 text-xs">OR</span>
            <div className="flex-1 border-t border-[#71717A]  opacity-20 h-[1px]"></div>
          </div>
          <div className="w-full flex flex-col gap-3 justify-center">
            <Button asChild className="gap-3 w-full">
              <Link href="#">
                <Image src="/google.webp" alt="Google" width={16} height={16} />
                Sign up with Google
              </Link>
            </Button>
            <Button asChild className="gap-3 w-full">
              <Link href="#">
                <Image src="github.svg" alt="Github" width={16} height={16} />
                Sign up with Github
              </Link>
            </Button>
          </div>
          <p className="text-center text-sm text-secondary">
            Already have an account?{" "}
            <Link
              href={"#"}
              className="transition-colors duration-300 ease-in-out text-primary hover:text-primary-hover font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center">
        <div className="flex gap-2.5 items-center justify-center">
          <div className="w-5 h-2.5 rounded-full bg-primary"></div>
          <button
            disabled
            className="w-2.5 h-2.5 rounded-full bg-input transition-all duration-300 ease-in-out   group-disabled:cursor-not-allowed group-disabled:opacity-50 hover:scale-110 hover:bg-primary disabled:hover:scale-100 disabled:hover:bg-input"></button>
          <button
            disabled
            className="w-2.5 h-2.5 rounded-full bg-input transition-all duration-300 ease-in-out   group-disabled:cursor-not-allowed group-disabled:opacity-50 hover:scale-110 hover:bg-primary disabled:hover:scale-100 disabled:hover:bg-input"></button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
