export async function uploadUserAvatar(signedUrl: string, image: string) {
  if (!signedUrl || !image) {
    return {
      error: "Invalid parameters",
      message: "Please provide a signed URL and an image",
    };
  }
  try {
    const base64Data = image.split(",")[1];
    if (!base64Data) {
      return {
        error: "Invalid image data",
        message: "Image data is not in the correct format",
      };
    }
    const imageBuffer = Buffer.from(base64Data, "base64");
    const response = await fetch(signedUrl, {
      method: "PUT",
      body: imageBuffer,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("S3 Upload Error:", errorMessage);
      throw new Error("Failed to upload user avatar");
    }

    return {
      error: null,
      message: "User avatar uploaded successfully",
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      error: errorMessage,
      message: "Error uploading user avatar",
    };
  }
}
