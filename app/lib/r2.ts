import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;

if (!accountId || !accessKeyId || !secretAccessKey) {
  // Server-side only
  console.warn("[R2] Missing one or more env vars:", {
    hasAccountId: !!accountId,
    hasAccessKeyId: !!accessKeyId,
    hasSecret: !!secretAccessKey,
  });
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});
