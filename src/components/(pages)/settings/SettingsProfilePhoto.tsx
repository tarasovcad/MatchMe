import ImageUpload from "@/components/ui/input/ImageUpload";
import React from "react";

const SettingsProfilePhoto = ({name}: {name: string}) => {
  return (
    <>
      <ImageUpload name={name} type="avatar" />
    </>
  );
};

export default SettingsProfilePhoto;
