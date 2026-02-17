/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Proxy API calls in development to avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
