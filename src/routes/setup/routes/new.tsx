import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";

export const Route = createFileRoute("/setup/routes/new")({
  component: NewRoutePage,
});

function NewRoutePage() {
  const navigate = useNavigate();
  const shops = useQuery(api.queries.getShops) ?? [];
  const createRoute = useMutation(api.mutations.createRoute);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shopIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createRoute({
        name: formData.name,
        description: formData.description,
        shopIds: formData.shopIds.map((id) => id as any),
      });
      navigate({ to: "/setup" });
    } catch (error) {
      console.error("Error creating route:", error);
      alert("Failed to create route. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShop = (shopId: string) => {
    setFormData({
      ...formData,
      shopIds: formData.shopIds.includes(shopId)
        ? formData.shopIds.filter((id) => id !== shopId)
        : [...formData.shopIds, shopId],
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Create New Route
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Enter route details and select shops
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Route Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select Shops
          </label>
          <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 max-h-64 overflow-y-auto">
            {shops.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No shops available. Create shops first.</p>
            ) : (
              <div className="space-y-2">
                {shops.map((shop) => (
                  <label key={shop._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.shopIds.includes(shop._id)}
                      onChange={() => toggleShop(shop._id)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{shop.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{shop.zone}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formData.shopIds.length} shop(s) selected
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create Route"}
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

