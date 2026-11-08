'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from './AppProvider'
import { FlagButton } from './FlagButton'
import { GearIcon } from './icons'
import { LoginScreen } from './LoginScreen'
import { Logo } from './Logo'

export function Shell({ children }: { children: React.ReactNode }) {
  const { status, error, retry, signOut } = useApp()
  const pathname = usePathname()

  if (status === 'loading') {
    return (
      <div className="grid min-h-dvh place-items-center" aria-busy="true">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Logo size={40} withWordmark={false} className="animate-pulse" />
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
      <header className="no-print sticky top-0 z-30 border-b border-border/70 bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-2 px-4 sm:px-6">
          <Link
            href="/"
            className="flex min-h-11 items-center rounded-xl px-1"
          >
            <Logo size={30} />
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
