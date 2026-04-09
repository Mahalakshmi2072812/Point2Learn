import { AuthProvider }  from '@/context/AuthContext'
import { ToastProvider } from '@/context/Toast'
import AppRoutes         from '@/routes/AppRoutes'
export default function App() {
  return <AuthProvider><ToastProvider><AppRoutes /></ToastProvider></AuthProvider>
}