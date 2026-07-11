import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Comments for a post: fetch (oldest first), add (anonymous), delete (admin).
export function useComments(postId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) setError(error.message)
    else setComments(data ?? [])
    setLoading(false)
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const addComment = useCallback(
    async ({ author_name, body }) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, author_name, body })
        .select()
        .single()
      if (error) return { error }
      setComments((c) => [...c, data])
      return { data }
    },
    [postId],
  )

  const deleteComment = useCallback(async (id) => {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) return { error }
    setComments((c) => c.filter((x) => x.id !== id))
    return {}
  }, [])

  return { comments, loading, error, addComment, deleteComment, refetch: fetchComments }
}
