"use client";
import React from "react";
import SimpleInput from "../form/SimpleInput";
import {PositionFormFieldProps} from "@/types/positionFieldsTypes";
import NumberFieldInput from "../form/NumberFieldInput";
import SelectInput from "../form/SelectInput";
import AutogrowingTextarea from "../form/AutogrowingTextarea";
import SimpleSlider from "../form/SimpleSlider";
import {useFormContext} from "react-hook-form";
import {cn} from "@/lib/utils";
import TagsInput from "../form/TagsInput";
import {motion} from "framer-motion";
import SelectInputWithSearch from "../form/SelectInputWithSearch";
import FormSwitch from "../form/FormSwitch";

const fieldComponents = {
  text: SimpleInput,
  number: NumberFieldInput,
  dropdown: SelectInput,
  select: SelectInput,
  selectWithSearch: SelectInputWithSearch,
  textarea: AutogrowingTextarea,
  tags: TagsInput,
  slider: SimpleSlider,
  switch: FormSwitch,
  date: SimpleInput,
};

const PositionFormField = ({formField}: {formField: PositionFormFieldProps}) => {
  const {fieldDescription, fieldTitle, fieldType, fieldInputProps, fieldRequired} = formField;
  const fieldName = fieldInputProps[0].name;
  const InputComponent = fieldComponents[fieldType as keyof typeof fieldComponents] || SimpleInput;

  const {
    register,
    formState: {errors},
  } = useFormContext();

  const itemVariants = {
    hidden: {y: 20, opacity: 0},
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 12,
      },
    },
  } as const;

  return (
    <motion.div
      variants={itemVariants}
      className={cn("flex justify-between items-start gap-2 flex-col")}>
      <div className="flex flex-col gap-[1px] w-full max-w-[285px]">
        <p className="font-medium text-foreground text-sm">
          {fieldTitle} {fieldRequired && <span className="text-destructive">*</span>}
        </p>
        {fieldDescription && (
          <p className="text-muted-foreground text-xs break-words">{fieldDescription}</p>
        )}
      </div>
      <div className="w-full min-[990px]:max-w-[652px]">
        <InputComponent
          id={fieldInputProps[0].id}
          placeholder={fieldInputProps[0].placeholder ?? ""}
          type={fieldType === "date" ? "date" : fieldInputProps[0].type}
          disabled={fieldInputProps[0].disabled}
          name={fieldInputProps[0].name}
          readOnly={fieldInputProps[0].readOnly}
          options={fieldInputProps[0].options ?? []}
          register={register(fieldName)}
          error={errors[fieldName]}
          min={fieldInputProps[0].min}
          max={fieldInputProps[0].max}
          className={`${fieldInputProps[0].disabled && "bg-muted shadow-none text-foreground!"}`}
        />
      </div>
    </motion.div>
  );
};

export default PositionFormField;
