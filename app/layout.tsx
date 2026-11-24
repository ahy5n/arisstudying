import type { Metadata, Viewport } from 'next'
import { Amiri } from 'next/font/google'
import { AppProvider } from '@/components/AppProvider'
import { Shell } from '@/components/Shell'
import { ThemeSync } from '@/components/useTheme'
import { THEME_SCRIPT } from '@/lib/theme'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'arisstudying', template: '%s · arisstudying' },
  description: 'A private study companion.',
  applicationName: 'arisstudying',
  appleWebApp: { capable: true, title: 'arisstudying', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
}

// Downloaded at build time and served from this site, so visitors' browsers
// never contact Google (no IP address shared with a third party).
const amiri = Amiri({ subsets: ['arabic'], weight: ['400', '700'], display: 'swap', variable: '--font-amiri' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The head script sets data-palette / data-mode before React loads.
    <html lang="en-GB" className={amiri.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <AppProvider>
          <ThemeSync />
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  )
}
