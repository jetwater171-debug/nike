/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/nike',
        destination: '/nike-base.html',
      },
      {
        source: '/admin',
        destination: '/admin.html',
      },
      {
        source: '/admin/tracking',
        destination: '/admin-tracking.html',
      },
      {
        source: '/admin/utmfy',
        destination: '/admin-utmfy.html',
      },
      {
        source: '/admin/gateways',
        destination: '/admin-gateways.html',
      },
      {
        source: '/admin/pages',
        destination: '/admin-pages.html',
      },
      {
        source: '/admin/backredirects',
        destination: '/admin-backredirects.html',
      },
      {
        source: '/admin/leads',
        destination: '/admin-leads.html',
      },
    ];
  },
};

export default nextConfig;
