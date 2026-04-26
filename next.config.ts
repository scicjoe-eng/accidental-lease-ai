import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import bundleAnalyzer from "@next/bundle-analyzer"

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      // Never cache API responses.
      {
        urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith("/api/"),
        handler: "NetworkOnly",
      },
      // Never cache authenticated / app-shell documents.
      {
        urlPattern: ({ url }: { url: URL }) =>
          url.pathname === "/dashboard" ||
          url.pathname.startsWith("/dashboard/") ||
          url.pathname === "/audit" ||
          url.pathname.startsWith("/audit/") ||
          url.pathname === "/generate" ||
          url.pathname.startsWith("/generate/") ||
          url.pathname === "/upgrade" ||
          url.pathname.startsWith("/upgrade/") ||
          url.pathname === "/login" ||
          url.pathname.startsWith("/login/") ||
          url.pathname === "/signup" ||
          url.pathname.startsWith("/signup/"),
        handler: "NetworkOnly",
      },
    ],
  },
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  async redirects() {
    return [
      { source: "/settings", destination: "/upgrade", permanent: true },
      { source: "/settings/:path*", destination: "/upgrade", permanent: true },
    ]
  },
};

export default withBundleAnalyzer(withPWA(nextConfig));
