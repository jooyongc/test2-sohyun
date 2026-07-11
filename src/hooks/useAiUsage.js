import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Reads and appends AI usage rows (admin only, guarded by RLS).
export function useAiUsage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('ai_usage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) setError(error.message)
    else setRows(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  return { rows, loading, error, refetch: fetchRows }
}

// Records one generation's usage. Best-effort — failures don't block the UI.
export async function recordUsage({ model, usage, cost_usd }) {
  try {
    await supabase.from('ai_usage').insert({
      model,
      input_tokens: usage?.input_tokens ?? 0,
      output_tokens: usage?.output_tokens ?? 0,
      cost_usd: cost_usd ?? 0,
    })
  } catch {
    /* non-fatal */
  }
}
