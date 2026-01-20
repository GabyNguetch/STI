// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuration pour autoriser les images Cloudinary, UI-Avatars et Unsplash
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
      },
      // Correction ici : ajout d'Unsplash comme un objet pattern, pas comme une propriété "domains"
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.externals = config.externals || {};
    // Ces lignes sont généralement utilisées pour le Server-Side Rendering avec certaines bibliothèques qui
    // s'attendent à ce que React soit disponible globalement ou géré différemment.
    // Assurez-vous que cela est nécessaire pour votre projet (ex: pour React Three Fiber).
    config.externals['react'] = 'react';
    config.externals['react-dom'] = 'react-dom';
    return config;
  },
  // Transpilation nécessaire pour l'écosystème React Three Fiber
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

export default nextConfig;