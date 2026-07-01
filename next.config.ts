import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Usamos <img> para las imágenes remotas de Instagram (hosts impredecibles),
  // así que no configuramos el optimizador de next/image.
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
