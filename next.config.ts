import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude deployment scripts from build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Edge Runtime 配置 - Gateway 使用
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Exclude scripts directory from build tracing
    outputFileTracingExcludes: {
      '*': ['./scripts/**/*'],
    },
  },

  // Vercel Cron 配置
  rewrites: async () => [
    {
      source: '/api/cron/:path*',
      destination: '/api/cron/:path*',
    },
  ],
};

export default nextConfig;
