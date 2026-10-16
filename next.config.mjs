const nextConfig = {
  outputFileTracingIncludes: {
    "/api/cv": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  async redirects() {
    return [{ source: "/cv.html", destination: "/cv", permanent: true }];
  },
};

export default nextConfig;
