"use client";

import {
  Bell,
  ChevronsUpDown,
  Folders,
  Home,
  LogOut,
  Moon,
  Sun,
  UserCircle,
} from "lucide-react";
import Avvvatars from "avvvatars-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/shadcn/sidebar";
import {useTheme} from "next-themes";
import Link from "next/link";
import {motion} from "framer-motion";
import {useState} from "react";

const menuVariants = {
  closed: {
    clipPath: "inset(10% 50% 90% 50% round 12px)",
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.3,
    },
  },
  open: {
    clipPath: "inset(0% 0% 0% 0% round 12px)",
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.3,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  closed: {opacity: 0, scale: 0.3, filter: "blur(20px)"},
  open: {opacity: 1, scale: 1, filter: "blur(0px)"},
};

const userInfoVariants = {
  closed: {opacity: 0, filter: "blur(20px)"},
  open: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      type: "spring",
      bounce: 0,
    },
  },
};
export function SidebarUserDropdown({
  user,
}: {
  user: {name: string; email: string; avatar: string};
}) {
  const {isMobile} = useSidebar();
  const {theme, setTheme} = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarMenu className="px-2">
      <SidebarMenuItem>
        <DropdownMenu onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-text-hover">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <Avvvatars value="MT" radius={6} />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <motion.div
                animate={{rotate: isOpen ? 180 : 0}}
                transition={{duration: 0.2}}>
                <ChevronsUpDown className="ml-auto size-4" />
              </motion.div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            asChild
            side={isMobile ? "bottom" : "bottom"}
            align="end"
            sideOffset={4}>
            <motion.div
              initial="closed"
              animate={isOpen ? "open" : "closed"}
              variants={menuVariants}
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg">
              <div className="space-y-2">
                <motion.div variants={userInfoVariants}>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user.name}
                        </span>
                        <span className="truncate text-xs">{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </motion.div>

                <DropdownMenuSeparator />

                <DropdownMenuGroup className="space-y-1">
                  <motion.div variants={itemVariants}>
                    <button
                      className="w-full"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }>
                      <DropdownMenuItem className="flex items-center gap-2 justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          {theme === "dark" ? <Moon /> : <Sun />}
                          Toggle theme
                        </div>
                        <kbd className="inline-flex h-5 max-h-full items-center rounded border border-border px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                          ⌘M
                        </kbd>
                      </DropdownMenuItem>
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Link className="w-full" href={"/profile"}>
                      <DropdownMenuItem className="cursor-pointer">
                        <UserCircle />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Link className="w-full" href={"/dashboard"}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Home />
                        Homepage
                      </DropdownMenuItem>
                    </Link>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Link className="w-full" href={"/projects"}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Folders />
                        My projects
                      </DropdownMenuItem>
                    </Link>
                  </motion.div>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <motion.div variants={itemVariants}>
                  <button
                    className="w-full"
                    onClick={() => console.log("logout")}>
                    <DropdownMenuItem className="cursor-pointer">
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
