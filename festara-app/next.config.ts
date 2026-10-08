import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every Festara page is personalised (cookies, params), so we keep the classic dynamic model.
  // Both options become the default in the next Next.js major release; revisit then.
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
