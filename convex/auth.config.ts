// convex/auth.config.ts
// Server-side configuration for validating Clerk access tokens
// See: https://docs.convex.dev/auth/clerk

import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Replace with your Clerk Frontend API URL (JWT Issuer Domain)
      // In development: https://verb-noun-00.clerk.accounts.dev
      // In production: https://clerk.<your-domain>.com
      // You can also set this as CLERK_JWT_ISSUER_DOMAIN in Convex Dashboard
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex", // Must be "convex" - do not rename
    },
  ],
} satisfies AuthConfig;

