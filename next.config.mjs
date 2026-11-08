const API_URL = (process.env.API_URL || 'http://localhost:5000').replace(
  /\/+$/,
  '',
);

// On Vercel the rewrites below are baked in at build time. Without API_URL
// the site would silently talk to localhost, so fail the build loudly instead.
if (process.env.VERCEL && !process.env.API_URL) {
  throw new Error(
    'API_URL is missing. Add it in Vercel > Settings > Environment Variables (your Render server URL) and redeploy.',
  );
}

const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [{ source: '/cv.html', destination: '/cv', permanent: true }];
  },
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
