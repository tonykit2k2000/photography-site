import "server-only";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

if (!process.env.AWS_CLOUDFRONT_DOMAIN) {
  throw new Error("AWS_CLOUDFRONT_DOMAIN environment variable is not set");
}

const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN;
const KEY_PAIR_ID = process.env.AWS_CLOUDFRONT_KEY_PAIR_ID!;

function getPrivateKey(): string {
  const encoded = process.env.AWS_CLOUDFRONT_PRIVATE_KEY;
  if (!encoded) {
    throw new Error("AWS_CLOUDFRONT_PRIVATE_KEY environment variable is not set");
  }
  // Decode base64-encoded PEM key stored in env var
  return Buffer.from(encoded, "base64").toString("utf-8");
}

/**
 * Generate a signed CloudFront URL for a private gallery photo.
 * URL expires in 1 hour by default.
 */
export function generateSignedPhotoUrl(
  s3Key: string,
  expiresInSeconds = 3600
): string {
  const url = `https://${CLOUDFRONT_DOMAIN}/${s3Key}`;
  const dateLessThan = new Date(
    Date.now() + expiresInSeconds * 1000
  ).toISOString();

  return getSignedUrl({
    url,
    keyPairId: KEY_PAIR_ID,
    privateKey: getPrivateKey(),
    dateLessThan,
  });
}

/**
 * Generate a signed CloudFront URL that forces a file download.
 * Used for the "Download Photo" button on gallery pages.
 */
export function generateSignedDownloadUrl(
  s3Key: string,
  filename: string,
  expiresInSeconds = 300
): string {
  const encodedFilename = encodeURIComponent(filename);
  const url = `https://${CLOUDFRONT_DOMAIN}/${s3Key}?response-content-disposition=attachment%3B%20filename%3D%22${encodedFilename}%22`;
  const dateLessThan = new Date(
    Date.now() + expiresInSeconds * 1000
  ).toISOString();

  return getSignedUrl({
    url,
    keyPairId: KEY_PAIR_ID,
    privateKey: getPrivateKey(),
    dateLessThan,
  });
}

/**
 * Build a public CloudFront URL for portfolio/marketing images
 * (not signed — served from the public CloudFront distribution prefix).
 */
export function getPublicPortfolioUrl(s3Key: string): string {
  return `https://${CLOUDFRONT_DOMAIN}/${s3Key}`;
}
