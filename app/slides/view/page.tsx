import { Suspense } from 'react'
import { DeckView } from '@/components/slides/DeckView'
import { getModuleOptions } from '@/lib/moduleOptions'

export const metadata = { title: 'Slides' }

export default function DeckPage() {
  return (
    <Suspense>
      <DeckView modules={getModuleOptions()} />
    </Suspense>
  )
}
