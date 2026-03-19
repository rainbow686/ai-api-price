export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                AI Cost Optimizer
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/dashboard" className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors">
                Dashboard
              </a>
              <a href="/dashboard/budgets" className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors">
                Budgets
              </a>
              <a href="/analytics" className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors">
                Analytics
              </a>
              <button className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                Sign In
              </button>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg">
                Start Free
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-6">
              <span>🚀</span>
              Now in Beta - Join 500+ teams
            </div>

            {/* Hero Title */}
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Cut Your AI Costs by<br />
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                Up to 60%
              </span>
            </h1>

            {/* Hero Description */}
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Real-time cost optimization for AI APIs. Automatically route requests to the most cost-effective provider,
              track spending across teams, and optimize token usage — all in one dashboard.
            </p>

            {/* Hero Actions */}
            <div className="flex gap-4 justify-center mb-16">
              <a
                href="/dashboard"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg inline-flex items-center gap-2"
              >
                Start Free Trial
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="/docs"
                className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-lg font-semibold transition-all hover:shadow-md inline-flex items-center gap-2"
              >
                View Demo
              </a>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-600 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  $2.4M+
                </div>
                <div className="text-sm text-slate-500">Costs optimized</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-600 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  500+
                </div>
                <div className="text-sm text-slate-500">Teams using us</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-600 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  60%
                </div>
                <div className="text-sm text-slate-500">Avg. cost reduction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Cost Dashboard
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Dark Mode</span>
              <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 p-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-500 mb-1">Total Spend (30d)</div>
              <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                $12,847
              </div>
              <div className="text-sm text-emerald-600 mt-1">↑ 23% vs last month</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-500 mb-1">Tokens Processed</div>
              <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                2.4B
              </div>
              <div className="text-sm text-emerald-600 mt-1">↓ 18% vs last month</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-500 mb-1">Avg. Cost/1K Tokens</div>
              <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                $0.0024
              </div>
              <div className="text-sm text-emerald-600 mt-1">↓ 35% optimization</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-500 mb-1">Active Providers</div>
              <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                4/6
              </div>
              <div className="text-sm text-slate-400 mt-1">2 available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Comparison Table */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Live Price Comparison
            </h2>
            <p className="text-slate-500">Real-time pricing across major AI providers for GPT-4 class models</p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Provider</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Model</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Input (per 1K tokens)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Output (per 1K tokens)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Optimized Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Savings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center text-white font-bold text-sm">
                        O
                      </div>
                      <span className="font-semibold">OpenAI</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">GPT-4 Turbo</td>
                  <td className="px-4 py-4 font-mono">$0.01</td>
                  <td className="px-4 py-4 font-mono">$0.03</td>
                  <td className="px-4 py-4 font-mono">$0.03</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">Baseline</span>
                  </td>
                </tr>
                <tr className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-800 rounded-md flex items-center justify-center text-white font-bold text-sm">
                        A
                      </div>
                      <span className="font-semibold">Anthropic</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">Claude 3.5 Sonnet</td>
                  <td className="px-4 py-4 font-mono">$0.003</td>
                  <td className="px-4 py-4 font-mono">$0.015</td>
                  <td className="px-4 py-4 font-mono">$0.018</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">↓ 40%</span>
                  </td>
                </tr>
                <tr className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold text-sm">
                        G
                      </div>
                      <span className="font-semibold">Google</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">Gemini 1.5 Pro</td>
                  <td className="px-4 py-4 font-mono">$0.0025</td>
                  <td className="px-4 py-4 font-mono">$0.0075</td>
                  <td className="px-4 py-4 font-mono">$0.01</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">↓ 67%</span>
                  </td>
                </tr>
                <tr className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                        M
                      </div>
                      <span className="font-semibold">Meta (via Together)</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">Llama 3.1 405B</td>
                  <td className="px-4 py-4 font-mono">$0.003</td>
                  <td className="px-4 py-4 font-mono">$0.003</td>
                  <td className="px-4 py-4 font-mono">$0.006</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">↓ 80%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                AI Cost Optimizer
              </h4>
              <p className="text-sm leading-relaxed">
                The smartest way to optimize your AI API spending. Trusted by 500+ teams worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
