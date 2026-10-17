'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from './AppProvider'
import { FlagButton } from './FlagButton'
import { GearIcon } from './icons'
import { LoginScreen } from './LoginScreen'

export function Shell({ children }: { children: React.ReactNode }) {
  const { status, error, retry, signOut } = useApp()
  const pathname = usePathname()

  if (status === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center" aria-busy="true">
        <div className="flex flex-col items-center gap-3 text-muted">
          <div className="size-10 animate-pulse rounded-full bg-rose" />
          <span className="text-sm">Opening your notes…</span>
        </div>
      </div>
    )
  }
  if (status === 'signed-out') return <LoginScreen />
  if (status === 'error') {
    return (
      <div className="grid min-h-dvh place-items-center px-4">
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-2xl font-semibold">Couldn’t load your progress</h1>
          <p className="mt-2 text-muted">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button className="btn btn-primary" onClick={retry}>
              Try again
            </button>
            <button className="btn btn-quiet" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const topicId = pathname.startsWith('/t/') ? pathname.split('/')[2] : pathname
  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/70">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-2 px-4 sm:px-6">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 rounded-xl px-1 font-rounded text-[19px] font-semibold tracking-tight"
          >
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-rose">
              <span className="block h-3 w-5 rounded-[50%] border-2 border-rose-ink">
                <span className="mx-auto mt-[1px] block size-1.5 rounded-full bg-rose-ink" />
              </span>
            </span>
            arisstudying
          </Link>
          <nav className="flex items-center gap-1">
            <FlagButton topicId={topicId} variant="header" />
            <Link href="/settings" className="btn btn-ghost px-3" aria-label="Settings">
              <GearIcon />
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-5 sm:px-6 sm:pt-7 print:max-w-none print:p-0">{children}</main>
    </>
  )
}
