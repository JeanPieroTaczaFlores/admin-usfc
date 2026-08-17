import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const RANGOS = [
  { nombre:'Civil', salario:0, nivel:1 },{ nombre:'Recruta', salario:100, nivel:1 },{ nombre:'Soldado', salario:250, nivel:3 },
  { nombre:'Cabo', salario:500, nivel:5 },{ nombre:'Sargento', salario:1000, nivel:10 },{ nombre:'Sargento 1ro', salario:1500, nivel:15 },
  { nombre:'Sargento Mayor', salario:2500, nivel:20 },{ nombre:'Tte. Cvto', salario:3500, nivel:25 },{ nombre:'Cvto', salario:5000, nivel:30 },
  { nombre:'1er Cvto', salario:7000, nivel:35 },{ nombre:'Suboficial', salario:9000, nivel:40 },{ nombre:'Suboficial 1ro', salario:12000, nivel:45 },
  { nombre:'Suboficial Mayor', salario:16000, nivel:50 },{ nombre:'Suboficial Superior', salario:21000, nivel:55 },{ nombre:'Alferez', salario:27000, nivel:60 },
  { nombre:'1er Alferez', salario:34000, nivel:65 },{ nombre:'Capitan', salario:42000, nivel:70 },{ nombre:'May. batallon', salario:52000, nivel:75 },
  { nombre:'Cnl. batallon', salario:65000, nivel:80 },{ nombre:'Coronel', salario:80000, nivel:85 },{ nombre:'General de brigada', salario:100000, nivel:90 },
  { nombre:'General division', salario:125000, nivel:95 },{ nombre:'General ejercito', salario:150000, nivel:100 },
]

export default function Dashboard() {
  const { profile, logout, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [opinionForm, setOpinionForm] = useState({ titulo: '', contenido: '', calificacion: 5 })
  const [opinionMsg, setOpinionMsg] = useState('')
  const [misiones, setMisiones] = useState([])

  const rangoActual = [...RANGOS].reverse().find(r => (profile?.nivel || 0) >= r.nivel) || RANGOS[0]
  const nextRango = RANGOS.find(r => r.nivel > (profile?.nivel || 0))

  useEffect(() => {
    refreshProfile()
    supabase.from('misiones').select('*').eq('estado', 'activa').then(({ data }) => setMisiones(data || []))
  }, [])

  const handleOpinion = async (e) => {
    e.preventDefault()
    setOpinionMsg('')
    const { error } = await supabase.from('opiniones').insert({ usuario_id: profile.id, titulo: opinionForm.titulo, contenido: opinionForm.contenido, calificacion: opinionForm.calificacion, estado: 'aprobada' })
    if (error) setOpinionMsg(error.message)
    else { setOpinionMsg('Opinión publicada'); setOpinionForm({ titulo: '', contenido: '', calificacion: 5 }) }
  }

  const handleLogout = async () => { await logout(); navigate('/login') }
  if (!profile) return null

  return (
    <div className="min-h-screen bg-base-950">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-base-800">
        <span className="font-display text-2xl font-bold text-accent">USMCF Admin</span>
        <div className="flex items-center gap-4">
          <span className="text-base-400 text-sm">Hola, <span className="text-white font-medium">{profile.nombre}</span></span>
          {(profile.rol === 'super_admin' || profile.rol === 'admin') && <a href="#/admin" className="text-sm text-accent hover:underline">Admin</a>}
          {(profile.rol === 'super_admin' || profile.rol === 'admin' || profile.rol === 'staff') && <a href="#/staff" className="text-sm text-blue-400 hover:underline">Staff</a>}
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">Salir</button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-8 fade-in">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-base-700 rounded-full flex items-center justify-center text-accent font-display text-2xl font-bold">{profile.nombre?.[0]}{profile.apellido?.[0]}</div>
          <div>
            <h1 className="font-display text-2xl font-bold">{profile.nombre} {profile.apellido}</h1>
            <p className="text-accent">{profile.rango || rangoActual.nombre} — Nivel {profile.nivel}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[{ label:'Nivel', value:profile.nivel, color:'text-accent' },{ label:'XP', value:profile.xp||0, color:'text-blue-400' },{ label:'Créditos', value:profile.creditos||0, color:'text-success' },{ label:'Monedas', value:profile.monedas||0, color:'text-warning' }].map((s,i) => (
            <div key={i} className="card text-center"><p className="text-base-500 text-xs uppercase">{s.label}</p><p className={`font-display text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p></div>
          ))}
        </div>
        {nextRango && (
          <div className="card mb-8">
            <h3 className="font-semibold mb-2">Progreso: {nextRango.nombre}</h3>
            <div className="w-full bg-base-800 rounded-full h-3"><div className="bg-accent h-3 rounded-full transition-all" style={{ width:`${Math.min(100, ((profile.nivel - rangoActual.nivel) / (nextRango.nivel - rangoActual.nivel)) * 100)}%` }} /></div>
            <p className="text-base-500 text-xs mt-1">Nivel {profile.nivel} / {nextRango.nivel}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-display text-lg font-semibold mb-4">Publicar Opinión</h3>
            {opinionMsg && <p className="text-sm text-success mb-3">{opinionMsg}</p>}
            <form onSubmit={handleOpinion} className="space-y-3">
              <input className="input" placeholder="Título (opcional)" value={opinionForm.titulo} onChange={e => setOpinionForm(p => ({ ...p, titulo: e.target.value }))} />
              <textarea className="input" rows={3} placeholder="Tu opinión..." value={opinionForm.contenido} onChange={e => setOpinionForm(p => ({ ...p, contenido: e.target.value }))} required />
              <div className="flex items-center gap-2"><span className="text-sm text-base-400">Calificación:</span>
                {[1,2,3,4,5].map(n => <button key={n} type="button" onClick={() => setOpinionForm(p => ({ ...p, calificacion: n }))} className={`text-xl ${n <= opinionForm.calificacion ? 'text-accent' : 'text-base-600'}`}>★</button>)}
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Publicar</button>
            </form>
          </div>
          <div className="card">
            <h3 className="font-display text-lg font-semibold mb-4">Misiones Activas</h3>
            {misiones.length === 0 ? <p className="text-base-500 text-sm">No hay misiones activas.</p> : (
              <div className="space-y-3">
                {misiones.slice(0,5).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-base-800 rounded-lg">
                    <div><p className="font-medium text-sm">{m.titulo}</p><p className="text-base-500 text-xs">{m.tipo} — {m.dificultad}</p></div>
                    <div className="text-right text-xs">{m.recompensa_xp > 0 && <span className="text-accent">+{m.recompensa_xp} XP</span>}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
