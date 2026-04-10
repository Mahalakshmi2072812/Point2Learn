import axios from 'axios'

// const API_BASE = import.meta.env.VITE_API_BASE
// console.log("BASE URL:", import.meta.env.VITE_API_BASE)
// const http = axios.create({ baseURL: API_BASE, timeout: 15000 })

const API_BASE = import.meta.env.VITE_API_BASE;

const http = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});


// 🔐 Attach token
http.interceptors.request.use(cfg => {
  const t = localStorage.getItem('p2l_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

// 🔁 Handle 401
http.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('p2l_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// 📦 FormData helper
const fd = obj => {
  const f = new FormData()
  Object.entries(obj).forEach(([k, v]) => {
    if (v != null && v !== '') f.append(k, String(v))
  })
  return f
}

//
// 🔐 MAIN AUTH (existing)
//
export const authRegister  = (name, email, password) =>
  http.post('/auth/register', ({ name, email, password })

export const authActivate  = email =>
  http.post('/auth/activate-payment', fd({ email }))

export const authLogin     = (email, password) =>
  http.post('/auth/login', { email, password })

export const authLogout    = () =>
  http.post('/auth/logout')

//
// 🛠️ ADMIN AUTH (NEW)
//
export const adminLogin = (email, password) =>
  axios.post(
    'https://point2learn-1.onrender.com/admin/login',
    { email, password }
  )

export const adminSignup = (email, password) =>
  axios.post(
    'https://point2learn-1.onrender.com/admin/signup',
    fd({ email, password })
  )

export const adminLogout = () =>
  axios.post('https://point2learn-1.onrender.com/admin/logout')

//
// 👤 USER
//
export const getProfile     = () => http.get('/user/profile')
export const requestTeacher = data => http.post('/user/request-teacher', fd(data))

//
// 🏠 HOME & WALLET
//
export const getHome   = () => http.get('/home/')
export const getWallet = () => http.get('/wallet/wallet/me')

//
// 📚 COURSES
//
export const getAllCourses       = () => http.get('/course/')
export const getMyCourses        = () => http.get('/course/my')
export const getEnrolledCourses  = () => http.get('/course/enrolled')

export const createCourse = (title, desc) =>
  http.post('/course/create?title=' + encodeURIComponent(title) + '&description=' + encodeURIComponent(desc))

export const joinCourse = id =>
  http.post('/course/join/' + id)

//
// 🎥 SESSIONS
//
export const startSession  = id => http.post('/session/start/' + id)
export const attendSession = id => http.post('/session/attend/' + id)
export const endSession    = id => http.post('/session/end/' + id)
export const removeStudent = (cid, sid) =>
  http.post('/session/remove-student/' + cid + '/' + sid)

//
// ⭐ RATINGS
//
export const addRating = (cid, rating, review) =>
  http.post('/rating/add/' + cid + '?rating=' + rating + '&review=' + encodeURIComponent(review))

export const getTeacherRatings = tid => http.get('/rating/teacher/' + tid)
export const getMyRating       = () => http.get('/rating/my')
export const deleteRating      = cid => http.delete('/rating/delete/' + cid)

//
// 🔔 NOTIFICATIONS
//
export const getNotifications = () => http.get('/notification/')
export const markRead         = id => http.post('/notification/read/' + id)
export const getUnreadCount   = () => http.get('/notification/unread-count')
export const deleteNotif      = id => http.delete('/notification/' + id)
