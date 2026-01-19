// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour autoriser les images Cloudinary et UI-Avatars
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Autorise tous les dossiers Cloudinary
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;