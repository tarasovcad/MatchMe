"use client";
import React from "react";
import SidebarProvider from "@/providers/SidebarProvider";
import SimpleInput from "@/components/ui/SimpleInput";
import {Button} from "@/components/shadcn/button";
import {FormProvider, useForm, useFormContext} from "react-hook-form";
import {SkillsFormData, skillsValidation} from "../validation/skillsValidation";
import {zodResolver} from "@hookform/resolvers/zod";
import {setNewSkills} from "@/actions/aws/setNewSkills";
import {useState} from "react";
import {toast} from "sonner";
const SetSkills = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<SkillsFormData>({
    resolver: zodResolver(skillsValidation),
    mode: "onChange",
    defaultValues: {
      name: "",
      imageUrl:
        "https://matchme-skills-image-bucket.s3.us-east-1.amazonaws.com/",
    },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: SkillsFormData) => {
    setLoading(true);
    const response = await setNewSkills(data);
    const {error, message} = response;
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }

    toast.success(message);
    console.log("resopnse", message);
    reset({
      name: "",
      imageUrl:
        "https://matchme-skills-image-bucket.s3.us-east-1.amazonaws.com/",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="p-10">
        <div className="flex flex-col gap-4  pb-5">
          <SimpleInput
            placeholder="React"
            name="skillName"
            label="Skill Name"
            register={register("name")}
            error={errors.name}
          />
          <SimpleInput
            placeholder="https://matchme-skills-image-bucket.s3.us-east-1.amazonaws.com/react.svg"
            name="skillUrl"
            label="Skill Url"
            register={register("imageUrl")}
            error={errors.imageUrl}
          />
        </div>
        <Button
          className="w-full mt-5"
          variant={"default"}
          type="submit"
          isLoading={loading}>
          Add Skill
        </Button>
      </div>
    </form>
  );
};

export default SetSkills;
