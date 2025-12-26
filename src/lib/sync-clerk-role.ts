// src/lib/sync-clerk-role.ts
// Utility to sync role from Clerk to Convex when Clerk role changes

import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getRoleFromClerk } from "./clerk-roles";
import { useEffect, useRef } from "react";

/**
 * Hook to sync role from Clerk to Convex when it changes
 * This ensures Convex always has the latest role from Clerk (source of truth)
 */
export function useSyncClerkRole() {
  const { user: clerkUser } = useUser();
  const ensureEmployee = useMutation(api.mutations.ensureEmployeeRecord);
  const lastSyncedRoleRef = useRef<string | null>(null);

  useEffect(() => {
    if (!clerkUser?.id) return;

    const clerkRole = getRoleFromClerk(clerkUser);
    const currentRole = clerkRole || null;

    // Only sync if role has changed
    if (currentRole !== lastSyncedRoleRef.current) {
      lastSyncedRoleRef.current = currentRole;

      // Sync role to Convex
      ensureEmployee({
        name: clerkUser.fullName || clerkUser.firstName || undefined,
        email: clerkUser.emailAddresses[0]?.emailAddress || undefined,
        phone: clerkUser.phoneNumbers[0]?.phoneNumber || undefined,
        defaultRole: clerkRole || "field_staff",
      }).catch((error) => {
        console.error("Failed to sync role from Clerk:", error);
      });
    }
  }, [clerkUser, ensureEmployee]);
}

