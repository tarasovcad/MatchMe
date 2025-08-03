"use client";

import React, {useEffect, useState, useMemo} from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/shadcn/sheet";
import {Button} from "@/components/shadcn/button";
import {toast} from "sonner";
import {X} from "lucide-react";
import {FormProvider, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {motion} from "framer-motion";
import {isEqual} from "lodash";
import PositionFormField from "@/components/ui/positions/PositionFormField";
import {positionFormFields} from "@/data/forms/positions/positionFormFields";
import {
  positionValidationSchema,
  PositionFormData,
} from "@/validation/positions/positionValidation";
import {containerVariants, itemVariants} from "@/utils/other/variants";
import {cn} from "@/lib/utils";
import {createOpenPosition} from "@/actions/projects/createOpenPosition";
import LoadingButtonCircle from "@/components/ui/LoadingButtonCirlce";
import {ProjectOpenPosition} from "@/types/positionFieldsTypes";

interface PositionDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  position?: ProjectOpenPosition | null;
  mode?: "edit" | "create";
  projectId: string;
}

const PositionDrawer: React.FC<PositionDrawerProps> = ({
  isOpen,
  onOpenChange,
  position,
  mode = position ? "edit" : "create",
  projectId,
}) => {
  // Default values for create mode
  const defaultValues: PositionFormData = {
    title: "",
    description: "",
    requirements: "",
    required_skills: [],
    time_commitment: "",
    experience_level: "",
    status: "draft",
  };

  const currentValues: PositionFormData = useMemo(
    () => ({
      title: position?.title ?? defaultValues.title,
      description: position?.description ?? defaultValues.description,
      requirements: position?.requirements ?? defaultValues.requirements,
      required_skills: position?.required_skills ?? defaultValues.required_skills,
      time_commitment: position?.time_commitment ?? defaultValues.time_commitment,
      experience_level: position?.experience_level ?? defaultValues.experience_level,
      status: position?.status ?? defaultValues.status,
    }),
    [position],
  );

  const methods = useForm<PositionFormData>({
    resolver: zodResolver(positionValidationSchema),
    mode: "onChange",
    values: currentValues,
  });
  const [isLoading, setIsLoading] = useState(false);
  const formValues = useWatch({control: methods.control});
  const {formState} = methods;
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (mode === "create") {
      // For create mode, enable save when form is valid and has required fields
      const hasRequiredFields = formValues.title?.trim() && formState.isValid;
      console.log(formState.errors);
      setIsDisabled(!hasRequiredFields);
    } else {
      // For edit mode, check if form has changes
      const hasChanges = Object.keys(formValues).some((key) => {
        const formKey = key as keyof PositionFormData;
        return !isEqual(formValues[formKey], currentValues[formKey]);
      });

      // Enable save when there are changes and no validation errors
      setIsDisabled(!hasChanges || !formState.isValid);
    }
  }, [formValues, currentValues, formState.isValid, mode]);

  const onSubmit = async (data: PositionFormData) => {
    try {
      if (mode === "create") {
        const loadingToast = toast.loading("Creating position...");
        setIsLoading(true);
        const result = await createOpenPosition(projectId, data);
        if (result.success) {
          toast.success("Position created successfully", {
            id: loadingToast,
          });
        } else {
          toast.error(result.error, {
            id: loadingToast,
          });
        }
        methods.reset(currentValues);
        onOpenChange(false);
      } else {
        setIsLoading(true);
        console.log("Updating position:", data);
        toast.success("Position updated successfully");
      }
      onOpenChange(false);
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} position:`, error);
      toast.error(`Failed to ${mode === "create" ? "create" : "update"} position`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    methods.handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    methods.reset(currentValues);
    onOpenChange(false);
  };

  const headerText = mode === "create" ? "Create Position" : "Edit Position";
  const descriptionText =
    mode === "create"
      ? "Fill in the details to create a new position."
      : "Edit the position details to update the position.";
  const saveButtonText = mode === "create" ? "Create Position" : "Save Changes";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="max-w-[620px] sm:max-w-[620px] w-full flex flex-col border-l border-border p-0 gap-0 data-[state=open]:duration-200 data-[state=closed]:duration-200"
        disableClose={false}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <SheetHeader className="px-4.5 py-4 space-y-0">
            <div className="flex flex-row justify-between items-center gap-2">
              <div className="flex flex-col">
                <SheetTitle className="text-lg font-medium text-foreground ">
                  {headerText}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-sm">
                  {descriptionText}
                </SheetDescription>
              </div>
              <Button size={"icon"} className="w-6 h-6" onClick={handleCancel}>
                <X size={12} />
              </Button>
            </div>
          </SheetHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4.5 py-4">
          <FormProvider {...methods}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-6">
              {positionFormFields.map((formFields, index) => (
                <motion.div
                  key={formFields.formTitle}
                  variants={itemVariants}
                  className={cn(
                    "flex flex-col gap-6",
                    index !== 0 && "border-t border-border pt-6",
                  )}>
                  <motion.div variants={containerVariants} className="flex flex-col gap-6">
                    {formFields.formData.map((formField) => (
                      <motion.div key={formField.fieldTitle} variants={itemVariants}>
                        <PositionFormField formField={formField} />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </FormProvider>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-background border-t border-border px-4.5 py-4">
          <div className="flex justify-between items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              className="dark:bg-sidebar-background"
              onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="xs"
              className="transition-colors duration-300 ease-in-out max-w-[126px] w-full"
              disabled={isDisabled || isLoading}
              onClick={handleSave}>
              {isLoading ? <LoadingButtonCircle size={16} /> : saveButtonText}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PositionDrawer;
