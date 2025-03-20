import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

const cloudfront = new CloudFrontClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function invalidateCloudFrontCache(path: string) {
  try {
    const command = new CreateInvalidationCommand({
      DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: [`/${path}`],
        },
      },
    });

    await cloudfront.send(command);
    console.log("CloudFront cache invalidated:", path);
  } catch (error) {
    console.error("Error invalidating CloudFront cache:", error);
  }
}
