import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Fetch the full list of posts (newest first).
export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setPosts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return { posts, loading, error, refetch: fetchPosts }
}

// Fetch a single post by id.
export function usePost(id) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(error.message)
        else setPost(data)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  return { post, loading, error }
}
