import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getVisitorId } from '../lib/visitor'

// Anonymous like toggle for a post. Count comes from the likes table;
// "liked" reflects whether this browser (visitor_id) already liked it.
export function useLikes(postId) {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const visitorId = getVisitorId()
    const [{ count: total }, { data: mine }] = await Promise.all([
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId),
      supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('visitor_id', visitorId)
        .maybeSingle(),
    ])
    setCount(total ?? 0)
    setLiked(Boolean(mine))
    setLoading(false)
  }, [postId])

  useEffect(() => {
    load()
  }, [load])

  const toggle = useCallback(async () => {
    if (busy) return
    setBusy(true)
    const visitorId = getVisitorId()
    const wasLiked = liked

    // Optimistic update.
    setLiked(!wasLiked)
    setCount((n) => (wasLiked ? Math.max(0, n - 1) : n + 1))

    const { error } = wasLiked
      ? await supabase.from('likes').delete().eq('post_id', postId).eq('visitor_id', visitorId)
      : await supabase.from('likes').insert({ post_id: postId, visitor_id: visitorId })

    // On error (e.g. race / unique violation), reconcile with the server.
    if (error) await load()
    setBusy(false)
  }, [busy, liked, postId, load])

  return { count, liked, loading, toggle }
}
