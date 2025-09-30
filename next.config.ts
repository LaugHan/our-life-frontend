// next.config.ts

import { NextConfig } from 'next';
const strapiHostname = new URL(process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337').hostname;
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-ffa0a49d115445279a6aa6b0a05b8395.r2.dev', // 这是你的R2域名
        port: '',
        pathname: '/**',
      },
      // --- 在这里添加下面的新对象 ---
      {
        protocol: 'http',
        hostname: strapiHostname, // 使用变量
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;