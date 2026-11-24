import type { NextConfig } from 'next'

const dev = process.env.NODE_ENV !== 'production'
const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '')
const supabaseWs = supabase.replace(/^http/, 'ws')
const CDN = 'https://cdnjs.cloudflare.com' // pdf.js and JSZip (reading slides in the browser)

// What the pages may load. Inline scripts are needed for the theme script and
// Next's own bootstrapping; everything else is limited to this site, the CDN
// above and the Supabase project. Fonts are served from this site.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''} ${CDN}`,
  `style-src 'self' 'unsafe-inline'`,
  `font-src 'self' data:`,
  `img-src 'self' data: blob:`,
  `connect-src 'self' ${CDN} ${supabase} ${supabaseWs}${dev ? ' ws:' : ''}`.replace(/\s+/g, ' ').trim(),
  `worker-src 'self' blob: ${CDN}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },
}

export default nextConfig
