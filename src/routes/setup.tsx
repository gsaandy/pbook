import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SetupAndConfiguration } from "../components/setup";
import { useState } from "react";
import { isConvexConfigured } from "../lib/convex";
import { useLocation } from "@tanstack/react-router";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

function SetupPageContent() {
  const navigate = useNavigate();
  const [includeInactive, setIncludeInactive] = useState(false);

  // Fetch data from Convex
  // These will return undefined if Convex isn't configured or not connected
  const shopsData = useQuery(api.queries.getShops);
  const routesData = useQuery(api.queries.getRoutes);
  const employeesData = useQuery(api.queries.getEmployees, { includeInactive });
  
  const shops = shopsData ?? [];
  const routes = routesData ?? [];
  const employees = employeesData ?? [];

  // Mutations
  const deleteShop = useMutation(api.mutations.deleteShop);
  const deleteRoute = useMutation(api.mutations.deleteRoute);
  const toggleEmployeeStatus = useMutation(api.mutations.toggleEmployeeStatus);

  // Transform Convex data to component format
  const transformedShops = shops.map((shop) => ({
    id: shop._id,
    name: shop.name,
    address: shop.address,
    phone: shop.phone,
    currentBalance: shop.currentBalance,
    zone: shop.zone,
    lastCollectionDate: shop.lastCollectionDate,
  }));

  const transformedRoutes = routes.map((route) => ({
    id: route._id,
    name: route.name,
    description: route.description,
    shopIds: route.shopIds.map((id) => id.toString()),
  }));

  const transformedEmployees = employees.map((emp) => ({
    id: emp._id,
    name: emp.name,
    phone: emp.phone,
    email: emp.email,
    role: emp.role,
    status: emp.status,
  }));

  const handleAddShop = () => {
    navigate({ to: "/setup/shops/new" });
  };

  const handleEditShop = (id: string) => {
    navigate({ to: `/setup/shops/${id}/edit` });
  };

  const handleEditBalance = (id: string) => {
    navigate({ to: `/setup/shops/${id}/balance` });
  };

  const handleDeleteShop = async (id: string) => {
    if (confirm("Are you sure you want to delete this shop? It will be removed from all routes.")) {
      try {
        await deleteShop({ id: id as any });
      } catch (error) {
        console.error("Error deleting shop:", error);
        alert("Failed to delete shop. Please try again.");
      }
    }
  };

  const handleCreateRoute = () => {
    navigate({ to: "/setup/routes/new" });
  };

  const handleEditRoute = (id: string) => {
    navigate({ to: `/setup/routes/${id}/edit` });
  };

  const handleDeleteRoute = async (id: string) => {
    if (confirm("Are you sure you want to delete this route?")) {
      try {
        await deleteRoute({ id: id as any });
      } catch (error) {
        console.error("Error deleting route:", error);
        alert("Failed to delete route. Please try again.");
      }
    }
  };

  const handleAddEmployee = () => {
    navigate({ to: "/setup/employees/new" });
  };

  const handleEditEmployee = (id: string) => {
    navigate({ to: `/setup/employees/${id}/edit` });
  };

  const handleToggleEmployeeStatus = async (id: string) => {
    // Check if this is a protected user (super_admin)
    const employee = employees.find(emp => emp._id.toString() === id);
    if (employee?.role === 'super_admin') {
      alert('Super admin users cannot be deactivated.');
      return;
    }
    
    try {
      await toggleEmployeeStatus({ id: id as any });
    } catch (error: any) {
      console.error("Error toggling employee status:", error);
      alert(error.message || "Failed to update employee status. Please try again.");
    }
  };

  const handleImportShops = () => {
    // TODO: Implement CSV import in later phase
    alert("CSV import will be available in a later phase");
  };

  return (
    <SetupAndConfiguration
      shops={transformedShops}
      routes={transformedRoutes}
      employees={transformedEmployees}
      onAddShop={handleAddShop}
      onEditShop={handleEditShop}
      onEditBalance={handleEditBalance}
      onDeleteShop={handleDeleteShop}
      onImportShops={handleImportShops}
      onCreateRoute={handleCreateRoute}
      onEditRoute={handleEditRoute}
      onDeleteRoute={handleDeleteRoute}
      onAddEmployee={handleAddEmployee}
      onEditEmployee={handleEditEmployee}
      onToggleEmployeeStatus={handleToggleEmployeeStatus}
      onInactiveFilterChange={setIncludeInactive}
      includeInactive={includeInactive}
    />
  );
}

function SetupPage() {
  const location = useLocation();
  const convexConfigured = isConvexConfigured();

  // Show configuration message if Convex isn't set up
  if (!convexConfigured) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">
            Convex Not Configured
          </h2>
          <p className="text-amber-800 dark:text-amber-300 mb-4">
            To use this feature, please configure Convex by setting the <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">VITE_CONVEX_URL</code> environment variable.
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            See <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">CONVEX_SETUP.md</code> for setup instructions.
          </p>
        </div>
      </div>
    );
  }

  // If we're on a nested route (like /setup/shops/new), render the Outlet
  // Otherwise, render the SetupAndConfiguration component
  if (location.pathname !== "/setup") {
    return (
      <ProtectedRoute requireAuth requireRole="admin">
        <Outlet />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth requireRole="admin">
      <SetupPageContent />
    </ProtectedRoute>
  );
}

