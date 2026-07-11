import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Suggests other posts to explore after reading one.
// Prefers posts from the same district; falls back to recent posts when there
// are none in that area (or the post has no district). Returns { related, sameDistrict }.
export function useRelatedPosts(post, limit = 3) {
  const [related, setRelated] = useState([])
  const [sameDistrict, setSameDistrict] = useState(false)

  const id = post?.id
  const district = post?.district

  useEffect(() => {
    if (!id) return
    let active = true

    async function run() {
      // 1) same district
      if (district) {
        const { data } = await supabase
          .from('posts')
          .select('*')
          .eq('district', district)
          .neq('id', id)
          .order('created_at', { ascending: false })
          .limit(limit)
        if (!active) return
        if (data && data.length) {
          setRelated(data)
          setSameDistrict(true)
          return
        }
      }
      // 2) fallback: recent others
      const { data } = await supabase
        .from('posts')
        .select('*')
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (!active) return
      setRelated(data ?? [])
      setSameDistrict(false)
    }

    run()
    return () => {
      active = false
    }
  }, [id, district, limit])

  return { related, sameDistrict }
}
