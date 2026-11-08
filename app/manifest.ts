import type { MetadataRoute } from 'next'
import { PALETTES } from '@/lib/palettes'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'arisstudying',
    short_name: 'arisstudying',
    description: 'A private study companion.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    // Prism light (the default theme); the page's theme-color meta follows the chosen theme.
    background_color: PALETTES.prism.light.bg,
    theme_color: PALETTES.prism.light.bg,
    icons: [
      { src: '/icons/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
