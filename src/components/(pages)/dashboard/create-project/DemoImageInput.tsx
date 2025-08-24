import ImageUpload from "@/components/ui/form/ImageUpload";
import React from "react";

const DemoImageInput = ({readOnly = false}: {readOnly?: boolean}) => {
  return (
    <ImageUpload
      name="demo"
      allowedFileTypes={["image/jpeg", "image/png", "image/webp"]}
      type="demo"
      aspectRatio={94 / 50}
      circularCrop={false}
      initialCropWidth={90}
      cropInstructions="Adjust the grid to crop your demo image"
      maxUploads={5}
      readOnly={readOnly}
    />
  );
};

export default DemoImageInput;
