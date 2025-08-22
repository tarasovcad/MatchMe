"use client";

import {Shield, ArrowRight, Users, Mail} from "lucide-react";
import {Button} from "../shadcn/button";
import {motion} from "framer-motion";
import Link from "next/link";

export default function AccessDeniedSection({
  tabName = "this section",
  projectId,
}: {
  tabName?: string;
  projectId: string;
}) {
  const parent = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const group = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const item = {
    hidden: {opacity: 0, y: 6},
    show: {opacity: 1, y: 0, transition: {duration: 0.12}},
  };

  return (
    <div className="flex items-center justify-center px-4 py-12 ">
      <div className="w-full max-w-md">
        <motion.div
          initial="hidden"
          animate="show"
          variants={parent}
          className="p-8 text-center space-y-4">
          {/* Icon + Title */}
          <motion.div variants={group} className="space-y-2">
            <motion.div variants={item} className="flex justify-center">
              <Shield className="text-foreground/80" size={24} />
            </motion.div>

            <motion.h1 variants={item} className="text-xl font-bold  text-foreground/80">
              Permission required
            </motion.h1>
          </motion.div>

          <motion.p variants={item} className="text-sm text-foreground/70 leading-relaxed px-4">
            You don&apos;t currently have access to {tabName}. If you believe you should have
            access, request it from a project owner or switch to a tab you can view.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={item}
            className="pt-2 inline-flex flex-col items-stretch gap-2 mx-auto">
            <Link href={`/projects/${projectId}`}>
              <motion.div whileHover="hover" initial="initial" className="w-full">
                <Button
                  variant="default"
                  size="default"
                  className="w-full px-4  relative group justify-center">
                  Back to Project
                  <div className="bg-[#6459CE] w-6 h-6  group-hover:bg-[#6459CE]/70 transition-all duration-300 rounded-md p-1 absolute right-4 top-1/2 -translate-y-1/2 overflow-hidden">
                    <motion.div
                      variants={{
                        initial: {x: 0},
                        hover: {x: "300%"},
                      }}
                      transition={{duration: 0.2, ease: "easeInOut"}}
                      className="absolute inset-0 flex items-center justify-center">
                      <ArrowRight size={16} />
                    </motion.div>

                    <motion.div
                      variants={{
                        initial: {x: "-300%"},
                        hover: {x: 0},
                      }}
                      transition={{duration: 0.15, ease: "easeInOut"}}
                      className="absolute inset-0 flex items-center justify-center">
                      <ArrowRight size={16} />
                    </motion.div>
                  </div>
                </Button>
              </motion.div>
            </Link>
            <div className="flex gap-2 self-start">
              <Button variant="outline" className="w-fit gap-2" size="xs">
                <Users size={16} />
                Request access
              </Button>
              <Button variant="outline" className="w-fit gap-2" size="xs">
                <Mail size={16} />
                Contact owner
              </Button>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div variants={item} className="pt-4 mt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Need help? Contact your project administrator or
              <br />
              <span className="text-primary hover:underline cursor-pointer">
                visit our help center
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
