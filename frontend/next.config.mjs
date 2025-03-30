/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Optional: You might need this if interacting with backend
    // during build time or for certain image optimizations, etc.
    // async rewrites() {
    //     return [
    //       {
    //         source: '/api/:path*',
    //         destination: 'http://localhost:8000/api/:path*' // Proxy API requests to backend
    //       }
    //     ]
    // }
};

export default nextConfig;
