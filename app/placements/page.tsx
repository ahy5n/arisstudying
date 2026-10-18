import { PlacementsView } from '@/components/placements/PlacementsView'
import { getPlacements } from '@/lib/placements'

export const metadata = { title: 'Placements' }

export default function PlacementsPage() {
  return <PlacementsView data={getPlacements()} />
}
