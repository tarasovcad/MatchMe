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

    const skillsImageBucket = new s3.Bucket(this, "skillsImageBucket", {
      bucketName: "matchme-skills-image-bucket",
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
      bucket: skillsImageBucket,
    });

    bucketPolicy.document.addStatements(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        resources: [`${skillsImageBucket.bucketArn}/*`],
      }),
    );

    new cdk.CfnOutput(this, "BucketName", {
      value: skillsImageBucket.bucketName,
    });

    new cdk.CfnOutput(this, "BucketArn", {
      value: skillsImageBucket.bucketArn,
    });

    new cdk.CfnOutput(this, "BucketWebsiteURL", {
      value: `https://${skillsImageBucket.bucketName}.s3.amazonaws.com/`,
    });
  }
}
