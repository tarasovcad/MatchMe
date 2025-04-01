import {Button} from "@/components/shadcn/button";
import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import {Input} from "@/components/shadcn/input";

import {CircleAlertIcon} from "lucide-react";
import {useState} from "react";
import {User} from "@supabase/supabase-js";
import {deleteUserAccount} from "@/actions/(auth)/deleteUserAccount";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

const DangerZone = ({id, user}: {id: string; user: User}) => {
  const username = user?.user_metadata?.username;
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleClear = () => {
    setInputValue("");
    setOpen(false);
  };
  const router = useRouter();

  const handleConfirm = async () => {
    setIsLoading(true);
    if (inputValue !== username) {
      setIsLoading(false);
      return;
    }
    const response = await deleteUserAccount(user);
    setIsLoading(false);
    if (response.error) {
      console.error("Error deleting user account:", response.error);
      return;
    }
    toast.success(response.message);

    router.push("/");
  };

  const handleModalClose = (isOpen: boolean) => {
    if (isLoading) {
      return;
    }
    if (!isOpen) {
      handleClear();
    }
    setOpen(isOpen);
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogTrigger asChild>
          <Button
            size={"sm"}
            className="flex items-center gap-2 rounded-[8px] text-destructive hover:text-destructive/90 cursor-pointer">
            Delete Account
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex justify-center items-center border rounded-full size-9 shrink-0"
              aria-hidden="true">
              <CircleAlertIcon className="opacity-80" size={16} />
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">
                Final confirmation
              </DialogTitle>
              <DialogDescription className="sm:text-center">
                This action cannot be undone. Your account and all associated
                data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form className="space-y-5">
            <div className="*:not-first:mt-2">
              <p className="font-medium text-secondary text-sm">
                Type{" "}
                <span className="text-foreground select-none">{username}</span>{" "}
                to confirm.
              </p>
              <Input
                id={id}
                type="text"
                placeholder="Type the username in here"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  size={"xs"}
                  disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                className="flex-1"
                size={"xs"}
                variant={"destructive"}
                disabled={inputValue !== username}
                onClick={handleConfirm}
                isLoading={isLoading}>
                Delete
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DangerZone;
