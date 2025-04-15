import {CloudAdd} from "iconsax-react";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {useFormContext} from "react-hook-form";
import {Tooltip, TooltipContent, TooltipTrigger} from "../../shadcn/tooltip";
import {Button} from "../../shadcn/button";
import {TrashIcon} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shadcn/dialog";
import Image from "next/image";
import {Separator} from "../../shadcn/separator";
import ReactCrop, {Crop, centerCrop, makeAspectCrop} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {getNameInitials} from "@/functions/getNameInitials";
import Avatar from "boring-avatars";

const FILE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "image/svg+xml", "image/heif", "image/heic"],
  ALLOWED_FILE_EXTENSIONS: [".jpeg", ".jpg", ".png", ".svg", ".heif", ".heic"],
  MAX_NAME_LENGTH: 50,
};

export interface ImageUploadProps {
  name: string; // Form field name
  type?: "avatar" | "background" | "project"; // Type of image
  aspectRatio?: number; // Crop aspect ratio (default: 1 for square)
  containerClassName?: string; // Additional container classes
  maxWidth?: number; // Maximum width for the preview image
  maxHeight?: number; // Maximum height for the preview image
  circularCrop?: boolean; // Whether to use circular crop (default: true for avatar)
  initialCropWidth?: number; // Initial crop width in percent (default: 90%)
  cropInstructions?: string; // Custom instructions for crop dialog
}

