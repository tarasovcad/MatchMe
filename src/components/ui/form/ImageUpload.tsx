import React, {useCallback, useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {useFormContext} from "react-hook-form";
import {Button} from "../../shadcn/button";
import {ImageIcon, XIcon} from "lucide-react";
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
import {formatFileSize} from "@/functions/formatFileSize";

const FILE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/avif"], // Added AVIF support
  MAX_NAME_LENGTH: 50,
  // Security: Common malicious extensions to block
  BLOCKED_EXTENSIONS: [".php", ".exe", ".js", ".html", ".svg", ".bat", ".cmd", ".scr"],
};

interface ImageData {
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ImageUploadProps {
  name: string; // Form field name
  type?: "avatar" | "background" | "demo" | "project";
  aspectRatio?: number; // Crop aspect ratio (default: 1 for square)
  containerClassName?: string; // Additional container classes
  circularCrop?: boolean; // Whether to use circular crop (default: true for avatar)
  initialCropWidth?: number; // Initial crop width in percent (default: 90%)
  cropInstructions?: string; // Custom instructions for crop dialog
  maxUploads?: number; // Maximum number of uploads (default: 1, max: 5)
  allowedFileTypes?: string[]; // Allowed file types
}

const getReadableFormatNames = (mimeTypes: string[]): string => {
  const formatMap: Record<string, string> = {
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "image/svg+xml": "SVG",
    "image/webp": "WEBP",
    "image/avif": "AVIF",
  };

  const formats = mimeTypes.map(
    (type) => formatMap[type] || type.replace("image/", "").toUpperCase(),
  );

  if (formats.length <= 2) {
    return formats.join(" and ");
  } else {
    return formats.slice(0, -1).join(", ") + " and " + formats[formats.length - 1];
  }
};

// Helper function to convert MIME types to file extensions for the accept attribute
const getFileExtensionsFromMimeTypes = (mimeTypes: string[]): string => {
  const mimeToExtensionMap: Record<string, string[]> = {
    "image/jpeg": [".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp"],
    "image/png": [".png"],
    "image/svg+xml": [".svg"],
    "image/webp": [".webp"],
    "image/avif": [".avif"],
  };

  const extensions: string[] = [];
  mimeTypes.forEach((mimeType) => {
    const exts = mimeToExtensionMap[mimeType];
    if (exts) {
      extensions.push(...exts);
    }
  });

  return extensions.join(",");
};

// Helper function to get file extensions array from MIME types for validation
const getExtensionsArrayFromMimeTypes = (mimeTypes: string[]): string[] => {
  const mimeToExtensionMap: Record<string, string[]> = {
    "image/jpeg": [".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp"],
    "image/png": [".png"],
    "image/svg+xml": [".svg"],
    "image/webp": [".webp"],
    "image/avif": [".avif"],
  };

  const extensions: string[] = [];
  mimeTypes.forEach((mimeType) => {
    const exts = mimeToExtensionMap[mimeType];
    if (exts) {
      extensions.push(...exts);
    }
  });

  return extensions;
};

const ImageUpload = ({
  name,
  type = "avatar",
  aspectRatio = 1,
  containerClassName,
  circularCrop = type === "avatar",
  initialCropWidth = 90,
  cropInstructions = "Adjust the size of the grid to crop your image.",
  allowedFileTypes = FILE_CONFIG.ALLOWED_FILE_TYPES,
  maxUploads = 1,
}: ImageUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [imageSrc, setImageSrc] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);

  const {setValue, watch} = useFormContext();
  const selectedValues = watch(name) as ImageData[] | undefined;

  // Ensure maxUploads is between 1 and 5
  const validMaxUploads = Math.min(Math.max(maxUploads, 1), 5);

  useEffect(() => {
    if (!selectedValues || selectedValues.length === 0) {
      setFile(null);
      setFileName(null);
      setFileSize(null);
      setImageSrc("");
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, [selectedValues]);

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
    const fileName = selectedFile.name.toLowerCase();
    const fileExtension = "." + fileName.split(".").pop();
    const numberOfSymbols = selectedFile.name.split(".")[0].length;

    // Security: Check for double extensions (e.g., image.jpg.php)
    const extensionCount = (fileName.match(/\./g) || []).length;
    if (extensionCount > 1) {
      return {valid: false, error: "Multiple file extensions are not allowed for security reasons"};
    }

    // Security: Block dangerous extensions
    if (FILE_CONFIG.BLOCKED_EXTENSIONS.some((ext) => fileName.includes(ext))) {
      return {valid: false, error: "File type not allowed for security reasons"};
    }

    // Security: Validate MIME type against actual file content
    const allowedExtensions = getExtensionsArrayFromMimeTypes(allowedFileTypes);
    if (!allowedFileTypes.includes(fileType) && !allowedExtensions.includes(fileExtension)) {
      return {valid: false, error: "You cannot upload this file. File type is not supported"};
    }

    // Security: Check file size
    if (selectedFile.size > FILE_CONFIG.MAX_FILE_SIZE) {
      return {valid: false, error: "You cannot upload this file. File size exceeds 5MB limit"};
    }

    // Security: Check filename length
    if (numberOfSymbols > FILE_CONFIG.MAX_NAME_LENGTH) {
      return {valid: false, error: "You cannot upload this file. File name exceeds 50 characters"};
    }

    // Security: Check for null bytes and path traversal
    if (fileName.includes("\0") || fileName.includes("../") || fileName.includes("..\\")) {
      return {valid: false, error: "Invalid file name for security reasons"};
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
    setFileName(selectedFile.name);
    setFileSize(selectedFile.size);
  }, []);

  const handleDeleteFile = (index: number) => {
    const currentImages = selectedValues || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setValue(name, updatedImages, {shouldDirty: true});
  };

  const handleDeleteAllFiles = () => {
    setValue(name, [], {shouldDirty: true});
  };

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
    // Clear the input value to allow re-uploading the same file
    e.target.value = "";
  };

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

