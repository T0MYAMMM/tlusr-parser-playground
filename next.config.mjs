/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  async rewrites() {
    // Forward /api/parse to the FastAPI backend if PARSER_API_URL is set.
    // Otherwise the local /api/parse route handles it with a mocked response.
    const target = process.env.PARSER_API_URL;
    if (!target) return [];
    return [{ source: '/api/parse', destination: `${target}/parse` }];
  },
};

export default nextConfig;
