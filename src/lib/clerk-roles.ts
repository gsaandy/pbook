// src/lib/clerk-roles.ts
// Utilities for reading roles from Clerk (source of truth)

import type { User } from "@clerk/clerk-react";

export type ClerkRole = "field_staff" | "admin" | "super_admin" | null;

/**
 * Get role from Clerk user's publicMetadata
 * Clerk is the source of truth for user roles
 */
export function getRoleFromClerk(user: User | null | undefined): ClerkRole {
  if (!user) return null;
  
  // Read role from Clerk's publicMetadata
  // This is the source of truth
  const role = user.publicMetadata?.role as string | undefined;
  
  if (!role) return null;
  
  // Validate role value
  if (role === "field_staff" || role === "admin" || role === "super_admin") {
    return role;
  }
  
  // Invalid role value, return null
  console.warn(`Invalid role value in Clerk metadata: ${role}`);
  return null;
}

/**
 * Get role from Clerk user, with fallback to default
 */
export function getRoleFromClerkWithDefault(
  user: User | null | undefined,
  defaultRole: ClerkRole = "field_staff"
): ClerkRole {
  const role = getRoleFromClerk(user);
  return role ?? defaultRole;
}

