import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <div className="card w-full max-w-md fade-in">
        <h1 className="font-display text-3xl font-bold text-center mb-2">Iniciar Sesión</h1>
        <p className="text-base-400 text-center mb-6">Panel Administrativo USMCF</p>
        {error && <div className="bg-danger/20 text-danger p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" className="input" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</button>
        </form>
        <div className="mt-4 text-center text-sm space-y-2">
          <Link to="/register" className="text-accent hover:underline">¿No tienes cuenta? Regístrate</Link>
          <div><Link to="/recover" className="text-base-400 hover:text-white">¿Olvidaste tu contraseña?</Link></div>
        </div>
      </div>
    </div>
  )
}
