import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PanelLayout({ children, title, tabs, activeTab, onTabChange }) {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-base-950">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-base-800">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-display text-2xl font-bold text-accent">
            <img src="/logo.png" alt="USMCF" className="w-8 h-8 rounded-full" />
            USMCF
          </Link>
          <span className="text-base-500 text-sm">|</span>
          <span className="font-display text-lg">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-base-400 text-sm">{profile?.nombre} <span className="badge badge-admin text-xs">{profile?.rol}</span></span>
          <Link to="/dashboard" className="text-sm text-base-300 hover:text-white">Dashboard</Link>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">Salir</button>
        </div>
      </nav>
      {tabs && (
        <div className="border-b border-base-800 px-6">
          <div className="flex gap-1 -mb-px">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => onTabChange(tab.key)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-accent text-accent' : 'border-transparent text-base-400 hover:text-white'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 py-8 fade-in">{children}</div>
    </div>
  )
}
