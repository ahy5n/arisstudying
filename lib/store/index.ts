import { localBackend } from './local'
import { supabaseBackend } from './supabase'
import type { Backend } from './types'

export const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export const backend: Backend = hasSupabase ? supabaseBackend : localBackend

export * from './types'
