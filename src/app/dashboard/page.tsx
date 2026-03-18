'use client';

import { useEffect, useState } from 'react';

interface RequestLog {
  id: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  status: string;
  timestamp: string;
}

interface CostSummary {
  totalCost: number;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [recentRequests, setRecentRequests] = useState<RequestLog[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // In a real implementation, this would call an API route
      // that fetches data from Supabase with proper auth
      const [summaryRes, requestsRes] = await Promise.all([
        fetch('/api/dashboard/summary'),
        fetch('/api/dashboard/requests?limit=10'),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRecentRequests(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded" />
              ))}
            </div>
            <div className="h-64 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600">
            Real-time AI API cost tracking
          </p>
        </header>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              label="Total Cost"
              value={`$${summary.totalCost.toFixed(4)}`}
              icon="💰"
            />
            <SummaryCard
              label="Total Requests"
              value={summary.totalRequests.toLocaleString()}
              icon="📊"
            />
            <SummaryCard
              label="Input Tokens"
              value={(summary.totalInputTokens / 1000).toFixed(1) + 'K'}
              icon="⬆️"
            />
            <SummaryCard
              label="Output Tokens"
              value={(summary.totalOutputTokens / 1000).toFixed(1) + 'K'}
              icon="⬇️"
            />
          </div>
        )}

        {/* Recent Requests Table */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Recent Requests
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tokens (In/Out)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No requests yet. Start using the Gateway to see your costs.
                    </td>
                  </tr>
                ) : (
                  recentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-700 capitalize">
                        {request.provider}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                        {request.model}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                        {request.input_tokens} / {request.output_tokens}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                        ${request.cost_usd.toFixed(6)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatTime(request.timestamp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles = {
    success: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-amber-100 text-amber-800',
  };

  const statusLabels = {
    success: 'Success',
    failed: 'Failed',
    pending: 'Pending',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusStyles[status as keyof typeof statusStyles] || statusStyles.pending}`}>
      {statusLabels[status as keyof typeof statusLabels] || status}
    </span>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}
