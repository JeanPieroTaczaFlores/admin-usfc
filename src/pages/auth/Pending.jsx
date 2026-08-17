import { Link } from 'react-router-dom'

export default function Pending() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <div className="card w-full max-w-md text-center fade-in">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="font-display text-2xl font-bold mb-2">Cuenta Pendiente</h2>
        <p className="text-base-400 mb-6">Espera aprobación de un administrador.</p>
        <Link to="/login" className="btn btn-primary">Volver al Login</Link>
      </div>
    </div>
  )
}
