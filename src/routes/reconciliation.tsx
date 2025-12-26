import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { EndOfDayReconciliation } from "../components/reconciliation";
import { useUser } from "@clerk/clerk-react";
import { isConvexConfigured } from "../lib/convex";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { useState } from "react";
import type { VerificationFormData } from "../../product-plan/sections/end-of-day-reconciliation/types";

export const Route = createFileRoute("/reconciliation")({
  component: ReconciliationPage,
});

function ReconciliationPageContent() {
  const { user: clerkUser } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Get admin employee
  const adminEmployee = useQuery(
    api.queries.getEmployeeByClerkUserId,
    clerkUser?.id ? { clerkUserId: clerkUser.id } : "skip"
  );

  // Fetch EOD data
  const eodSummary = useQuery(api.queries.getEODSummary, { date: currentDate });
  const employeeSettlements = useQuery(api.queries.getEmployeeSettlements, { date: currentDate });
  const cashTransactionsByEmployee = useQuery(api.queries.getCashTransactionsByEmployee, { date: currentDate });

  // Mutation for verification
  const verifySettlement = useMutation(api.mutations.verifyEmployeeSettlement);

  const handleVerifyMatch = async (settlementId: string) => {
    try {
      await verifySettlement({
        settlementId: settlementId as any,
        status: "verified",
      });
    } catch (error) {
      console.error("Failed to verify settlement:", error);
      alert("Failed to verify settlement. Please try again.");
    }
  };

  const handleVerifyMismatch = async (settlementId: string, data: VerificationFormData) => {
    try {
      await verifySettlement({
        settlementId: settlementId as any,
        actualCash: data.actualCash,
        note: data.note,
        status: "mismatch",
      });
    } catch (error) {
      console.error("Failed to verify settlement:", error);
      alert("Failed to verify settlement. Please try again.");
    }
  };

  const handleGenerateReport = async (format: 'pdf' | 'csv') => {
    if (!eodSummary || !employeeSettlements) return;
    
    try {
      if (format === 'pdf') {
        const { exportReconciliationToPDF } = await import('../lib/export');
        await exportReconciliationToPDF(eodSummary, employeeSettlements, currentDate);
      } else if (format === 'csv') {
        const { exportToCSV } = await import('../lib/export');
        exportToCSV(employeeSettlements, `reconciliation-${currentDate}`);
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  if (!eodSummary || !employeeSettlements || !cashTransactionsByEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-400">Loading reconciliation data...</div>
      </div>
    );
  }

  return (
    <EndOfDayReconciliation
      eodSummary={eodSummary}
      employeeSettlements={employeeSettlements}
      cashTransactionsByEmployee={cashTransactionsByEmployee}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      onVerifyMatch={handleVerifyMatch}
      onVerifyMismatch={handleVerifyMismatch}
      onGenerateReport={handleGenerateReport}
    />
  );
}

function ReconciliationPage() {
  if (!isConvexConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Convex Not Configured
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please configure Convex to view reconciliation. See CONVEX_SETUP.md for instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth requireRole="admin">
      <ReconciliationPageContent />
    </ProtectedRoute>
  );
}

