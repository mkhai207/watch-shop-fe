/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
    unoptimized: false
  },

  // Tắt hydration warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2
  },
  eslint: {
    // Cảnh báo: cho phép build thành công
    // kể cả khi project của bạn có lỗi ESLint.
    ignoreDuringBuilds: true
  },
  typescript: {
    // Cho phép build thành công kể cả khi có lỗi TypeScript
    ignoreBuildErrors: false
  },
  // Output standalone để tối ưu cho production
  output: 'standalone'
}

module.exports = nextConfig
