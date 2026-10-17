import { ImageResponse } from 'next/og'
import { IconArt } from '@/lib/iconArt'

const SIZES = ['192', '512', 'maskable-512'] as const

export const dynamicParams = false

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params
  const px = size.endsWith('512') ? 512 : 192
  return new ImageResponse(<IconArt size={px} />, { width: px, height: px })
}
