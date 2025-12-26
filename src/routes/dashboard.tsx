import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AdminDashboard } from "../components/admin";
import { useState, useEffect } from "react";
import { isConvexConfigured } from "../lib/convex";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import type { Summary, EmployeeStatus, EmployeeTransactions } from "../../product-plan/sections/admin-dashboard/types";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPageContent() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  const summary = useQuery(api.queries.getDashboardSummary, { date: currentDate }) as Summary | undefined;
  const employeeStatus = useQuery(api.queries.getEmployeeStatus, { date: currentDate }) as EmployeeStatus[] | undefined;
  const employeeTransactions = useQuery(api.queries.getEmployeeTransactionsGrouped, { date: currentDate }) as EmployeeTransactions | undefined;

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      // Convex queries auto-update, so we just need to trigger a refresh
      setTimeout(() => setIsRefreshing(false), 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Convex queries auto-update, so we just need to show loading state
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (!summary || !employeeStatus) return;
    
    try {
      if (format === 'pdf') {
        const { exportDashboardToPDF } = await import('../lib/export');
        await exportDashboardToPDF(summary, employeeStatus, currentDate);
      } else if (format === 'csv') {
        const { exportToCSV } = await import('../lib/export');
        // Export employee status as CSV
        exportToCSV(employeeStatus, `dashboard-employee-status-${currentDate}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export. Please try again.');
    }
  };

  // Show loading state while data is being fetched
  if (!summary || !employeeStatus || !employeeTransactions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <AdminDashboard
      summary={summary}
      employeeStatus={employeeStatus}
      employeeTransactions={employeeTransactions}
      currentDate={currentDate}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      onDateChange={handleDateChange}
      onExport={handleExport}
    />
  );
}

function DashboardPage() {
  if (!isConvexConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Convex Not Configured
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please configure Convex to view the admin dashboard. See CONVEX_SETUP.md for instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth requireRole="admin">
      <DashboardPageContent />
    </ProtectedRoute>
  );
}

