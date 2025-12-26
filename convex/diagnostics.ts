// convex/diagnostics.ts
// Diagnostic queries to help troubleshoot authentication issues

import { query } from "./_generated/server";

// Check if auth is configured (this will fail if CLERK_JWT_ISSUER_DOMAIN is not set)
export const checkAuthConfig = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      return {
        configured: true,
        authenticated: identity !== null,
        userId: identity?.subject || null,
        error: null,
      };
    } catch (error: any) {
      return {
        configured: false,
        authenticated: false,
        userId: null,
        error: error.message || String(error),
      };
    }
  },
});

