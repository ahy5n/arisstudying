import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The "Explain it" marker reads topic content from /data at request time.
  outputFileTracingIncludes: { '/api/mark': ['./data/**/*.json'] },
}

export default nextConfig
