'use client'

import { useApp } from './AppProvider'
import { SparkleIcon } from './icons'

export const FALLBACK_CLAUDE_URL = 'https://claude.ai/new'

export function wrongAnswerPrompt(question: string, picked: string, correct: string) {
  return `I got this wrong: "${question}". I picked "${picked}". The answer is "${correct}". Explain why simply, then give me one similar question to try.`
}

function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

/** Copy inside the tap; falls back to the old execCommand route. */
function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => {
      if (!legacyCopy(text)) throw new Error('copy failed')
    })
  }
  return legacyCopy(text) ? Promise.resolve() : Promise.reject(new Error('copy failed'))
}

/**
 * Copies a ready-made question, shows a toast, and opens her Claude project.
 * The tab is opened synchronously inside the tap so iPad Safari doesn't
 * treat it as a pop-up.
 */
export function useAskClaude() {
  const { data, toast } = useApp()
  return (text: string) => {
    const url = data?.profile.claudeProjectUrl?.trim() || FALLBACK_CLAUDE_URL
    const copied = copyText(text)
    window.open(url, '_blank', 'noopener')
    copied.then(
      () => toast('Copied — paste it into your tutor chat.'),
      () => toast('Couldn’t copy automatically — type your question into the chat.'),
    )
  }
}

export function AskClaudeButton({
  text,
  label = 'Ask Claude about this',
  variant = 'soft',
  className = '',
}: {
  text: string
  label?: string
  variant?: 'soft' | 'primary' | 'small'
  className?: string
}) {
  const ask = useAskClaude()
  if (variant === 'small') {
    return (
      <button
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-full bg-lilac-soft px-3.5 text-[14px] font-semibold text-lilac-ink hover:bg-lilac ${className}`}
        onClick={() => ask(text)}
      >
        <SparkleIcon className="size-4" />
        {label}
      </button>
    )
  }
  return (
    <button
      className={`btn ${variant === 'primary' ? 'bg-lilac-ink text-white hover:bg-[#4b3a7a]' : 'bg-lilac-soft text-lilac-ink hover:bg-lilac'} ${className}`}
      onClick={() => ask(text)}
    >
      <SparkleIcon className="size-[18px]" />
      {label}
    </button>
  )
}
