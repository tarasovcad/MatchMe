// "use client";

// import * as React from "react";
// import {TrashIcon, UploadIcon} from "lucide-react";
// import {toast} from "sonner";

// import {Avatar, AvatarFallback} from "@/components/shadcn/avatar";
// import {Button} from "@/components/shadcn/button";
// import {Cropper, CropperElement} from "@/components/shadcn/cropper";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/shadcn/dialog";
// import {ImageDropzone} from "@/components/shadcn/image-dropzone";
// import {Label} from "@/components/shadcn/label";
// import {Separator} from "@/components/shadcn/separator";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/shadcn/tooltip";

// export const MAX_IMAGE_SIZE = 1000000 * 5; // 5 MB

// export function CropperDemo() {
//   const [file, setFile] = React.useState<File>();
//   const [image, setImage] = React.useState<string | undefined>();
//   const [isOpen, setIsOpen] = React.useState<boolean>(false);
//   const cropperRef = React.useRef<CropperElement>(null);
//   const handleDrop = async (files: File[]): Promise<void> => {
//     if (files && files.length > 0) {
//       const file = files[0];
//       if (file.size > MAX_IMAGE_SIZE) {
//         toast.error("Uploaded image shouldn't exceed 5mb size limit");
//       } else {
//         setFile(file);
//         setIsOpen(true);
//       }
//     }
//   };
//   const handleRemoveImage = (): void => {
//     setFile(undefined);
//     setImage(undefined);
//   };

//   const handleClose = () => setIsOpen(false);
//   const handleApply = async () => {
//     if (cropperRef.current) {
//       const croppedImage = await cropperRef.current.getCroppedImage();
//       if (croppedImage) {
//         setImage(croppedImage);
//         setFile(undefined);
//         setIsOpen(false);
//       } else {
//         toast.error("Failed to crop the image.");
//       }
//     }
//   };
//   return (
//     <>
//       <div className="flex flex-col items-center gap-6">
//         <Label>Upload picture</Label>
//         <div className="flex items-center justify-center">
//           <div className="relative">
//             <ImageDropzone
//               accept={{"image/*": []}}
//               multiple={false}
//               borderRadius="full"
//               onDrop={handleDrop}
//               src={image}
//               className="max-h-[120px] min-h-[120px] w-[120px] p-0.5">
//               <Avatar className="size-28">
//                 <AvatarFallback className="size-28 text-2xl">
//                   <UploadIcon className="size-5 shrink-0 text-muted-foreground" />
//                 </AvatarFallback>
//               </Avatar>
//             </ImageDropzone>
//             {image && (
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="icon"
//                     className="size-8 absolute -bottom-1 -right-1 z-10 rounded-full bg-background !opacity-100"
//                     onClick={handleRemoveImage}>
//                     <TrashIcon className="size-4 shrink-0" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent side="right">Remove image</TooltipContent>
//               </Tooltip>
//             )}
//           </div>
//         </div>
//       </div>
//       {file && (
//         <Dialog open={isOpen}>
//           <DialogContent className="max-w-lg" onClose={handleClose}>
//             <div className="space-y-4">
//               <DialogHeader>
//                 <DialogTitle>Crop photo</DialogTitle>
//                 <DialogDescription>
//                   Adjust the size of the grid to crop your image.
//                 </DialogDescription>
//               </DialogHeader>
//               <Separator />
//               <Cropper
//                 ref={cropperRef}
//                 file={file}
//                 aspectRatio={1}
//                 circularCrop={true}
//                 maxImageSize={MAX_IMAGE_SIZE}
//               />
//               <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0">
//                 <Button type="button" variant="outline" onClick={handleClose}>
//                   Cancel
//                 </Button>
//                 <Button type="button" variant="default" onClick={handleApply}>
//                   Apply
//                 </Button>
//               </DialogFooter>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </>
//   );
// }
