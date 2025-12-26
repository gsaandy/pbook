import { ClerkProvider as ClerkProviderBase } from "@clerk/clerk-react";

// Get Clerk publishable key from environment variable
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

export const ClerkProvider = ClerkProviderBase;

export const isClerkConfigured = () => {
  return !!clerkPublishableKey && clerkPublishableKey !== "";
};

export { clerkPublishableKey };

