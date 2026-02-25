import type { NextConfig } from "next";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.linkedin.com https://snap.licdn.com https://connect.facebook.net https://www.facebook.com https://*.fbcdn.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.cloudfront.net https://*.licdn.com https://*.facebook.com https://*.fbcdn.net https://www.linkedin.com https://static.licdn.com;
  font-src 'self' data:;
  connect-src 'self' https://api.stripe.com https://*.s3.us-east-2.amazonaws.com https://www.linkedin.com https://px.ads.linkedin.com https://*.facebook.com https://connect.facebook.net https://*.fbcdn.net;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\n/g, " ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "tonykittphotography.com" }],
        destination: "https://www.tonykittphotography.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
      {
        source: "/gallery/:path*",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
