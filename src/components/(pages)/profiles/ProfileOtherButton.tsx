"use client";
import {Ban, Bookmark, Ellipsis, Flag, Share2} from "lucide-react";
import {Button} from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {motion} from "framer-motion";
import {itemDropdownVariants, menuVariants} from "@/utils/other/variants";

export default function ProfileOtherButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} className="max-[620px]:order-2 h-[38px]">
          <Ellipsis size={18} strokeWidth={2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent asChild side="bottom" align="center" sideOffset={4}>
        <motion.div
          initial="closed"
          animate="open"
          variants={menuVariants}
          className="space-y-2 rounded-lg min-w-[160px]">
          <DropdownMenuGroup>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem className="cursor-pointer">
                <Bookmark size={16} className="opacity-60" aria-hidden="true" />
                Add to favorites
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem className="cursor-pointer">
                <Share2 size={16} className="opacity-60" aria-hidden="true" />
                Share Profile
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem className="cursor-pointer">
                <Flag size={16} className="opacity-60" aria-hidden="true" />
                Report User
              </DropdownMenuItem>
            </motion.div>
            <motion.div variants={itemDropdownVariants}>
              <DropdownMenuItem className="cursor-pointer">
                <Ban size={16} className="opacity-60" aria-hidden="true" />
                Block User
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuGroup>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
