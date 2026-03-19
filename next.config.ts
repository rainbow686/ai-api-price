import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude deployment scripts from build
  outputFileTracingExcludes: {
    '*': ['./scripts/**/*'],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Edge Runtime 配置 - Gateway 使用
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
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
