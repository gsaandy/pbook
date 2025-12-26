import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

// This will be set via environment variable
// For development, you can set this in .env.local
const convexUrl = import.meta.env.VITE_CONVEX_URL || "";

// Create client only if URL is provided
// If no URL, create a dummy client that won't be used (Provider will handle gracefully)
export const convex = convexUrl 
  ? new ConvexReactClient(convexUrl)
  : new ConvexReactClient("https://placeholder.convex.cloud");

export { ConvexProviderWithClerk };

// Helper to check if Convex is configured
export const isConvexConfigured = () => {
  return !!convexUrl && convexUrl !== "" && !convexUrl.includes("placeholder");
};

