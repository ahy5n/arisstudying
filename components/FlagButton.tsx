'use client'

import { useState } from 'react'
import { useApp } from './AppProvider'
import { FlagIcon } from './icons'
import { Modal } from './Modal'

/** "Flag this": report something that looks wrong or unclear. */
export function FlagButton({
  topicId,
  itemId = null,
  variant = 'button',
  label = 'Flag this',
}: {
  topicId: string
  itemId?: string | null
  variant?: 'header' | 'button' | 'link'
  label?: string
}) {
  const { flag, toast } = useApp()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await flag({ topicId, itemId, message: message.trim() })
      setOpen(false)
      setMessage('')
      toast('Flagged — thank you.')
    } catch {
      toast('Couldn’t send that flag just now.')
    } finally {
      setBusy(false)
    }
  }

  const trigger =
    variant === 'header' ? (
      <button className="btn btn-ghost px-3 text-[15px]" onClick={() => setOpen(true)}>
        <FlagIcon className="size-[18px]" />
        <span className="hidden sm:inline">Flag this</span>
        <span className="sr-only sm:hidden">Flag this page</span>
      </button>
    ) : variant === 'link' ? (
      <button
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-[14px] text-faint hover:text-muted"
        onClick={() => setOpen(true)}
      >
        <FlagIcon className="size-4" />
        {label}
      </button>
    ) : (
      <button className="btn btn-quiet" onClick={() => setOpen(true)}>
        <FlagIcon className="size-[18px]" />
        {label}
      </button>
    )

  return (
    <>
      {trigger}
      <Modal open={open} onClose={() => setOpen(false)} title="Flag this">
        <form onSubmit={send}>
          <p className="text-[15px] text-muted">
            Something wrong, unclear or different from the lecture slides? Say what, and it’s saved for checking.
          </p>
          <textarea
            className="field mt-4 min-h-28 resize-y"
            placeholder="e.g. The slides say the blank allowance is 2 mm, not 3 mm."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-label="What’s wrong?"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={busy || !message.trim()}>
              Send flag
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
