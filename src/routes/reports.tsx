import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ReportsAndHistory } from "../components/reports";
import { isConvexConfigured } from "../lib/convex";
import { useState, useMemo } from "react";
import type { TransactionFilters } from "../../product-plan/sections/reports-and-history/types";
import { calculateTrendData } from "../lib/trends";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPageContent() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [currentFilters, setCurrentFilters] = useState<TransactionFilters>({});

  // Fetch data
  const transactions = useQuery(api.queries.getTransactionsWithFilters, {
    dateRange,
    ...currentFilters,
  }) ?? [];

  const reconciliationEvents = useQuery(api.queries.getReconciliationEvents, {
    dateRange,
  }) ?? [];

  // Get employees and shops for filter options
  const employees = useQuery(api.queries.getEmployees, { includeInactive: false }) ?? [];
  const shops = useQuery(api.queries.getShops) ?? [];

  // Calculate real trend data from transactions
  const trendData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        dailyCollections: [],
        employeePerformance: [],
        paymentModeDistribution: [
          { mode: 'cash', amount: 0, percentage: 0 },
          { mode: 'upi', amount: 0, percentage: 0 },
          { mode: 'cheque', amount: 0, percentage: 0 },
        ],
        topShops: [],
      };
    }
    return calculateTrendData(transactions, dateRange);
  }, [transactions, dateRange]);

  const filterOptions = {
    employees: employees.map((emp) => ({ id: emp._id, name: emp.name })),
    shops: shops.map((shop) => ({ id: shop._id, name: shop.name })),
    paymentModes: ['cash', 'upi', 'cheque'],
  };

  const handleFilterChange = (filters: TransactionFilters) => {
    setCurrentFilters(filters);
  };

  const handleDateRangeChange = (range: { start: string; end: string }) => {
    setDateRange(range);
  };

  const handleExportTransactions = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!transactions || transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    // Transform transactions for export
    const exportData = transactions.map(txn => ({
      id: txn.id,
      date: new Date(txn.timestamp).toISOString().split('T')[0],
      time: new Date(txn.timestamp).toLocaleTimeString(),
      employeeName: txn.employeeName,
      shopName: txn.shopName,
      amount: txn.amount,
      paymentMode: txn.paymentMode.toUpperCase(),
      reference: txn.reference || '',
      status: txn.status,
    }));

    try {
      if (format === 'pdf') {
        const { exportTransactionsToPDF } = await import('../lib/export');
        await exportTransactionsToPDF(exportData, dateRange, currentFilters);
      } else if (format === 'csv') {
        const { exportToCSV } = await import('../lib/export');
        exportToCSV(exportData, `transactions-${dateRange.start}-to-${dateRange.end}`);
      } else if (format === 'excel') {
        const { exportToExcel } = await import('../lib/export');
        await exportToExcel(exportData, `transactions-${dateRange.start}-to-${dateRange.end}`, 'Transactions');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export. Please try again.');
    }
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
  };

  return (
    <ReportsAndHistory
      transactions={transactions}
      reconciliationEvents={reconciliationEvents}
      trendData={trendData}
      filterOptions={filterOptions}
      currentFilters={currentFilters}
      dateRange={dateRange}
      onFilterChange={handleFilterChange}
      onDateRangeChange={handleDateRangeChange}
      onExportTransactions={handleExportTransactions}
      onClearFilters={handleClearFilters}
    />
  );
}

function ReportsPage() {
  if (!isConvexConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Convex Not Configured
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please configure Convex to view reports. See CONVEX_SETUP.md for instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth requireRole="admin_or_field_staff">
      <ReportsPageContent />
    </ProtectedRoute>
  );
}

