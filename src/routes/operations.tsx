import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DailyOperationsFieldStaff } from "../components/operations";
import { useUser } from "@clerk/clerk-react";
import { isConvexConfigured } from "../lib/convex";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { useState } from "react";
import type { CollectionFormData } from "../../product-plan/sections/daily-operations/types";

export const Route = createFileRoute("/operations")({
  component: OperationsPage,
});

function OperationsPageContent() {
  const { user: clerkUser } = useUser();
  
  // Get employee by Clerk user ID
  const employee = useQuery(
    api.queries.getEmployeeByClerkUserId,
    clerkUser?.id ? { clerkUserId: clerkUser.id } : "skip"
  );

  const today = new Date().toISOString().split('T')[0];
  
  // Get assigned route for today
  const assignedRouteData = useQuery(
    api.queries.getRouteAssignmentForEmployee,
    employee?._id ? { employeeId: employee._id, date: today } : "skip"
  );

  // Get cash in bag
  const cashInBag = useQuery(
    api.queries.getCurrentEmployeeCashInBag,
    employee?._id ? { employeeId: employee._id, date: today } : "skip"
  ) ?? 0;

  // Mutation for logging collection
  const logCollection = useMutation(api.mutations.logCollection);

  const handleLogCollection = async (data: CollectionFormData) => {
    if (!employee?._id) return;

    // Get GPS location using browser geolocation API
    let gpsLocation = {
      lat: 12.9716, // Default location (Bangalore) as fallback
      lng: 77.5946,
    };

    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });
        gpsLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      }
    } catch (error) {
      console.warn("Failed to get GPS location, using default:", error);
      // Continue with default location
    }

    try {
      await logCollection({
        employeeId: employee._id,
        shopId: data.shopId as any,
        amount: data.amount,
        paymentMode: data.paymentMode,
        reference: data.reference,
        gpsLocation,
      });
    } catch (error) {
      console.error("Failed to log collection:", error);
      alert("Failed to log collection. Please try again.");
    }
  };

  // Get all shops for search functionality
  const allShops = useQuery(api.queries.getShops) ?? [];

  const handleSearchShop = (query: string) => {
    // The search is handled by the component itself
    // This callback can be used for analytics or other purposes
    if (query) {
      console.log("Searching for shop:", query);
    }
  };

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Employee Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your account is not linked to an employee record. Please contact your admin.
          </p>
        </div>
      </div>
    );
  }

  const paymentModes = [
    { id: 'cash' as const, label: 'Cash' },
    { id: 'upi' as const, label: 'UPI' },
    { id: 'cheque' as const, label: 'Cheque' },
  ];

  return (
    <DailyOperationsFieldStaff
      currentEmployee={{
        id: employee._id,
        name: employee.name,
        role: employee.role,
        cashInBag,
      }}
      assignedRoute={assignedRouteData || null}
      paymentModes={paymentModes}
      onLogCollection={handleLogCollection}
      onSearchShop={handleSearchShop}
    />
  );
}

function OperationsPage() {
  if (!isConvexConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Convex Not Configured
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please configure Convex to view daily operations. See CONVEX_SETUP.md for instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth requireRole="field_staff">
      <OperationsPageContent />
    </ProtectedRoute>
  );
}

