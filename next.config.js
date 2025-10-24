/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com']
  },
  // Tắt hydration warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2
  },
  // Suppress hydration warnings
  experimental: {
    suppressHydrationWarning: true
  }
}

module.exports = nextConfig
