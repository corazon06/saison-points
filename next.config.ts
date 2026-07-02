import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autorise l'accès au serveur de dev depuis le téléphone via l'IP locale.
  allowedDevOrigins: ["192.100.200.81"],
};

export default nextConfig;
