import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn/alert-dialog";
import {cn} from "@/lib/utils";
import {CircleAlertIcon} from "lucide-react";

export default function AlertComponent({
  children,
  showAlertIcon = false,
  title,
  description,
  cancelButtonText = "Cancel",
  confirmButtonText = "Confirm",
  onConfirm,
}: {
  children: React.ReactNode;
  showAlertIcon?: boolean;
  title: string;
  description: string;
  cancelButtonText: string;
  confirmButtonText: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <div
          className={cn(
            showAlertIcon
              ? "flex sm:flex-row flex-col max-sm:items-center gap-2 sm:gap-4"
              : "",
          )}>
          {showAlertIcon && (
            <div
              className="flex justify-center items-center border rounded-full size-9 shrink-0"
              aria-hidden="true">
              <CircleAlertIcon className="opacity-80" size={16} />
            </div>
          )}
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelButtonText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
