import {Button} from "@/components/shadcn/button";
import React, {useState} from "react";
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
import {Project} from "@/types/projects/projects";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {deleteProject} from "@/actions/projects/deleteProject";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";

const ProjectDangerZone = ({id, project}: {id: string; project: Project | undefined}) => {
  if (!project) return null;

  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const confirmString = project.slug;

  const handleConfirm = async () => {
    setIsLoading(true);
    if (inputValue !== confirmString) {
      setIsLoading(false);
      return;
    }

    const response = await deleteProject(project.id);
    setIsLoading(false);

    if (response.error) {
      console.error("Error deleting project:", response.error);
      toast.error(response.message);
      return;
    }

    toast.success(response.message);

    // Redirect user back to their dashboard projects list
    router.push("/dashboard?tab=projects");
  };

  const handleModalClose = (isOpen: boolean) => {
    if (isLoading) {
      return;
    }
    if (!isOpen) {
      setInputValue("");
      setOpen(false);
    }
    setOpen(isOpen);
  };

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                size={"xs"}
                disabled
                className="flex items-center gap-2 rounded-[8px] text-destructive hover:text-destructive/90 cursor-pointer">
                Delete Project
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6} side="top">
            <p>This feature is not available yet</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogTrigger asChild>
          <Button
            size={"xs"}
            className="flex items-center gap-2 rounded-[8px] text-destructive hover:text-destructive/90 cursor-pointer">
            Delete Project
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
              <DialogTitle className="sm:text-center">Final confirmation</DialogTitle>
              <DialogDescription className="sm:text-center">
                This action cannot be undone. Your project and all associated data will be
                permanently deleted.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form className="space-y-5">
            <div className="*:not-first:mt-2">
              <p className="font-medium text-secondary text-sm">
                Type <span className="text-foreground select-none">{confirmString}</span> to
                confirm.
              </p>
              <Input
                id={id}
                type="text"
                placeholder="Type the project slug in here"
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
                disabled={inputValue !== confirmString}
                onClick={handleConfirm}
                isLoading={isLoading}>
                Delete
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default ProjectDangerZone;
