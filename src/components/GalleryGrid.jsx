import PostCard from './PostCard'

// Masonry-style responsive gallery via CSS columns (see .masonry in index.css).
export default function GalleryGrid({ posts }) {
  return (
    <div className="masonry columns-1 sm:columns-2 lg:columns-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
