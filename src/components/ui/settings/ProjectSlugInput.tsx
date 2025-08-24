import React from "react";
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
import SlugInput from "../form/SlugInput";
import SimpleInput from "../form/SimpleInput";
import {useFormContext, UseFormRegisterReturn} from "react-hook-form";
import {Project} from "@/types/projects/projects";
import {canChangeSlug} from "@/functions/canChangeSlug";

interface ProjectSlugInputProps {
  id: string;
  name: string;
  placeholder: string;
  register?: UseFormRegisterReturn<string>;
  project?: Project;
  readOnly?: boolean;
  [key: string]: unknown;
}

const ProjectSlugInput = (props: ProjectSlugInputProps) => {
  const {id, name, placeholder, register, project, readOnly = false, ...rest} = props;

  const [open, setOpen] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const {watch, setValue, formState} = useFormContext();
  const newSlug = watch("newSlug");
  const slug = watch("slug");

  const handleClear = () => {
    setOpen(false);
    setValue("newSlug", "");
    setIsSlugAvailable(null);
  };

  const handleConfirm = () => {
    setValue("slug", newSlug);
    setValue("newSlug", "");
    setOpen(false);
  };

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      handleClear();
    }
    setOpen(isOpen);
  };

  const slugChangeStatus = project?.slug_changed_at
    ? canChangeSlug(new Date(project.slug_changed_at))
    : {canChange: true, nextAvailableDate: null};

  if (readOnly) {
    return <SimpleInput id={id} name={name} placeholder={placeholder} readOnly {...register} />;
  }

  if (!slugChangeStatus.canChange) {
    return (
      <>
        <SimpleInput id={id} name={name} placeholder={placeholder} readOnly {...register} />
        <p className="mt-2 text-muted-foreground text-xs" role="region" aria-live="polite">
          Your next slug change is available on {slugChangeStatus.nextAvailableDate}
        </p>
      </>
    );
  } else {
    return (
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogTrigger asChild>
          <div>
            <SimpleInput
              id={id}
              name={name}
              placeholder={placeholder}
              className="!cursor-pointer"
              {...register}
              {...rest}
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
              <DialogTitle className="text-left">Change Project Slug</DialogTitle>
              <DialogDescription className="text-left">
                You can update the slug only once per month. Choose wisely!
              </DialogDescription>
            </DialogHeader>
          </div>

          <form className="space-y-5">
            <div className="*:not-first:mt-2">
              <p className="font-medium text-foreground text-sm">Current Slug</p>
              <SimpleInput id={id} name={name} placeholder={placeholder} readOnly {...register} />
            </div>
            <div className="*:not-first:mt-2">
              <p className="font-medium text-foreground text-sm">New Slug</p>
              <SlugInput name="newSlug" onAvailabilityChange={setIsSlugAvailable} autoFocus />
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
                  slug === newSlug ||
                  newSlug === "" ||
                  !formState.isValid ||
                  isSlugAvailable !== true
                }
                onClick={handleConfirm}>
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
};

export default ProjectSlugInput;
