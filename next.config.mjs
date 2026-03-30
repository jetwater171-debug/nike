/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/nike',
        destination: '/nike-base.html',
      },
    ];
  },
};

export default nextConfig;