      const newImageData: ImageData = {
        url: croppedImageUrl,
        fileName: fileName || "",
        fileSize: fileSize || 0,
        uploadedAt: new Date().toISOString(),
      };

      const currentImages = selectedValues || [];
      let updatedImages: ImageData[];

      // Check if a file with the same name already exists
      const existingImageIndex = currentImages.findIndex(
        (img) => img.fileName === newImageData.fileName,
      );

      if (existingImageIndex !== -1) {
        // Replace the existing image with the same filename
        updatedImages = [...currentImages];
        updatedImages[existingImageIndex] = newImageData;
      } else if (currentImages.length >= validMaxUploads) {
        // Replace the last image if we've reached the max and no duplicate found
        updatedImages = [...currentImages.slice(0, -1), newImageData];
      } else {
        // Add the new image
        updatedImages = [...currentImages, newImageData];
      }

      setValue(name, updatedImages, {shouldDirty: true});
      setIsOpen(false);
    }
  };

  function getCroppedImg(image: HTMLImageElement, crop: Crop): string {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set the canvas to the desired output size
    if (type === "background") {
      canvas.width = 1184;
      canvas.height = 156;
    } else if (type === "demo") {
      canvas.width = 94;
      canvas.height = 50;
    } else if (type === "project") {
      canvas.width = 64;
      canvas.height = 64;
    } else {
      canvas.width = crop.width;
      canvas.height = crop.height;
    }

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

    return canvas.toDataURL("image/webp", 1);
  }

  const renderPreview = (imageData: ImageData, index: number) => {
    if (type === "avatar") {
      // Avatar with image
      return (
        <div key={index} className="ring-border rounded-full ring size-10 shrink-0">
          <Image
            src={imageData.url}
            alt={`avatar ${index + 1}`}
            width={40}
            height={40}
            quality={100}
            unoptimized
            className="rounded-full"
          />
        </div>
      );
    } else if (type === "project") {
      return (
        <div key={index} className="ring-border rounded-lg ring size-10 shrink-0">
          <Image
            src={imageData.url}
            alt={`project avatar ${index + 1}`}
            width={40}
            height={40}
            quality={100}
            unoptimized
            className="rounded-lg"
          />
        </div>
      );
    } else if (type === "background") {
      // Background with image
      return (
        <div key={index} className="ring-border rounded-[4px] shrink-0">
          <Image
            src={imageData.url}
            alt={`background ${index + 1}`}
            width={114}
            height={40}
            unoptimized
            quality={100}
            className="rounded-[4px] w-[114px] h-[40px] object-cover"
          />
        </div>
      );
    } else if (type === "demo") {
      return (
        <div key={index} className="ring-border rounded-[4px] shrink-0">
          <Image
            src={imageData.url}
            alt={`demo ${index + 1}`}
            width={94}
            height={40}
            unoptimized
            quality={100}
            className="rounded-[4px] w-[94px] h-[40px] object-cover"
          />
        </div>
      );
    }
  };

  const currentImages = selectedValues || [];

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-6 max-[1015px]:gap-3 max-[990px]:gap-6 w-full",
          containerClassName,
        )}>
        <div
          className={cn(
            "flex flex-col justify-center items-center gap-[6px]  py-6 border border-border rounded-[8px] w-full border-dashed  text-center",
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
            accept={getFileExtensionsFromMimeTypes(allowedFileTypes)}
          />
          <div
            className="flex justify-center items-center bg-background border rounded-full size-11 shrink-0"
            aria-hidden="true">
            <ImageIcon className="opacity-60 size-4" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <p className="font-medium">
              <button className="text-primary cursor-pointer" onClick={handleBrowseFiles}>
                Click to upload
              </button>{" "}
              <span className="text-foreground/80">or drag and drop</span>
            </p>
            <p className="text-[12px] text-secondary text-xs">
              {getReadableFormatNames(allowedFileTypes)} formats, up to 5MB
              {validMaxUploads > 1 && ` (${currentImages.length}/${validMaxUploads} uploaded)`}
            </p>
          </div>
        </div>

        {currentImages.length > 0 && (
          <div className="flex flex-col gap-3">
            {currentImages.map((imageData, index) => (
              <div
                key={index}
                className="flex justify-between items-center gap-2 bg-background p-2 pe-3 border rounded-lg">
                <div className="relative flex items-center gap-3 overflow-hidden">
                  {renderPreview(imageData, index)}
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium text-[13px] truncate">{imageData.fileName}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(imageData.fileSize)}
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="hover:bg-transparent -me-2 size-8 text-muted-foreground/80 hover:text-foreground"
                  onClick={() => handleDeleteFile(index)}
                  aria-label={`Remove file ${index + 1}`}>
                  <XIcon aria-hidden="true" size={16} />
                </Button>
              </div>
            ))}

            {validMaxUploads > 1 && currentImages.length > 1 && (
              <Button
                variant="outline"
                size="xs"
                onClick={handleDeleteAllFiles}
                className="self-start">
                Remove all
              </Button>
            )}
          </div>
        )}
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

export default ImageUpload;
