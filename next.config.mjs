/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  distDir: process.env.BUILD_DIR || ".next",
};

export default nextConfig;
