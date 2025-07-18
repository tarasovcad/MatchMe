"use server";

import {getUploadUrl} from "../aws/getUploadUrlUserAvatars";
import {uploadImageBuffer} from "../aws/uploadImageBuffer";
import {invalidateCloudFrontCache} from "@/functions/invalidateCloudFrontCache";

/**
 * Reusable helper to process single image form fields.
 *
 * It handles:
 * 1. Detecting new base64 images
 * 2. Getting a signed upload URL
 * 3. Uploading the image buffer to S3
 * 4. Replacing the base64 string with the CloudFront URL
 * 5. Invalidating CloudFront cache for the uploaded path
 * 6. Setting the field to null if no image was provided
 */
export async function processSingleImageField(
  data: Record<string, unknown>,
  fieldName: string,
  ownerId: string,
  folder: string,
): Promise<{error: boolean; message?: string}> {
  // Early return if the field is not present in the data object
  if (!(fieldName in data)) {
    return {error: false};
  }

  const fieldValue = data[fieldName];

  // The UI conventionally sends arrays even for single images
  if (fieldValue && Array.isArray(fieldValue) && fieldValue.length > 0) {
    const imageData = fieldValue[0] as {
      fileName: string;
      fileSize: number;
      uploadedAt: string;
      url: string;
    };

    // Only upload if we received a new base64 image string
    if (imageData.url.startsWith("data:image/")) {
      try {
        const signedUrl = await getUploadUrl(ownerId, folder);
        const uploadResult = await uploadImageBuffer(signedUrl, imageData.url);

        if (uploadResult.error) {
          return {error: true, message: uploadResult.message};
        }

        // Replace with CloudFront URL (same pattern used across the app)
        data[fieldName] = [
          {
            ...imageData,
            url: `${process.env.CLOUDFRONT_URL}/${folder}/${ownerId}/image.webp`,
          },
        ];

        // Invalidate CloudFront cache for the uploaded object so new image is served immediately
        await invalidateCloudFrontCache(`${folder}/${ownerId}/image.webp`);
      } catch (err) {
        console.error(`Error processing ${fieldName}:`, err);
        return {error: true, message: "Error processing image"};
      }
    }
  } else {
    // Either no image or an empty array – normalise to null
    data[fieldName] = null;
  }

  return {error: false};
}
