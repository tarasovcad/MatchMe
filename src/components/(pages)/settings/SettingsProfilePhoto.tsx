import ImageUpload from "@/components/ui/input/ImageUpload";
import React from "react";

const SettingsProfilePhoto = ({name}: {name: string}) => {
  if (name === "profileImage") {
    return <ImageUpload name={name} type="avatar" />;
  } else if (name === "backgroundImage") {
    return (
      <ImageUpload
        name={name}
        type="background"
        aspectRatio={1184 / 156}
        maxWidth={1184}
        maxHeight={156}
        circularCrop={false}
        initialCropWidth={100}
        cropInstructions="Adjust the grid to crop your background image. "
      />
    );
  }
};

export default SettingsProfilePhoto;
