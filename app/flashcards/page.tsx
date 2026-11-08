import { Suspense } from 'react'
import { Flashcards } from '@/components/flashcards/Flashcards'
import { getModuleOptions } from '@/lib/moduleOptions'

export const metadata = { title: 'Flashcards' }

export default function FlashcardsPage() {
  return (
    <Suspense>
      <Flashcards modules={getModuleOptions()} />
    </Suspense>
  )
}
