import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Spin from '@/components/ui/Spin'

import LandingPage         from '@/pages/auth/LandingPage'
import RegisterPage        from '@/pages/auth/RegisterPage'
import PaymentPage         from '@/pages/auth/PaymentPage'
import LoginPage           from '@/pages/auth/LoginPage'

import DashboardLayout     from '@/layouts/DashboardLayout'
import DashboardPage       from '@/pages/dashboard/DashboardPage'
import CoursesPage         from '@/pages/dashboard/CoursesPage'
import CreateCoursePage    from '@/pages/dashboard/CreateCoursePage'
import MyCoursesPage       from '@/pages/dashboard/MyCoursesPage'
import EnrolledCoursesPage from '@/pages/dashboard/EnrolledCoursesPage'
import SessionsPage        from '@/pages/dashboard/SessionsPage'
import WalletPage          from '@/pages/dashboard/WalletPage'
import NotificationsPage   from '@/pages/dashboard/NotificationsPage'
import RatingsPage         from '@/pages/dashboard/RatingsPage'
import ProfilePage         from '@/pages/dashboard/ProfilePage'
import TeacherRequestPage  from '@/pages/dashboard/TeacherRequestPage'

function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin />
    </div>
  )
}

function Guard({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <Loading />
  return token ? children : <Navigate to="/login" replace />
}

function Public({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <Loading />
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/register" element={<Public><RegisterPage /></Public>} />
      <Route path="/payment"  element={<PaymentPage />} />
      <Route path="/login"    element={<Public><LoginPage /></Public>} />

      <Route element={<Guard><DashboardLayout /></Guard>}>
        <Route path="/dashboard"        element={<DashboardPage />} />
        <Route path="/profile"          element={<ProfilePage />} />
        <Route path="/teacher-request"  element={<TeacherRequestPage />} />
        <Route path="/wallet"           element={<WalletPage />} />
        <Route path="/courses"          element={<CoursesPage />} />
        <Route path="/create-course"    element={<CreateCoursePage />} />
        <Route path="/my-courses"       element={<MyCoursesPage />} />
        <Route path="/enrolled-courses" element={<EnrolledCoursesPage />} />
        <Route path="/sessions"         element={<SessionsPage />} />
        <Route path="/ratings"          element={<RatingsPage />} />
        <Route path="/notifications"    element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
