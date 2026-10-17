import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="text-[28px] font-semibold">Nothing here</h1>
      <p className="mt-2 text-muted">That page doesn’t exist — it may have moved.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Go home
      </Link>
    </div>
  )
}
