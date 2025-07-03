import ImageUpload from "@/components/ui/form/ImageUpload";
import React from "react";

const DemoImageInput = () => {
  return (
    <div>
      {/* <ImageUpload
        name="demo"
        type="background"
        maxUploads={5}
        aspectRatio={1184 / 156}
        circularCrop={true}
        initialCropWidth={100}
        cropInstructions="Adjust the grid to crop your demo image"
      /> */}
      <ImageUpload
        name="dsfsdf"
        type="background"
        aspectRatio={1184 / 156}
        circularCrop={true}
        initialCropWidth={100}
        cropInstructions="Adjust the grid to crop your demo image"
        maxUploads={5}
      />
    </div>
  );
};

export default DemoImageInput;
