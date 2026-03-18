'use client';

import { useEffect, useState } from 'react';

interface Budget {
  id: string;
  monthly_limit_usd: number;
  alert_thresholds: number[];
  limit_type: 'soft' | 'hard';
  cached_usage_usd: number;
}

export default function BudgetsPage() {
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    monthly_limit_usd: '',
    limit_type: 'soft' as 'soft' | 'hard',
    threshold_50: true,
    threshold_80: true,
    threshold_100: true,
  });

  useEffect(() => {
    loadBudget();
  }, []);

  async function loadBudget() {
    try {
      const res = await fetch('/api/budgets');
      if (res.ok) {
        const data = await res.json();
        setBudget(data);
      }
    } catch (error) {
      console.error('Failed to load budget:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const thresholds = [
      formData.threshold_50 ? 0.5 : null,
      formData.threshold_80 ? 0.8 : null,
      formData.threshold_100 ? 1.0 : null,
    ].filter(Boolean) as number[];

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_limit_usd: parseFloat(formData.monthly_limit_usd),
          limit_type: formData.limit_type,
          alert_thresholds: thresholds,
        }),
      });

      if (res.ok) {
        await loadBudget();
        setEditing(false);
      }
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-48 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Budget Settings
          </h1>
          <p className="text-slate-600">
            Set monthly spending limits and alert thresholds
          </p>
        </header>

        {/* Budget Status */}
        {budget && (
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Current Budget
              </h2>
              <button
                onClick={() => {
                  setFormData({
                    monthly_limit_usd: budget.monthly_limit_usd.toString(),
                    limit_type: budget.limit_type,
                    threshold_50: budget.alert_thresholds.includes(0.5),
                    threshold_80: budget.alert_thresholds.includes(0.8),
                    threshold_100: budget.alert_thresholds.includes(1.0),
                  });
                  setEditing(true);
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Edit
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Monthly Limit</div>
                <div className="text-2xl font-bold text-slate-900">
                  ${budget.monthly_limit_usd.toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500 mb-1">Current Usage</div>
                <div className="text-2xl font-bold text-slate-900">
                  ${budget.cached_usage_usd.toFixed(2)}
                </div>
                <div className="mt-2 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${(budget.cached_usage_usd / budget.monthly_limit_usd) * 100 > 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((budget.cached_usage_usd / budget.monthly_limit_usd) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {((budget.cached_usage_usd / budget.monthly_limit_usd) * 100).toFixed(1)}% used
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${budget.limit_type === 'soft' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-slate-600">
                    {budget.limit_type === 'soft' ? 'Soft Limit' : 'Hard Limit'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-600">
                    Alerts at: {budget.alert_thresholds.map(t => `${t * 100}%`).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Edit Budget
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Monthly Limit (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_limit_usd}
                  onChange={(e) => setFormData({ ...formData, monthly_limit_usd: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Limit Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="limit_type"
                      value="soft"
                      checked={formData.limit_type === 'soft'}
                      onChange={(e) => setFormData({ ...formData, limit_type: e.target.value as 'soft' | 'hard' })}
                    />
                    <span className="text-sm text-slate-600">
                      Soft - Allow overages, just send alerts
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="limit_type"
                      value="hard"
                      checked={formData.limit_type === 'hard'}
                      onChange={(e) => setFormData({ ...formData, limit_type: e.target.value as 'soft' | 'hard' })}
                    />
                    <span className="text-sm text-slate-600">
                      Hard - Block requests when limit reached
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Alert Thresholds
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.threshold_50}
                      onChange={(e) => setFormData({ ...formData, threshold_50: e.target.checked })}
                    />
                    <span className="text-sm text-slate-600">50% of budget</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.threshold_80}
                      onChange={(e) => setFormData({ ...formData, threshold_80: e.target.checked })}
                    />
                    <span className="text-sm text-slate-600">80% of budget</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.threshold_100}
                      onChange={(e) => setFormData({ ...formData, threshold_100: e.target.checked })}
                    />
                    <span className="text-sm text-slate-600">100% of budget</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
