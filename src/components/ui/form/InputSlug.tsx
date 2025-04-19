"use client";
import React, {useState} from "react";
import SimpleInput from "./SimpleInput";
import {Button} from "@/components/shadcn/button";

const useSlugGenerator = (slugvalue: string) => {
  const [slug, setSlug] = useState("");

  const generateSlug = () => {
    if (!slugvalue) return "";

    // Convert to lowercase, replace spaces with hyphens, remove special characters
    const newSlug = slugvalue
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");

    setSlug(newSlug);
    return newSlug;
  };

  return {slug, setSlug, generateSlug};
};

const InputSlug = ({
  placeholder,
  name,
  slugvalue = "",
}: {
  placeholder: string;
  name: string;
  slugvalue: string;
}) => {
  const {slug, setSlug, generateSlug} = useSlugGenerator(slugvalue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
  };
  return (
    <div className="flex items-center gap-2">
      <SimpleInput
        placeholder={placeholder}
        name={name}
        type="text"
        id="slug"
        value={slug}
        onChange={handleInputChange}
      />
      <Button size={"xs"} onClick={generateSlug}>
        Generate
      </Button>
    </div>
  );
};

export default InputSlug;
