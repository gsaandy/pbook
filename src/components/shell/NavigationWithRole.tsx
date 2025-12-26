// src/components/shell/NavigationWithRole.tsx
// Wrapper component that filters navigation based on user role

import { useCurrentUser, hasRole } from "../../lib/auth";
import { MainNav } from "./MainNav";
import type { NavigationItem } from "./AppShell";

interface NavigationWithRoleProps {
  items: NavigationItem[];
  onNavigate?: (href: string) => void;
}

/**
 * Navigation component that filters items based on user role
 * super_admin can access all admin routes
 */
export function NavigationWithRole({ items, onNavigate }: NavigationWithRoleProps) {
  const currentUser = useCurrentUser();

  // Filter navigation items based on role
  // Use hasRole helper to ensure super_admin can access admin routes
  const filteredItems = items.filter((item) => {
    if (!item.requireRole) return true; // No role requirement, show to all
    
    if (!currentUser.role) return false; // User has no role, hide item
    
    // Use hasRole helper which handles super_admin -> admin access
    return hasRole(currentUser.role, item.requireRole);
  });

  return <MainNav items={filteredItems} onNavigate={onNavigate} />;
}

