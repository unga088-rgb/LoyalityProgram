/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Don't ignore build errors in production
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
