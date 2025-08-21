import ImageUpload from "@/components/ui/form/ImageUpload";
import React from "react";

const DemoImageInput = () => {
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
    />
  );
};

export default DemoImageInput;
