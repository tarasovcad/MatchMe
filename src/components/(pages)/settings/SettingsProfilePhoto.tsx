import {Avatar, AvatarFallback} from "../../shadcn/avatar";
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/heif",
  "image/heic",
];
const ALLOWED_FILE_EXTENSIONS = [
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".heif",
  ".heic",
];
const MAX_NAME_LENGTH = 50;

const SettingsProfilePhoto = ({name}: {name: string}) => {
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

  const handleFiles = useCallback(
    (files: FileList) => {
      const selectedFile = files[0];
      const fileType = selectedFile.type;
      const fileExtension =
        "." + selectedFile.name.split(".").pop()?.toLowerCase();

      const numberOfSymbols = selectedFile.name.split(".")[0].length;

      if (
        !ALLOWED_FILE_TYPES.includes(fileType) &&
        !ALLOWED_FILE_EXTENSIONS.includes(fileExtension)
      ) {
        toast.error("You cannot upload this file. File type is not supported");
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("You cannot upload this file. File size exceeds 5MB limit");
        return;
      }
      if (numberOfSymbols > MAX_NAME_LENGTH) {
        toast.error(
          "You cannot upload this file. File name exceeds 50 characters",
        );
        return;
      }
      setIsOpen(true);

      setFile(selectedFile);
    },
    [setFile],
  );

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

  // Function to center and initialize crop properly
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const {width, height} = e.currentTarget;
      const cropInit = centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 90,
          },
          1, // 1:1 aspect ratio
          width,
          height,
        ),
        width,
        height,
      );
      setCrop(cropInit);
    },
    [],
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
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height,
      );
    }

    return canvas.toDataURL("image/jpeg", 1.0);
  }

  const handleDeleteFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setValue(name, "", {shouldDirty: true});
  };

  return (
    <>
      <div className="flex items-start gap-6 max-[1015px]:gap-3 max-[990px]:gap-6 w-full">
        <div className="relative">
          <Avatar className="border border-border rounded-full w-[85px] max-[1015px]:w-[80px] h-[85px] max-[1015px]:h-[80px]">
            {previewUrl || selectedValue ? (
              <Image
                src={previewUrl || selectedValue}
                alt={"avatar"}
                width={100}
                height={100}
                unoptimized
                className="rounded-full"
              />
            ) : (
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            )}
          </Avatar>
          {(previewUrl || selectedValue) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="-right-1 -bottom-1 z-[3] absolute bg-background !opacity-100 rounded-full size-8"
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
            isDragging
              ? "border border-dashed bg-[#f4f4f5] dark:bg-muted"
              : "border-border ",
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
            accept=".jpeg,.png,.svg,.heif,.jpg"
          />
          <div className="flex justify-center items-center bg-muted-foreground/10 p-[6px] rounded-full">
            <CloudAdd
              size="24"
              color="hsl(var(--foreground))"
              className="opacity-80"
            />
          </div>
          <div className="flex flex-col gap-[4px]">
            <p className="font-medium">
              <button
                className="text-primary cursor-pointer"
                onClick={handleBrowseFiles}>
                Click to upload
              </button>{" "}
              <span className="text-foreground/80">or drag and drop</span>
            </p>
            <p className="text-[12px] text-secondary">
              SVG, PNG and JPG formats, up to 10MB
            </p>
          </div>
        </div>
      </div>
      {file && (
        <Dialog open={isOpen}>
          <DialogContent
            className="w-full !max-w-[550px]"
            onClose={handleClose}>
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>Crop photo</DialogTitle>
                <DialogDescription>
                  Adjust the size of the grid to crop your image.
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <div className="relative flex justify-center items-center w-full max-h-[250px] overflow-hidden checkerboard-bg">
                {file && imageSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    circularCrop
                    aspect={1}>
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
                <Button
                  type="button"
                  variant="outline"
                  size={"xs"}
                  onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size={"xs"}
                  onClick={handleApply}>
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
