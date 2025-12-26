import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/setup/employees/$id/edit")({
  component: EditEmployeePage,
});

function EditEmployeePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const employee = useQuery(api.queries.getEmployee, { id: id as any });
  const updateEmployee = useMutation(api.mutations.updateEmployee);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "field_staff" as "field_staff" | "admin" | "super_admin",
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        phone: employee.phone,
        email: employee.email,
        role: employee.role,
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if this is a protected user (super_admin)
    if (employee?.role === 'super_admin') {
      alert('Super admin users cannot be modified.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await updateEmployee({
        id: id as any,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        role: formData.role,
      });
      navigate({ to: "/setup" });
    } catch (error: any) {
      console.error("Error updating employee:", error);
      alert(error.message || "Failed to update employee. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!employee) {
    return (
      <div className="p-6">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Edit Employee
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Update the employee details below
        </p>
      </div>

      {employee.role === 'super_admin' && (
        <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Super Admin:</strong> This user cannot be modified or deleted.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            required
            disabled={employee.role === 'super_admin'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            required
            disabled={employee.role === 'super_admin'}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            id="phone"
            required
            disabled={employee.role === 'super_admin'}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Role *
          </label>
          <select
            id="role"
            required
            disabled={employee.role === 'super_admin'}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as "field_staff" | "admin" | "super_admin" })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="field_staff">Field Staff</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
            {employee.role === 'super_admin' && (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              Super admin users cannot be modified.
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || employee.role === 'super_admin'}
            className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Updating..." : "Update Employee"}
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
  );
}

