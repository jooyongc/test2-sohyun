// Stable per-browser identifier used to track anonymous likes without accounts.
// Stored in localStorage; not personally identifying (a random UUID).
const KEY = 'hdt_visitor_id'

export function getVisitorId() {
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}
