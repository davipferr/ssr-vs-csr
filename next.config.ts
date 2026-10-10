import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (Partial Prerendering) is OFF on purpose. With it on,
  // every request-time section becomes a <Suspense> hole that is revealed by
  // inline JavaScript, so the "disable JavaScript" experiment would show
  // skeletons instead of data. With it off, a dynamic page is classic SSR: the
  // server finishes the whole HTML document before sending it. Streaming is
  // still available explicitly through <Suspense> (see /ssr/dashboard).
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
