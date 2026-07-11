import { supabase } from './supabase'

// Adds an email to the subscribers list. Returns { ok } on success,
// { ok:false, duplicate:true } if already subscribed, or { ok:false, error }.
export async function subscribeEmail(email, source = 'home') {
  const clean = (email || '').trim().toLowerCase()
  if (!clean) return { ok: false, error: 'Email is required.' }

  const { error } = await supabase.from('subscribers').insert({ email: clean, source })
  if (error) {
    if (error.code === '23505') return { ok: false, duplicate: true } // unique violation
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
