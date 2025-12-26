import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";

export const Route = createFileRoute("/setup/shops/$id/balance")({
  component: EditBalancePage,
});

function EditBalancePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const shop = useQuery(api.queries.getShop, { id: id as any });
  const auditLogs = useQuery(api.queries.getShopAuditLogs, { shopId: id as any }) ?? [];
  const employees = useQuery(api.queries.getEmployees, { includeInactive: false }) ?? [];
  const updateBalance = useMutation(api.mutations.updateShopBalance);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    newBalance: "",
    note: "",
    changedBy: employees[0]?._id || "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.note.trim()) {
      alert("Note is required for balance changes.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateBalance({
        shopId: id as any,
        newBalance: parseFloat(formData.newBalance) || 0,
        note: formData.note,
        changedBy: formData.changedBy as any,
      });
      navigate({ to: "/setup" });
    } catch (error) {
      console.error("Error updating balance:", error);
      alert("Failed to update balance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shop) {
    return (
      <div className="p-6">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Edit Balance - {shop.name}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Current balance: <span className="font-semibold">{formatCurrency(shop.currentBalance)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Update Balance
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newBalance" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                New Balance (₹) *
              </label>
              <input
                type="number"
                id="newBalance"
                required
                step="0.01"
                value={formData.newBalance}
                onChange={(e) => setFormData({ ...formData, newBalance: e.target.value })}
                placeholder={shop.currentBalance.toString()}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="changedBy" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Changed By *
              </label>
              <select
                id="changedBy"
                required
                value={formData.changedBy}
                onChange={(e) => setFormData({ ...formData, changedBy: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.role === 'super_admin' ? 'Super Admin' : emp.role === 'admin' ? 'Admin' : 'Field Staff'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Note * <span className="text-red-500">(Required)</span>
              </label>
              <textarea
                id="note"
                required
                rows={4}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Explain why the balance is being changed..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                A note is mandatory for all balance changes for audit purposes.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Updating..." : "Update Balance"}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/setup" })}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Audit Log */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Audit History
          </h2>
          {auditLogs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No balance changes recorded yet.
            </p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => {
                const employee = employees.find((e) => e._id === log.changedBy);
                return (
                  <div
                    key={log._id}
                    className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatCurrency(log.previousBalance)} → {formatCurrency(log.newBalance)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTime(log.changedAt)}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          log.changeAmount > 0
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {log.changeAmount > 0 ? '+' : ''}{formatCurrency(log.changeAmount)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {log.note}
                    </p>
                    {employee && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        By: {employee.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

