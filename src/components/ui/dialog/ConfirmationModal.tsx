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
import {toast} from "sonner";

interface ConfirmationModalProps {
  id: string;
  triggerText: string;
  title?: string;
  description?: string;
  confirmationValue: string;
  confirmationLabel?: string;
  onConfirm: () => Promise<{error?: string; message?: string}>;
  triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  triggerSize?: "default" | "sm" | "lg" | "icon" | "xs";
  confirmButtonText?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ConfirmationModal = ({
  id,
  triggerText,
  title = "Final confirmation",
  description = "This action cannot be undone.",
  confirmationValue,
  confirmationLabel,
  onConfirm,
  triggerVariant = "destructive",
  triggerSize = "xs",
  confirmButtonText = "Delete",
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ConfirmationModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const handleClear = () => {
    setInputValue("");
    setOpen(false);
  };

  const handleConfirm = async () => {
    setIsLoading(true);

    if (inputValue !== confirmationValue) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await onConfirm();
      setIsLoading(false);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.message) {
        toast.success(response.message);
      }

      handleClear();
    } catch (error) {
      setIsLoading(false);
      toast.error("An unexpected error occurred");
      console.error("Error in confirmation modal:", error);
    }
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
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        {children || (
          <Button
            size={triggerSize}
            variant={triggerVariant}
            className="flex items-center gap-2 rounded-[8px] cursor-pointer">
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex justify-center items-center border rounded-full size-9 shrink-0"
            aria-hidden="true">
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">{title}</DialogTitle>
            <DialogDescription className="sm:text-center">{description}</DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="*:not-first:mt-2">
            <p className="font-medium text-secondary text-sm">
              {confirmationLabel || "Type"}{" "}
              <span className="text-foreground select-none">{confirmationValue}</span> to confirm.
            </p>
            <Input
              id={id}
              type="text"
              placeholder={`Type ${confirmationValue} here`}
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
              disabled={inputValue !== confirmationValue}
              onClick={handleConfirm}
              isLoading={isLoading}>
              {confirmButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
