import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dotenv from "dotenv";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
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
            s3.HttpMethods.PUT, // Allow authenticated users to upload images
            s3.HttpMethods.DELETE, // Allow authenticated users to delete images
          ],
          allowedOrigins: allowedOrigins,
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "MatchMeDistribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(matchmeBucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: "/error.html",
          ttl: cdk.Duration.minutes(30),
        },
      ],
    });

    const bucketPolicy = new s3.BucketPolicy(this, "BucketPolicy", {
      bucket: matchmeBucket,
    });

    bucketPolicy.document.addStatements(
      new iam.PolicyStatement({
        actions: ["s3:PutObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.ArnPrincipal("arn:aws:iam::975050145455:user/s3-image-admin")],
        resources: [`${matchmeBucket.bucketArn}/user-avatars/*`],
      }),

      new iam.PolicyStatement({
        actions: ["s3:PutObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.ArnPrincipal("arn:aws:iam::975050145455:user/s3-image-admin")],
        resources: [`${matchmeBucket.bucketArn}/user-backgrounds/*`],
      }),

      new iam.PolicyStatement({
        actions: ["s3:PutObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.ArnPrincipal("arn:aws:iam::975050145455:user/s3-image-admin")],
        resources: [`${matchmeBucket.bucketArn}/project-avatars/*`],
      }),
      new iam.PolicyStatement({
        actions: ["s3:PutObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.ArnPrincipal("arn:aws:iam::975050145455:user/s3-image-admin")],
        resources: [`${matchmeBucket.bucketArn}/project-backgrounds/*`],
      }),

      // Allow public read access to `user-avatars/` folder
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        resources: [`${matchmeBucket.bucketArn}/user-avatars/*`],
      }),

      // Allow public read access to `user-backgrounds/` folder
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        resources: [`${matchmeBucket.bucketArn}/user-backgrounds/*`],
      }),

      // Allow public read access to `project-avatars/` folder
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        resources: [`${matchmeBucket.bucketArn}/project-avatars/*`],
      }),

      // Allow public read access to `project-backgrounds/` folder
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        resources: [`${matchmeBucket.bucketArn}/project-backgrounds/*`],
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

    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: distribution.distributionDomainName,
    });
  }
}
