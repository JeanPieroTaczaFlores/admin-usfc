import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import PanelLayout from '../../components/PanelLayout'
import { useAuth } from '../../context/AuthContext'

const RANGOS = ['Civil','Recruta','Soldado','Cabo','Sargento','Sargento 1ro','Sargento Mayor','Tte. Cvto','Cvto','1er Cvto','Suboficial','Suboficial 1ro','Suboficial Mayor','Suboficial Superior','Alferez','1er Alferez','Capitan','May. batallon','Cnl. batallon','Coronel','General de brigada','General division','General ejercito']

export default function StaffPanel() {
  const { profile } = useAuth()
  const [tab, setTab] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [misiones, setMisiones] = useState([])
  const [opiniones, setOpiniones] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(null)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')

  const tabs = [
    { key:'usuarios', label:'Usuarios (Puntos)' },
    { key:'misiones', label:'Misiones' },
    { key:'opiniones', label:'Opiniones' },
    { key:'movimientos', label:'Actividad' },
  ]

  useEffect(() => { loadData() }, [tab])

  const loadData = async () => {
    if (tab === 'usuarios') {
      let q = supabase.from('usuarios').select('*').order('created_at', { ascending: false })
      if (search) q = q.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,email.ilike.%${search}%`)
      const { data } = await q; setUsuarios(data || [])
    }
    if (tab === 'misiones') { const { data } = await supabase.from('misiones').select('*').order('created_at', { ascending: false }); setMisiones(data || []) }
    if (tab === 'opiniones') { const { data } = await supabase.from('opiniones').select('*, usuarios(nombre, apellido)').order('created_at', { ascending: false }); setOpiniones(data || []) }
    if (tab === 'movimientos') { const { data } = await supabase.from('movimientos').select('*, usuarios(nombre, apellido)').order('created_at', { ascending: false }); setMovimientos(data || []) }
  }

  useEffect(() => { if (tab === 'usuarios') loadData() }, [search])

  const handleGrant = async (e) => {
    e.preventDefault(); setMsg('')
    const user = usuarios.find(u => u.id === form.user_id)
    if (!user) return
    const update = {}
    if (form.creditos) update.creditos = (user.creditos||0) + parseInt(form.creditos)
    if (form.monedas) update.monedas = (user.monedas||0) + parseInt(form.monedas)
    if (form.nivel) update.nivel = (user.nivel||0) + parseInt(form.nivel)
    if (form.xp) update.xp = (user.xp||0) + parseInt(form.xp)
    if (form.rango) update.rango = form.rango

    const { error } = await supabase.from('usuarios').update(update).eq('id', form.user_id)
    if (error) { setMsg(error.message); return }

    await supabase.from('movimientos').insert({
      usuario_id: form.user_id,
      tipo: 'asignacion_staff',
      monto: parseInt(form.creditos || form.monedas || form.nivel || form.xp || 0),
      descripcion: `${profile.nombre} ${profile.apellido} otorgó recursos a ${user.nombre} ${user.apellido}`
    })

    setMsg(`Recursos otorgados a ${user.nombre} ${user.apellido}`)
    setShowModal(null); setForm({}); loadData()
  }

  const handleMissionSubmit = async (e) => {
    e.preventDefault(); setMsg('')
    if (form.id) { await supabase.from('misiones').update(form).eq('id', form.id) }
    else { await supabase.from('misiones').insert({ ...form, creador_id: profile.id }) }
    setMsg('Misión guardada'); setShowModal(null); setForm({}); loadData()
  }

  const openGrant = (u) => { setForm({ user_id: u.id, creditos:'', monedas:'', nivel:'', xp:'', rango:'' }); setShowModal('grant') }

  return (
    <PanelLayout title="Staff Panel" tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {msg && <div className="bg-success/20 text-success p-3 rounded-lg mb-4 text-sm">{msg}</div>}

      {tab === 'usuarios' && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <input className="input max-w-xs" placeholder="Buscar usuario..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Usuario</th><th>Email</th><th>Rango</th><th>Nivel</th><th>XP</th><th>Créditos</th><th>Monedas</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.nombre} {u.apellido}</td>
                    <td className="text-base-400 text-sm">{u.email}</td>
                    <td>{u.rango||'Civil'}</td>
                    <td className="text-accent">{u.nivel}</td>
                    <td className="text-blue-400">{(u.xp||0).toLocaleString()}</td>
                    <td className="text-success">{(u.creditos||0).toLocaleString()}</td>
                    <td className="text-warning">{(u.monedas||0).toLocaleString()}</td>
                    <td><span className={`badge ${u.estado==='activo'?'badge-active':u.estado==='pendiente'?'badge-pending':'badge-banned'}`}>{u.estado}</span></td>
                    <td><button onClick={() => openGrant(u)} className="btn btn-primary btn-sm">Dar Puntos</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'misiones' && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => { setForm({}); setShowModal('mission') }} className="btn btn-primary btn-sm">+ Nueva Misión</button>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Título</th><th>Tipo</th><th>Dificultad</th><th>XP</th><th>Créditos</th><th>Estado</th></tr></thead>
              <tbody>
                {misiones.map(m => (
                  <tr key={m.id}>
                    <td className="font-medium">{m.titulo}</td><td>{m.tipo}</td>
                    <td><span className={`badge ${m.dificultad==='elite'?'badge-admin':'badge-pending'}`}>{m.dificultad}</span></td>
                    <td className="text-accent">{m.recompensa_xp}</td><td className="text-success">{m.recompensa_creditos}</td>
                    <td><span className={`badge ${m.estado==='activa'?'badge-active':'badge-pending'}`}>{m.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'opiniones' && (
        <div className="space-y-4">
          {opiniones.map(op => (
            <div key={op.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">{op.usuarios?.nombre} {op.usuarios?.apellido}</span>
                  <span className="text-accent ml-3">{'⭐'.repeat(op.calificacion)}</span>
                </div>
                <span className={`badge ${op.estado==='aprobada'?'badge-active':'badge-pending'}`}>{op.estado}</span>
              </div>
              {op.titulo && <h4 className="font-semibold text-sm mb-1">{op.titulo}</h4>}
              <p className="text-base-300 text-sm">{op.contenido}</p>
              {op.admin_respuesta && <div className="mt-2 p-2 bg-base-800 rounded text-xs border-l-2 border-accent"><strong className="text-accent">Staff:</strong> {op.admin_respuesta}</div>}
              <div className="mt-3 flex gap-2">
                <input className="input text-sm py-1.5" placeholder="Responder..." id={`reply-${op.id}`} />
                <button onClick={async () => { await supabase.from('opiniones').update({ admin_respuesta: document.getElementById(`reply-${op.id}`).value }).eq('id', op.id); loadData() }} className="btn btn-primary btn-sm">Responder</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'movimientos' && (
        <div className="table-container">
          <table>
            <thead><tr><th>Fecha</th><th>Usuario</th><th>Tipo</th><th>Monto</th><th>Descripción</th></tr></thead>
            <tbody>
              {movimientos.map(m => (
                <tr key={m.id}>
                  <td className="text-xs text-base-400">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="font-medium">{m.usuarios?.nombre} {m.usuarios?.apellido}</td>
                  <td><span className="badge badge-admin">{m.tipo}</span></td>
                  <td className="text-accent font-bold">{m.monto > 0 ? '+':''}{m.monto?.toLocaleString()}</td>
                  <td className="text-base-400 text-sm">{m.descripcion}</td>
                </tr>
              ))}
              {movimientos.length === 0 && <tr><td colSpan={5} className="text-center text-base-500 py-8">Sin movimientos</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal === 'grant' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold mb-2">Otorgar Puntos</h2>
            <p className="text-base-400 text-sm mb-4">Usuario: <span className="text-white font-medium">{usuarios.find(u=>u.id===form.user_id)?.nombre} {usuarios.find(u=>u.id===form.user_id)?.apellido}</span></p>
            <form onSubmit={handleGrant} className="space-y-3">
              <div><label className="text-sm text-base-400 mb-1 block">Créditos</label><input type="number" className="input" placeholder="Ej: 500" value={form.creditos||''} onChange={e => setForm(p=>({...p, creditos:e.target.value}))} /></div>
              <div><label className="text-sm text-base-400 mb-1 block">Monedas</label><input type="number" className="input" placeholder="Ej: 50" value={form.monedas||''} onChange={e => setForm(p=>({...p, monedas:e.target.value}))} /></div>
              <div><label className="text-sm text-base-400 mb-1 block">Nivel</label><input type="number" className="input" placeholder="Ej: 5" value={form.nivel||''} onChange={e => setForm(p=>({...p, nivel:e.target.value}))} /></div>
              <div><label className="text-sm text-base-400 mb-1 block">XP</label><input type="number" className="input" placeholder="Ej: 1000" value={form.xp||''} onChange={e => setForm(p=>({...p, xp:e.target.value}))} /></div>
              <div><label className="text-sm text-base-400 mb-1 block">Rango</label>
                <select className="input" value={form.rango||''} onChange={e => setForm(p=>({...p, rango:e.target.value}))}>
                  <option value="">Sin cambio</option>{RANGOS.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-4"><button type="submit" className="btn btn-primary">Otorgar</button><button type="button" onClick={()=>setShowModal(null)} className="btn btn-secondary">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'mission' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold mb-4">Nueva Misión</h2>
            <form onSubmit={handleMissionSubmit} className="space-y-3">
              <input className="input" placeholder="Título" value={form.titulo||''} onChange={e=>setForm(p=>({...p,titulo:e.target.value}))} required />
              <textarea className="input" rows={3} placeholder="Descripción" value={form.descripcion||''} onChange={e=>setForm(p=>({...p,descripcion:e.target.value}))} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={form.tipo||'general'} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}>
                  <option value="general">General</option><option value="combate">Combate</option><option value="entrenamiento">Entrenamiento</option><option value="exploracion">Exploración</option><option value="especial">Especial</option>
                </select>
                <select className="input" value={form.dificultad||'normal'} onChange={e=>setForm(p=>({...p,dificultad:e.target.value}))}>
                  <option value="facil">Fácil</option><option value="normal">Normal</option><option value="dificil">Difícil</option><option value="elite">Élite</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" className="input" placeholder="XP" value={form.recompensa_xp||''} onChange={e=>setForm(p=>({...p,recompensa_xp:+e.target.value}))} />
                <input type="number" className="input" placeholder="Créditos" value={form.recompensa_creditos||''} onChange={e=>setForm(p=>({...p,recompensa_creditos:+e.target.value}))} />
                <input type="number" className="input" placeholder="Monedas" value={form.recompensa_monedas||''} onChange={e=>setForm(p=>({...p,recompensa_monedas:+e.target.value}))} />
              </div>
              <div className="flex gap-3 mt-4"><button type="submit" className="btn btn-primary">Crear</button><button type="button" onClick={()=>setShowModal(null)} className="btn btn-secondary">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}
    </PanelLayout>
  )
}
