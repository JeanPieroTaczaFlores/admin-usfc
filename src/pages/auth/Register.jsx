import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', nombre: '', apellido: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register } = useAuth()

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.nombre, form.apellido)
      setSuccess(true)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <div className="card w-full max-w-md text-center fade-in">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-display text-2xl font-bold mb-2">Registro Exitoso</h2>
        <p className="text-base-400 mb-4">Tu cuenta está pendiente de aprobación.</p>
        <Link to="/login" className="btn btn-primary">Ir al Login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <div className="card w-full max-w-md fade-in">
        <h1 className="font-display text-3xl font-bold text-center mb-2">Crear Cuenta</h1>
        <p className="text-base-400 text-center mb-6">Únete a la USMCF</p>
        {error && <div className="bg-danger/20 text-danger p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Nombre" value={form.nombre} onChange={e => update('nombre', e.target.value)} required />
            <input className="input" placeholder="Apellido" value={form.apellido} onChange={e => update('apellido', e.target.value)} required />
          </div>
          <input type="email" className="input" placeholder="Email" value={form.email} onChange={e => update('email', e.target.value)} required />
          <input type="password" className="input" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} />
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Creando...' : 'Crear Cuenta'}</button>
        </form>
        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-accent hover:underline">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </div>
    </div>
  )
}
