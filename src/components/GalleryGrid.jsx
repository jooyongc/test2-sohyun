import PostCard from './PostCard'

// Masonry-style responsive gallery via CSS columns (see .masonry in index.css).
// `startNumber` sets the first card's index (home passes 2 since the hero is 01).
export default function GalleryGrid({ posts, startNumber = 1 }) {
  return (
    <div className="masonry columns-1 sm:columns-2 lg:columns-3">
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} number={startNumber + i} />
      ))}
    </div>
  )
}
