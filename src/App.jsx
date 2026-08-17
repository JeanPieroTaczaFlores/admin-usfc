import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Pending from './pages/auth/Pending'
import Recover from './pages/auth/Recover'
import Dashboard from './pages/client/Dashboard'
import AdminPanel from './pages/admin/AdminPanel'
import StaffPanel from './pages/staff/StaffPanel'

function ProtectedRoute({ children, roles }) {
  const { profile } = useAuth()
  if (!profile) return <Navigate to="/login" />
  if (roles && !roles.includes(profile.rol)) return <Navigate to="/dashboard" />
  return children
}

function PublicRoute({ children }) {
  const { profile } = useAuth()
  if (profile) {
    if (profile.rol === 'super_admin' || profile.rol === 'admin') return <Navigate to="/admin" />
    if (profile.rol === 'staff') return <Navigate to="/staff" />
    return <Navigate to="/dashboard" />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/pending" element={<Pending />} />
      <Route path="/recover" element={<Recover />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute roles={['super_admin', 'admin']}><AdminPanel /></ProtectedRoute>} />
      <Route path="/staff/*" element={<ProtectedRoute roles={['super_admin', 'admin', 'staff']}><StaffPanel /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  )
}
