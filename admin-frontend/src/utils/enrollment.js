// Backend has no enrolled-courses endpoint.
// We track enrolled course IDs in localStorage after a successful joinCourse() call.
const KEY = 'p2l_enrolled_courses'

export const getEnrolledIds = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export const addEnrolledId = id => {
  const ids = getEnrolledIds()
  if (!ids.includes(String(id))) {
    localStorage.setItem(KEY, JSON.stringify([...ids, String(id)]))
  }
}
