export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                AI Cost Optimizer
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                Dashboard
              </a>
              <a href="/dashboard/budgets" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                Budgets
              </a>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Real-time AI API Cost Tracking
            </h1>
            <p className="text-xl text-slate-600 mb-8" style={{ lineHeight: '1.7' }}>
              Monitor, optimize, and control your AI API spending across OpenAI, Anthropic, and Google.
              Get instant insights and budget alerts.
            </p>
            <div className="flex gap-4">
              <a
                href="/dashboard"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                Open Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="/docs"
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                View API Docs
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          System Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Total Requests</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              0
            </p>
            <p className="text-sm text-slate-500">Since deployment</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Total Cost</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              $0.00
            </p>
            <p className="text-sm text-slate-500">All providers</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Active Providers</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              3
            </p>
            <p className="text-sm text-slate-500">OpenAI, Anthropic, Google</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600">Budget Status</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
              Active
            </p>
            <p className="text-sm text-slate-500">Monitoring enabled</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Unified Gateway</h3>
            <p className="text-slate-600 text-sm">
              Single API endpoint for OpenAI, Anthropic, and Google. Switch providers without code changes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Real-time Analytics</h3>
            <p className="text-slate-600 text-sm">
              Track API usage, costs, and performance metrics in real-time with detailed dashboards.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Budget Alerts</h3>
            <p className="text-slate-600 text-sm">
              Set monthly budgets and get notified when you reach spending thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              © 2026 AI Cost Optimizer. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="/docs" className="text-sm text-slate-600 hover:text-slate-900">
                Documentation
              </a>
              <a href="https://github.com/rainbow686/ai-api-price" className="text-sm text-slate-600 hover:text-slate-900">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
