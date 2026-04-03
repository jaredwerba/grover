import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://tiles.stadiamaps.com",
              "connect-src 'self' https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://tiles.stadiamaps.com https://api.openai.com https://api.resend.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
