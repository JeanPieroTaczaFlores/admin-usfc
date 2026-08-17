import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Recover() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <div className="card w-full max-w-md fade-in">
        <h1 className="font-display text-3xl font-bold text-center mb-2">Recuperar Contraseña</h1>
        <p className="text-base-400 text-center mb-6">Te enviaremos un enlace de recuperación</p>
        {error && <div className="bg-danger/20 text-danger p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-success mb-4">Si el email existe, recibirás un enlace.</p>
            <Link to="/login" className="btn btn-primary">Volver al Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" className="input" placeholder="Tu email" value={email} onChange={e => setEmail(e.target.value)} required />
            <button type="submit" className="btn btn-primary w-full">Enviar Enlace</button>
          </form>
        )}
        <Link to="/login" className="block text-center mt-4 text-base-500 hover:text-white text-sm">← Volver al login</Link>
      </div>
    </div>
  )
}
