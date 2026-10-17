import { MistakesDeck } from '@/components/practice/MistakesDeck'
import { getPracticeItems } from '@/lib/content'

export const metadata = { title: 'Mistakes deck' }

export default function MistakesPage() {
  return <MistakesDeck items={getPracticeItems()} />
}
