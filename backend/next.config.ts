import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Nested inside the frontend repo, so pin the root rather than let Next pick the outer lockfile.
  turbopack: { root: __dirname },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // JSON API only: nothing here should ever be rendered, framed or cached.
          { key: "Content-Security-Policy", value: "default-src 'none'; frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
