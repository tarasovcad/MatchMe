"use client";

import React, {useEffect, useState} from "react";
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

type OpenPosition = {
  id: string;
  title: string;
  status: string;
  fullDescription: string;
  requirements: string;
  requiredSkills: string[];
  experienceLevel: string;
};

interface EditPositionDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  position: OpenPosition | null;
}

const EditPositionDrawer: React.FC<EditPositionDrawerProps> = ({
  isOpen,
  onOpenChange,
  position,
}) => {
  const [initialValues, setInitialValues] = useState<PositionFormData>({
    title: position?.title ?? "",
    fullDescription: position?.fullDescription ?? "",
    requirements: position?.requirements ?? "",
    requiredSkills: position?.requiredSkills ?? [],
    experienceLevel: position?.experienceLevel ?? "",
    status: (position?.status as "Open" | "Closed" | "Draft") ?? "Open",
  });

  const methods = useForm<PositionFormData>({
    resolver: zodResolver(positionValidationSchema),
    mode: "onChange",
    defaultValues: initialValues,
  });

  const formValues = useWatch({control: methods.control});
  const {formState} = methods;
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    // Check if form has changes
    const hasChanges = Object.keys(formValues).some((key) => {
      const formKey = key as keyof PositionFormData;
      return !isEqual(formValues[formKey], initialValues[formKey]);
    });

    // Enable save when there are changes and no validation errors
    setIsDisabled(!hasChanges || !formState.isValid);
  }, [formValues, initialValues, formState.isValid]);

  const onSubmit = async (data: PositionFormData) => {
    try {
      // Here you would normally send the data to your API
      console.log("Submitting position data:", data);

      // Update initial values to reflect the save
      setInitialValues(data);
      methods.reset(data);

      toast.success("Position updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating position:", error);
      toast.error("Failed to update position");
    }
  };

  const handleSave = () => {
    methods.handleSubmit(onSubmit)();
  };

  const handleCancel = () => {
    methods.reset(initialValues);
    onOpenChange(false);
  };

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
                  Edit Position
                </SheetTitle>
                <SheetDescription className="text-muted-foreground text-sm">
                  Edit the position details to update the position.
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
              className="transition-colors duration-300 ease-in-out"
              disabled={isDisabled}
              onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditPositionDrawer;
