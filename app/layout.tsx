import type { Metadata, Viewport } from 'next'
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The head script sets data-palette / data-mode before React loads.
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
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