const SettingsProfilePhoto = ({
  name,
  type = "avatar",
  aspectRatio = 1,
  containerClassName,
  maxWidth = type === "avatar" ? 85 : 320,
  maxHeight = type === "avatar" ? 85 : 180,
  circularCrop = type === "avatar",
  initialCropWidth = 90,
  cropInstructions = "Adjust the size of the grid to crop your image.",
}: ImageUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [imageSrc, setImageSrc] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);

  const {setValue, watch} = useFormContext();
  const selectedValue = watch(name);
  const userName = watch("name");

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (selectedFile: File): {valid: boolean; error?: string} => {
    const fileType = selectedFile.type;
    const fileExtension = "." + selectedFile.name.split(".").pop()?.toLowerCase();
    const numberOfSymbols = selectedFile.name.split(".")[0].length;

    if (
      !FILE_CONFIG.ALLOWED_FILE_TYPES.includes(fileType) &&
      !FILE_CONFIG.ALLOWED_FILE_EXTENSIONS.includes(fileExtension)
    ) {
      return {valid: false, error: "You cannot upload this file. File type is not supported"};
    }

    if (selectedFile.size > FILE_CONFIG.MAX_FILE_SIZE) {
      return {valid: false, error: "You cannot upload this file. File size exceeds 5MB limit"};
    }

    if (numberOfSymbols > FILE_CONFIG.MAX_NAME_LENGTH) {
      return {valid: false, error: "You cannot upload this file. File name exceeds 50 characters"};
    }

    return {valid: true};
  };

  const handleFiles = useCallback((files: FileList) => {
    const selectedFile = files[0];
    const validation = validateFile(selectedFile);

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsOpen(true);
    setFile(selectedFile);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [handleFiles],
  );

  const handleBrowseFiles = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      handleFiles(files);
    }
  };

  // Clean up the object URL when component unmounts or when file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleClose = () => setIsOpen(false);

  // Create the object URL only once when the file changes
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageSrc(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [file]);

  // Center and initialize crop properly
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const {width, height} = e.currentTarget;
      const cropInit = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: initialCropWidth,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(cropInit);
    },
    [aspectRatio, initialCropWidth],
  );

  const handleApply = async () => {
    if (imgRef.current && completedCrop?.width && completedCrop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, completedCrop);
      setPreviewUrl(croppedImageUrl);
      setValue(name, croppedImageUrl, {shouldDirty: true});
      setIsOpen(false);
    }
  };

  function getCroppedImg(image: HTMLImageElement, crop: Crop): string {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set the canvas to the desired output size (1184 × 156 for background)
    canvas.width = type === "background" ? 1184 : crop.width;
    canvas.height = type === "background" ? 156 : crop.height;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      const aspectRatio = crop.width / crop.height;
      const targetAspectRatio = canvas.width / canvas.height;

      let drawWidth,
        drawHeight,
        offsetX = 0,
        offsetY = 0;

      if (aspectRatio > targetAspectRatio) {
        // Crop is wider than target, scale to match height
        drawHeight = canvas.height;
        drawWidth = crop.width * scaleX * (drawHeight / (crop.height * scaleY));
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        // Crop is taller than target, scale to match width
        drawWidth = canvas.width;
        drawHeight = crop.height * scaleY * (drawWidth / (crop.width * scaleX));
        offsetY = (canvas.height - drawHeight) / 2;
      }

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight,
      );
    }

    return canvas.toDataURL("image/jpeg", 1);
  }

  const handleDeleteFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setValue(name, "", {shouldDirty: true});
  };

  const renderPreview = () => {
    if ((previewUrl || selectedValue) && type === "avatar") {
      // Avatar with image
      return (
        <div className="ring-border rounded-full ring w-[85px] max-[1015px]:w-[80px] h-[85px] max-[1015px]:h-[80px]">
          <Image
            src={previewUrl || selectedValue}
            alt={"avatar"}
            fill
            unoptimized
            className="rounded-full"
          />
        </div>
      );
    } else if ((previewUrl || selectedValue) && type === "background") {
      // Background with image
      return (
        <>
          <div className="ring-border rounded-[4px] ring w-[181px] h-[85px] max-[1015px]:h-[80px]">
            <Image
              src={previewUrl || selectedValue}
              alt={"background"}
              fill
              unoptimized
              className="rounded-[4px] object-cover"
            />
          </div>
        </>
      );
    } else if (type === "avatar") {
      // Avatar fallback when no image
      return (
        <div className="ring-border rounded-full ring w-[85px] max-[1015px]:w-[80px] h-[85px] max-[1015px]:h-[80px]">
          <Avatar name={getNameInitials(userName)} size="100%" variant="beam" />
        </div>
      );
    } else {
      // Background fallback when no image
      return (
        <div className="bg-gray-200 ring-border rounded-[6px] ring w-[181px] h-[85px] max-[1015px]:h-[80px]"></div>
      );
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex items-start gap-6 max-[1015px]:gap-3 max-[990px]:gap-6 w-full",
          containerClassName,
        )}>
        <div className="relative">
          {renderPreview()}

          {(previewUrl || selectedValue) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="-right-2 -bottom-2 z-[3] absolute bg-background !opacity-100 rounded-full size-8"
                  onClick={handleDeleteFile}>
                  <TrashIcon className="size-4 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Remove image</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div
          className={cn(
            "flex flex-col justify-center items-center gap-[6px]  py-6 border border-border rounded-[8px] w-full max-w-[329px] text-center",
            isDragging ? "border border-dashed bg-[#f4f4f5] dark:bg-muted" : "border-border ",
          )}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={FILE_CONFIG.ALLOWED_FILE_EXTENSIONS.join(",")}
          />
          <div className="flex justify-center items-center bg-muted-foreground/10 p-[6px] rounded-full">
            <CloudAdd size="24" color="hsl(var(--foreground))" className="opacity-80" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <p className="font-medium">
              <button className="text-primary cursor-pointer" onClick={handleBrowseFiles}>
                Click to upload
              </button>{" "}
              <span className="text-foreground/80">or drag and drop</span>
            </p>
            <p className="text-[12px] text-secondary">SVG, PNG and JPG formats, up to 5MB</p>
          </div>
        </div>
      </div>
      {file && (
        <Dialog open={isOpen}>
          <DialogContent className="w-full !max-w-[550px]" onClose={handleClose}>
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Crop {type} image</DialogTitle>
                <DialogDescription>{cropInstructions}</DialogDescription>
              </DialogHeader>
              <Separator />
              <div className="relative flex justify-center items-center w-full max-h-[250px] overflow-hidden checkerboard-bg">
                {file && imageSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    circularCrop={circularCrop}
                    aspect={aspectRatio}>
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      onLoad={onImageLoad}
                      style={{
                        maxHeight: "250px",
                        width: "auto",
                        margin: "0 auto",
                      }}
                      alt="Crop preview"
                    />
                  </ReactCrop>
                )}
              </div>

              <DialogFooter className="flex sm:flex-row flex-col space-y-2 sm:space-y-0">
                <Button type="button" variant="outline" size={"xs"} onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="button" variant="secondary" size={"xs"} onClick={handleApply}>
                  Apply
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SettingsProfilePhoto;
