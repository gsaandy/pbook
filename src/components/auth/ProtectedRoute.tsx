// src/components/auth/ProtectedRoute.tsx
// Component to protect routes based on authentication and role

import { Navigate, useRouter } from "@tanstack/react-router";
import { useCurrentUser, hasRole } from "../../lib/auth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: "admin" | "field_staff" | "admin_or_field_staff";
  redirectTo?: string;
}

/**
 * ProtectedRoute component that checks authentication and role before rendering children
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = "/",
}: ProtectedRouteProps) {
  const router = useRouter();
  const currentUser = useCurrentUser();

  // Show loading state while checking authentication
  if (currentUser.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !currentUser.isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  // Check role requirement
  if (requireRole) {
    if (!currentUser.role) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your account is not linked to an employee record. Please contact your admin.
            </p>
            <button
              onClick={() => router.navigate({ to: redirectTo })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    // Use hasRole helper which handles super_admin -> admin access
    if (!hasRole(currentUser.role, requireRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You don't have permission to access this page. This page requires{" "}
              <strong>
                {requireRole === "admin" 
                  ? "admin or super admin" 
                  : requireRole === "field_staff"
                  ? "field staff"
                  : "admin, super admin, or field staff"}
              </strong> role.
            </p>
            <button
              onClick={() => router.navigate({ to: redirectTo })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

