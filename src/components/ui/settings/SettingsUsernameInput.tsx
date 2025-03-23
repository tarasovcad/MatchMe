import React from "react";
import SimpleInput from "../SimpleInput";
import {useFormContext, UseFormRegisterReturn} from "react-hook-form";
import {Button} from "@/components/shadcn/button";
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
import {CircleAlertIcon} from "lucide-react";
import {useState} from "react";
import UserNameInput from "../(auth)/UserNameInput";

const SettingsUsernameInput = ({
  id,
  name,
  placeholder,
  register,
}: {
  id: string;
  name: string;
  placeholder: string;
  register?: UseFormRegisterReturn<string>;
}) => {
  const [open, setOpen] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);

  const {watch, setValue, formState} = useFormContext();
  const newUsername = watch("newUsername");
  const username = watch("username");

  const handleClear = () => {
    setOpen(false);
    setValue("newUsername", "");
  };

  const handleConfirm = () => {
    setValue("username", newUsername);
    setValue("newUsername", "");
    setOpen(false);
  };

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      handleClear();
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <div className="">
          <SimpleInput
            id={id}
            name={name}
            placeholder={placeholder}
            className="!cursor-pointer"
            {...register}
            onMouseDown={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
            onFocus={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
          />
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-2">
          <div
            className="flex justify-center items-center border rounded-full size-11 shrink-0"
            aria-hidden="true">
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">
              Change Your Username
            </DialogTitle>
            <DialogDescription className="text-left">
              You can update your username only once per month. Choose wisely!
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="*:not-first:mt-2">
            <p className="font-medium text-foreground text-sm">
              Current Username
            </p>
            <SimpleInput
              id={id}
              name={name}
              placeholder={placeholder}
              readOnly
              {...register}
            />
          </div>
          <div className="*:not-first:mt-2">
            <p className="font-medium text-foreground text-sm">New Username</p>
            <UserNameInput
              username={newUsername}
              name="newUsername"
              onAvailabilityChange={setIsUsernameAvailable}
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClear}
                size={"xs"}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="flex-1"
              size={"xs"}
              variant={"secondary"}
              disabled={
                username === newUsername ||
                newUsername === "" ||
                !formState.isValid ||
                isUsernameAvailable !== true
              }
              onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsUsernameInput;
