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
import Image from "next/image";
import {getNameInitials} from "@/functions/getNameInitials";
import {
  itemDropdownVariants,
  menuVariants,
  userInfoVariants,
} from "@/utils/other/variants";
import AlertComponent from "../dialog/AlertComponent";
import {toast} from "sonner";
import {signOut} from "@/actions/(auth)/signOut";

export function SidebarUserDropdown({
  user,
}: {
  user: {name: string; email: string; avatar: string; username: string};
}) {
  const {isMobile} = useSidebar();
  const {theme, setTheme} = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  let toastId: string | number = "";

  const handleLogout = async () => {
    toastId = toast.loading("Logging out...");
    const response = await signOut();
    if (response.error) {
      console.log(response.error);
      toast.error(response.error, {id: toastId});
      return;
    }

    toast.success(response.message, {id: toastId});
    setIsOpen(false);
  };
  return (
    <SidebarMenu className="px-2">
      <SidebarMenuItem>
        <DropdownMenu onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-text-hover">
              <Avatar className="rounded-lg w-8 h-8">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={100}
                    height={100}
                  />
                ) : (
                  <Avvvatars value={getNameInitials(user.name)} radius={6} />
                )}
              </Avatar>
              <div className="flex-1 grid text-sm text-left leading-tight">
                <span className="font-semibold truncate">{user.name}</span>
                <span className="text-xs truncate">{user.email}</span>
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
              className="rounded-lg w-(--radix-dropdown-menu-trigger-width) min-w-56">
              <div className="space-y-2">
                <motion.div variants={userInfoVariants}>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-sm text-left">
                      <Avatar className="rounded-lg w-8 h-8">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={100}
                            height={100}
                          />
                        ) : (
                          <Avvvatars value="MT" radius={6} />
                        )}
                      </Avatar>
                      <div className="flex-1 grid text-sm text-left leading-tight">
                        <span className="font-semibold truncate">
                          {user.name}
                        </span>
                        <span className="text-xs truncate">{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </motion.div>

                <DropdownMenuSeparator />

                <DropdownMenuGroup className="space-y-1">
                  <motion.div variants={itemDropdownVariants}>
                    <button
                      className="w-full"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }>
                      <DropdownMenuItem className="flex justify-between items-center gap-2 cursor-pointer">
                        <div className="flex items-center gap-2">
                          {theme === "dark" ? <Moon /> : <Sun />}
                          Toggle theme
                        </div>
                        <kbd className="inline-flex items-center px-1 border border-border rounded h-5 max-h-full font-[inherit] font-medium text-[0.625rem] text-muted-foreground/70">
                          ⌘M
                        </kbd>
                      </DropdownMenuItem>
                    </button>
                  </motion.div>

                  <motion.div variants={itemDropdownVariants}>
                    <Link
                      className="w-full"
                      href={`/profiles/${user.username}`}>
                      <DropdownMenuItem className="cursor-pointer">
                        <UserCircle />
                        My Profile
                      </DropdownMenuItem>
                    </Link>
                  </motion.div>

                  <motion.div variants={itemDropdownVariants}>
                    <Link className="w-full" href={"/dashboard"}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Home />
                        Homepage
                      </DropdownMenuItem>
                    </Link>
                  </motion.div>

                  <motion.div variants={itemDropdownVariants}>
                    <Link className="w-full" href={"/projects"}>
                      <DropdownMenuItem className="cursor-pointer">
                        <Folders />
                        My projects
                      </DropdownMenuItem>
                    </Link>
                  </motion.div>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <motion.div variants={itemDropdownVariants}>
                  <AlertComponent
                    cancelButtonText="Cancel"
                    confirmButtonText="Log out"
                    onConfirm={handleLogout}
                    title="Are you sure you want to log out?"
                    description="This will log you out of all your devices.">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={(event) => {
                        event.preventDefault();
                      }}>
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </AlertComponent>
                </motion.div>
              </div>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
