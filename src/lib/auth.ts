// src/lib/auth.ts
// Authentication and authorization utilities

import { useUser } from "@clerk/clerk-react";
import { useQuery, useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import { getRoleFromClerk } from "./clerk-roles";

export type UserRole = "admin" | "field_staff" | "super_admin" | null;

export interface CurrentUser {
  employeeId: Id<"employees"> | null;
  role: UserRole;
  name: string;
  email: string;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Hook to get the current authenticated user's employee record and role
 * Uses useConvexAuth() to ensure Convex authentication is ready
 * Automatically creates employee record if it doesn't exist
 */
export function useCurrentUser(): CurrentUser {
  const { user: clerkUser } = useUser();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const ensureEmployee = useMutation(api.mutations.ensureEmployeeRecord);
  const hasEnsuredRef = useRef(false);
  
  // Get employee by Clerk user ID
  // Only query if Convex is authenticated (user has valid token)
  const employee = useQuery(
    api.queries.getEmployeeByClerkUserId,
    isConvexAuthenticated && clerkUser?.id ? { clerkUserId: clerkUser.id } : "skip"
  );

  // Auto-create employee record on first sign-in
  // Role is read from Clerk's publicMetadata (source of truth)
  useEffect(() => {
    if (
      isConvexAuthenticated &&
      clerkUser?.id &&
      !employee &&
      !hasEnsuredRef.current &&
      !isConvexLoading
    ) {
      hasEnsuredRef.current = true;
      
      // Get role from Clerk (source of truth)
      const clerkRole = getRoleFromClerk(clerkUser);
      
      // Auto-create employee record with Clerk user info and role
      ensureEmployee({
        name: clerkUser.fullName || clerkUser.firstName || undefined,
        email: clerkUser.emailAddresses[0]?.emailAddress || undefined,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || undefined,
        // Use role from Clerk, or default to field_staff if not set
        defaultRole: clerkRole || "field_staff",
      }).catch((error) => {
        console.error("Failed to auto-create employee record:", error);
        hasEnsuredRef.current = false; // Retry on next render
      });
    }
  }, [isConvexAuthenticated, clerkUser, employee, isConvexLoading, ensureEmployee]);

  const isLoading = isConvexLoading || (isConvexAuthenticated && clerkUser?.id && employee === undefined);
  
  // Priority: Clerk role (source of truth) > Convex employee role > null
  // This ensures Clerk is always the source of truth
  const clerkRole = getRoleFromClerk(clerkUser);
  const role: UserRole = clerkRole ?? (employee?.role ?? null);
  
  return {
    employeeId: employee?._id ?? null,
    role: role,
    name: employee?.name ?? clerkUser?.fullName ?? clerkUser?.firstName ?? "Guest",
    email: employee?.email ?? clerkUser?.emailAddresses[0]?.emailAddress ?? "",
    isAuthenticated: isConvexAuthenticated && !!clerkUser && !!employee,
    isLoading,
  };
}

/**
 * Check if user has required role
 * super_admin can access everything admin can access
 */
export function hasRole(userRole: UserRole, requiredRole: "admin" | "field_staff" | "admin_or_field_staff"): boolean {
  if (!userRole) return false;
  if (requiredRole === "admin_or_field_staff") return true;
  // super_admin can do everything admin can do
  if (userRole === "super_admin" && requiredRole === "admin") return true;
  return userRole === requiredRole;
}

/**
 * Check if user is admin (including super_admin)
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === "admin" || userRole === "super_admin";
}

/**
 * Check if user is field staff
 */
export function isFieldStaff(userRole: UserRole): boolean {
  return userRole === "field_staff";
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === "super_admin";
}

