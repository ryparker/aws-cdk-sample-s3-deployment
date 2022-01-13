import { App, Stack, RemovalPolicy } from "aws-cdk-lib";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import * as crypto from "crypto";

const app = new App();
const stack = new Stack(app, "sample-s3-deployment");

const bucket = new Bucket(stack, `test-deployment-bucket`, {
  bucketName: "issue-18421-test-bucket",
  websiteIndexDocument: "index.html",
  websiteErrorDocument: "index.html",
  publicReadAccess: false,
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
  encryption: BucketEncryption.S3_MANAGED,
  enforceSSL: true,
});

const distribution = new Distribution(stack, "test-distribution", {
  defaultBehavior: { origin: new S3Origin(bucket) },
});

new BucketDeployment(stack, `deploy-with-invalidation-test`, {
  sources: [
    Source.asset("assets", {
      assetHash: crypto.createHash("sha256").digest("hex"), // enforce update on every deployment
    }),
  ],
  destinationBucket: bucket,
  destinationKeyPrefix: `apps/test/`,
  distribution: distribution,
  distributionPaths: ["/*"],
});
