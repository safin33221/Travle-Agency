import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    instantInsights: {
      validationLevel: 'manual-warning',
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
