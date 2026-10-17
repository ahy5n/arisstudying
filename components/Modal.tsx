'use client'

import { useEffect, useRef } from 'react'
import { CloseIcon } from './icons'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      // Start in the first field rather than on the close button.
      requestAnimationFrame(() => d.querySelector<HTMLElement>('textarea, input:not([type=hidden])')?.focus())
    }
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      aria-label={title}
      className="m-auto w-[min(520px,calc(100vw-32px))] rounded-[22px] bg-card p-0 text-ink shadow-[var(--shadow-lift)] backdrop:bg-ink/25 backdrop:backdrop-blur-[2px]"
    >
      {open && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button className="btn btn-ghost -mr-2 -mt-2 px-2.5" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
          <div className="mt-3">{children}</div>
        </div>
      )}
    </dialog>
  )
}
