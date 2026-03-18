export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            AI Cost Optimizer
          </h1>
          <p className="text-slate-600 text-lg">
            Real-time AI API cost tracking and optimization
          </p>
        </header>

        {/* Status Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-slate-700">Gateway: Ready</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-slate-700">Dashboard: Ready</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full" />
              <span className="text-slate-700">Budget Alerts: In Progress</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard"
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-slate-800 mb-1">Dashboard</h3>
            <p className="text-sm text-slate-600">View your AI API costs and usage</p>
          </a>
          <a
            href="/dashboard/budgets"
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-slate-800 mb-1">Budgets</h3>
            <p className="text-sm text-slate-600">Set budget limits and alerts</p>
          </a>
          <a
            href="/docs"
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-slate-800 mb-1">API Docs</h3>
            <p className="text-sm text-slate-600">Gateway integration guide</p>
          </a>
        </div>
      </div>
    </main>
  );
}
