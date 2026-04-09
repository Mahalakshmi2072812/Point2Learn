import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE;
const http = axios.create({ baseURL: API_BASE, timeout: 15000 });

http.interceptors.request.use(cfg => {
  const t = localStorage.getItem('p2l_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

http.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) { localStorage.removeItem('p2l_token'); window.location.href = '/login' }
  return Promise.reject(err)
})

const fd = obj => {
  const f = new FormData()
  Object.entries(obj).forEach(([k, v]) => { if (v != null && v !== '') f.append(k, String(v)) })
  return f
}

// AUTH
export const authRegister  = (name, email, password) => http.post('/auth/register', fd({ name, email, password }))
export const authActivate  = email => http.post('/auth/activate-payment', fd({ email }))
export const authLogin     = (email, password) => http.post('/auth/login', fd({ email, password }))
export const authLogout    = () => http.post('/auth/logout')
export const forgotPassword    = email => http.post('/auth/forgot-password', { email })
export const validateResetToken = token => http.get('/auth/reset-password/' + token)
export const confirmResetPassword = (token, new_password) => http.post('/auth/reset-password/' + token, { new_password })

// USER
export const getProfile     = () => http.get('/user/profile')
export const requestTeacher = data => http.post('/user/request-teacher', fd(data))

// HOME & WALLET
export const getHome   = () => http.get('/home/')
export const getWallet = () => http.get('/wallet/wallet/me')

// COURSES
export const getAllCourses      = () => http.get('/course/')
export const getMyCourses      = () => http.get('/course/my')
export const getEnrolledCourses = () => http.get('/course/enrolled')
export const createCourse      = (title, desc, session_timing) => http.post('/course/create?title=' + encodeURIComponent(title) + '&description=' + encodeURIComponent(desc) + '&session_timing=' + encodeURIComponent(session_timing || ''))
export const joinCourse        = id => http.post('/course/join/' + id)

// SESSIONS
export const getActiveSession = id => http.get('/session/active/' + id)
export const startSession  = id => http.post('/session/start/' + id)
export const attendSession = id => http.post('/session/attend/' + id)
export const endSession    = id => http.post('/session/end/' + id)
export const removeStudent = (cid, sid) => http.post('/session/remove-student/' + cid + '/' + sid)

// RATINGS
export const addRating         = (cid, rating, review) => http.post('/rating/add/' + cid + '?rating=' + rating + '&review=' + encodeURIComponent(review))
export const getTeacherRatings = tid => http.get('/rating/teacher/' + tid)
export const getMyRating       = () => http.get('/rating/my')
export const deleteRating      = cid => http.delete('/rating/delete/' + cid)

// NOTIFICATIONS
export const getNotifications = () => http.get('/notification/')
export const markRead         = id => http.post('/notification/read/' + id)
export const getUnreadCount   = () => http.get('/notification/unread-count')
export const deleteNotif      = id => http.delete('/notification/' + id)
export const testNotification = () => http.post('/notification/test')
export const debugNotification = () => http.get('/notification/debug')

// HEARTBEAT
export const sendHeartbeat    = () => http.post('/user/heartbeat')

// ADMIN
export const getAdminStats          = () => http.get('/admin/stats')
export const getAdminUsers          = () => http.get('/admin/users')
export const getTeacherRequests     = () => http.get('/admin/teacher-requests')
export const approveTeacher         = id => http.post('/admin/approve-teacher/' + id)
export const rejectTeacher          = (id, reason) => http.post('/admin/reject-teacher/' + id + '?reason=' + encodeURIComponent(reason || ''))
export const sendAdminNotification  = (uid, title, msg) => http.post('/admin/send-notification/' + uid + '?title=' + encodeURIComponent(title) + '&message=' + encodeURIComponent(msg))
export const broadcastNotification  = (title, msg) => http.post('/admin/broadcast-notification?title=' + encodeURIComponent(title) + '&message=' + encodeURIComponent(msg))
