import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dotenv from "dotenv";

dotenv.config();

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000"];

    const matchmeBucket = new s3.Bucket(this, "MatchMeBucket", {
      bucketName: "matchme-me",
      publicReadAccess: false, // public read access controlled by the bucket policy
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: false,
        ignorePublicAcls: true,
        restrictPublicBuckets: false,
      }),
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Prevent accidental deletion
      autoDeleteObjects: false, // Ensures safety of data
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET, // Allow frontend to fetch images
            s3.HttpMethods.HEAD, // Allow preflight requests
          ],
          allowedOrigins: allowedOrigins,
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });

    const bucketPolicy = new s3.BucketPolicy(this, "BucketPolicy", {
      bucket: matchmeBucket,
    });

    bucketPolicy.document.addStatements(
      // Allow authenticated users to upload and delete only from their own folder
      new iam.PolicyStatement({
        actions: ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        resources: [`${matchmeBucket.bucketArn}/user-avatars/*`],
      }),

      // Allow public read access to `user-avatars/` folder
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        resources: [`${matchmeBucket.bucketArn}/user-avatars/*`],
      }),

      // Allow public read access to `skills-image/` folder
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        resources: [`${matchmeBucket.bucketArn}/skills-image/*`],
      }),
    );

    new cdk.CfnOutput(this, "BucketName", {
      value: matchmeBucket.bucketName,
    });

    new cdk.CfnOutput(this, "BucketArn", {
      value: matchmeBucket.bucketArn,
    });

    new cdk.CfnOutput(this, "BucketWebsiteURL", {
      value: `https://${matchmeBucket.bucketName}.s3.amazonaws.com/`,
    });
  }
}
