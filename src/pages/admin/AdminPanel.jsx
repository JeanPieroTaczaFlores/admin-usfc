import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import PanelLayout from '../../components/PanelLayout'

const RANGOS = ['Civil','Recruta','Soldado','Cabo','Sargento','Sargento 1ro','Sargento Mayor','Tte. Cvto','Cvto','1er Cvto','Suboficial','Suboficial 1ro','Suboficial Mayor','Suboficial Superior','Alferez','1er Alferez','Capitan','May. batallon','Cnl. batallon','Coronel','General de brigada','General division','General ejercito']
const ROLES = ['super_admin','admin','staff','usuario']
const ESTADOS = ['activo','pendiente','baneado']

export default function AdminPanel() {
  const [tab, setTab] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [misiones, setMisiones] = useState([])
  const [items, setItems] = useState([])
  const [opiniones, setOpiniones] = useState([])
  const [roles, setRoles] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [search, setSearch] = useState('')
  const [filterRol, setFilterRol] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [showModal, setShowModal] = useState(null)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')

  const tabs = [
    { key:'usuarios', label:'Usuarios' },{ key:'misiones', label:'Misiones' },{ key:'tienda', label:'Tienda' },
    { key:'opiniones', label:'Opiniones' },{ key:'roles', label:'Roles' },{ key:'movimientos', label:'Actividad' },
  ]

  useEffect(() => { loadData() }, [tab])

  const loadData = async () => {
    if (tab === 'usuarios') {
      let q = supabase.from('usuarios').select('*', { count: 'exact' }).order('created_at', { ascending: false })
      if (search) q = q.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,email.ilike.%${search}%`)
      if (filterRol) q = q.eq('rol', filterRol)
      if (filterEstado) q = q.eq('estado', filterEstado)
      const { data } = await q; setUsuarios(data || [])
    }
    if (tab === 'misiones') { const { data } = await supabase.from('misiones').select('*').order('created_at', { ascending: false }); setMisiones(data || []) }
    if (tab === 'tienda') { const { data } = await supabase.from('tienda_items').select('*').order('created_at', { ascending: false }); setItems(data || []) }
    if (tab === 'opiniones') { const { data } = await supabase.from('opiniones').select('*, usuarios(nombre, apellido)').order('created_at', { ascending: false }); setOpiniones(data || []) }
    if (tab === 'roles') { const { data } = await supabase.from('roles').select('*').order('nivel', { ascending: false }); setRoles(data || []) }
    if (tab === 'movimientos') { const { data } = await supabase.from('movimientos').select('*, usuarios(nombre, apellido)').order('created_at', { ascending: false }); setMovimientos(data || []) }
  }

  useEffect(() => { if (tab === 'usuarios') loadData() }, [search, filterRol, filterEstado])

  const handleUserSubmit = async (e) => {
    e.preventDefault(); setMsg('')
    if (form.id) {
      const update = { ...form }; delete update.id; delete update.created_at; delete update.updated_at; delete update.email
      if (!update.password) delete update.password
      const { error } = await supabase.from('usuarios').update(update).eq('id', form.id)
      if (error) { setMsg(error.message); return }
    } else {
      const { data: existing } = await supabase.from('usuarios').select('id').eq('email', form.email).single()
      if (existing) { setMsg('Ya existe un perfil con ese email'); return }
      const { error } = await supabase.from('usuarios').insert({
        id: crypto.randomUUID(), email: form.email, nombre: form.nombre,
        apellido: form.apellido, rol: form.rol, estado: form.estado,
        rango: form.rango, nivel: form.nivel, creditos: form.creditos || 0, monedas: form.monedas || 0, xp: 0
      })
      if (error) { setMsg(error.message); return }
    }
    setMsg(form.id ? 'Usuario actualizado' : 'Perfil creado. El usuario debe registrarse desde la página de Registro para activar su cuenta.'); setShowModal(null); setForm({}); loadData()
  }

  const handleMissionSubmit = async (e) => {
    e.preventDefault(); setMsg('')
    if (form.id) { await supabase.from('misiones').update(form).eq('id', form.id) }
    else { await supabase.from('misiones').insert(form) }
    setMsg('Misión guardada'); setShowModal(null); setForm({}); loadData()
  }

  const handleItemSubmit = async (e) => {
    e.preventDefault(); setMsg('')
    if (form.id) { await supabase.from('tienda_items').update(form).eq('id', form.id) }
    else { await supabase.from('tienda_items').insert(form) }
    setMsg('Item guardado'); setShowModal(null); setForm({}); loadData()
  }

  const handleRoleSubmit = async (e) => {
    e.preventDefault(); setMsg('')
    if (form.id) { await supabase.from('roles').update({ nombre: form.nombre, nivel: form.nivel }).eq('id', form.id) }
    else { await supabase.from('roles').insert({ nombre: form.nombre, nivel: form.nivel }) }
    setMsg('Rol guardado'); setShowModal(null); setForm({}); loadData()
  }

  const handleDelete = async (table, id) => {
    if (!confirm('¿Eliminar?')) return
    await supabase.from(table).delete().eq('id', id); loadData()
  }

  return (
    <PanelLayout title="Admin Panel" tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {msg && <div className="bg-success/20 text-success p-3 rounded-lg mb-4 text-sm">{msg}</div>}

      {tab === 'usuarios' && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[{ l:'TOTAL', v:usuarios.length, c:'text-white' },{ l:'ACTIVOS', v:usuarios.filter(u=>u.estado==='activo').length, c:'text-success' },{ l:'PENDIENTES', v:usuarios.filter(u=>u.estado==='pendiente').length, c:'text-warning' },{ l:'BANEADOS', v:usuarios.filter(u=>u.estado==='baneado').length, c:'text-danger' }].map((s,i)=>(
              <div key={i} className="card text-center"><p className="text-base-500 text-xs">{s.l}</p><p className={`font-display text-2xl font-bold ${s.c}`}>{s.v}</p></div>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <input className="input max-w-xs" placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} />
            <select className="input max-w-[150px]" value={filterRol} onChange={e=>setFilterRol(e.target.value)}><option value="">Todos los roles</option>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select>
            <select className="input max-w-[150px]" value={filterEstado} onChange={e=>setFilterEstado(e.target.value)}><option value="">Todos</option>{ESTADOS.map(e=><option key={e} value={e}>{e}</option>)}</select>
            <button onClick={()=>{setForm({email:'',password:'',nombre:'',apellido:'',rol:'usuario',estado:'activo',rango:'Civil',nivel:1,creditos:0,monedas:0});setShowModal('user')}} className="btn btn-primary btn-sm">+ Crear Usuario</button>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Rango</th><th>Nivel</th><th>Créditos</th><th>Monedas</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {usuarios.map(u=>(
                  <tr key={u.id}>
                    <td className="font-medium">{u.nombre} {u.apellido}</td><td className="text-base-400 text-sm">{u.email}</td>
                    <td><span className={`badge ${u.rol==='super_admin'||u.rol==='admin'?'badge-admin':u.rol==='staff'?'badge-staff':''}`}>{u.rol}</span></td>
                    <td>{u.rango||'Civil'}</td><td className="text-accent">{u.nivel}</td><td className="text-success">{(u.creditos||0).toLocaleString()}</td><td className="text-warning">{(u.monedas||0).toLocaleString()}</td>
                    <td><span className={`badge ${u.estado==='activo'?'badge-active':u.estado==='pendiente'?'badge-pending':'badge-banned'}`}>{u.estado}</span></td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={()=>{setForm({...u,password:''});setShowModal('user')}} className="text-accent text-xs hover:underline">Editar</button>
                        <button onClick={()=>{setForm({user_id:u.id,creditos:'',monedas:'',nivel:'',xp:'',rango:''});setShowModal('grant')}} className="text-success text-xs hover:underline">Recursos</button>
                        {u.estado==='pendiente'&&<button onClick={async()=>{await supabase.from('usuarios').update({estado:'activo'}).eq('id',u.id);loadData()}} className="text-success text-xs hover:underline">Aprobar</button>}
                        {u.estado==='activo'&&<button onClick={async()=>{await supabase.from('usuarios').update({estado:'baneado'}).eq('id',u.id);loadData()}} className="text-danger text-xs hover:underline">Banear</button>}
                        <button onClick={()=>handleDelete('usuarios',u.id)} className="text-danger text-xs hover:underline">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuarios.length===0&&<tr><td colSpan={9} className="text-center text-base-500 py-8">Sin usuarios</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'misiones' && (
        <>
          <div className="flex items-center gap-3 mb-6"><button onClick={()=>{setForm({});setShowModal('mission')}} className="btn btn-primary btn-sm">+ Nueva Misión</button></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Título</th><th>Tipo</th><th>Dificultad</th><th>XP</th><th>Créditos</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {misiones.map(m=>(
                  <tr key={m.id}>
                    <td className="font-medium">{m.titulo}</td><td>{m.tipo}</td>
                    <td><span className={`badge ${m.dificultad==='elite'?'badge-admin':'badge-pending'}`}>{m.dificultad}</span></td>
                    <td className="text-accent">{m.recompensa_xp}</td><td className="text-success">{m.recompensa_creditos}</td>
                    <td><span className={`badge ${m.estado==='activa'?'badge-active':'badge-pending'}`}>{m.estado}</span></td>
                    <td><div className="flex gap-2"><button onClick={()=>{setForm(m);setShowModal('mission')}} className="text-accent text-xs hover:underline">Editar</button><button onClick={()=>handleDelete('misiones',m.id)} className="text-danger text-xs hover:underline">Eliminar</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'tienda' && (
        <>
          <div className="flex items-center gap-3 mb-6"><button onClick={()=>{setForm({});setShowModal('item')}} className="btn btn-primary btn-sm">+ Nuevo Item</button></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Nombre</th><th>Tipo</th><th>Créditos</th><th>Monedas</th><th>Stock</th><th>Acciones</th></tr></thead>
              <tbody>
                {items.map(it=>(
                  <tr key={it.id}>
                    <td className="font-medium">{it.nombre}</td><td>{it.tipo}</td><td className="text-success">{it.precio_creditos}</td><td className="text-warning">{it.precio_monedas}</td><td>{it.stock===-1?'∞':it.stock}</td>
                    <td><div className="flex gap-2"><button onClick={()=>{setForm(it);setShowModal('item')}} className="text-accent text-xs hover:underline">Editar</button><button onClick={()=>handleDelete('tienda_items',it.id)} className="text-danger text-xs hover:underline">Eliminar</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'opiniones' && (
        <div className="space-y-4">
          {opiniones.map(op=>(
            <div key={op.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div><span className="font-medium">{op.usuarios?.nombre} {op.usuarios?.apellido}</span><span className="text-accent ml-3">{'⭐'.repeat(op.calificacion)}</span></div>
                <button onClick={()=>handleDelete('opiniones',op.id)} className="text-danger text-xs hover:underline">Eliminar</button>
              </div>
              {op.titulo&&<h4 className="font-semibold text-sm mb-1">{op.titulo}</h4>}
              <p className="text-base-300 text-sm">{op.contenido}</p>
              {op.admin_respuesta&&<div className="mt-2 p-2 bg-base-800 rounded text-xs border-l-2 border-accent"><strong className="text-accent">Admin:</strong> {op.admin_respuesta}</div>}
              <div className="mt-3 flex gap-2">
                <input className="input text-sm py-1.5" placeholder="Responder..." id={`ar-${op.id}`} />
                <button onClick={async()=>{await supabase.from('opiniones').update({admin_respuesta:document.getElementById(`ar-${op.id}`).value}).eq('id',op.id);loadData()}} className="btn btn-primary btn-sm">Responder</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'roles' && (
        <>
          <div className="flex items-center gap-3 mb-6"><button onClick={()=>{setForm({nombre:'',nivel:0});setShowModal('role')}} className="btn btn-primary btn-sm">+ Nuevo Rol</button></div>
          <div className="table-container">
            <table>
              <thead><tr><th>Nombre</th><th>Nivel</th><th>Acciones</th></tr></thead>
              <tbody>
                {roles.map(r=>(
                  <tr key={r.id}><td className="font-medium">{r.nombre}</td><td className="text-accent">{r.nivel}</td>
                    <td><div className="flex gap-2"><button onClick={()=>{setForm(r);setShowModal('role')}} className="text-accent text-xs hover:underline">Editar</button><button onClick={()=>handleDelete('roles',r.id)} className="text-danger text-xs hover:underline">Eliminar</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'movimientos' && (
        <div className="table-container">
          <table>
            <thead><tr><th>Fecha</th><th>Usuario</th><th>Tipo</th><th>Monto</th><th>Descripción</th></tr></thead>
            <tbody>
              {movimientos.map(m=>(
                <tr key={m.id}>
                  <td className="text-xs text-base-400">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="font-medium">{m.usuarios?.nombre} {m.usuarios?.apellido}</td>
                  <td><span className="badge badge-admin">{m.tipo}</span></td>
                  <td className="text-accent font-bold">{m.monto>0?'+':''}{m.monto?.toLocaleString()}</td>
                  <td className="text-base-400 text-sm">{m.descripcion}</td>
                </tr>
              ))}
              {movimientos.length===0&&<tr><td colSpan={5} className="text-center text-base-500 py-8">Sin movimientos</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal==='user' && (
        <div className="modal-overlay" onClick={()=>setShowModal(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold mb-4">{form.id?'Editar':'Crear'} Usuario</h2>
            <form onSubmit={handleUserSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Nombre" value={form.nombre||''} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} required />
                <input className="input" placeholder="Apellido" value={form.apellido||''} onChange={e=>setForm(p=>({...p,apellido:e.target.value}))} required />
              </div>
              <input type="email" className="input" placeholder="Email" value={form.email||''} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required />
              <p className="text-base-500 text-xs">El usuario se activará cuando se registre desde la página de Registro.</p>
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={form.rol||'usuario'} onChange={e=>setForm(p=>({...p,rol:e.target.value}))}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select>
                <select className="input" value={form.estado||'activo'} onChange={e=>setForm(p=>({...p,estado:e.target.value}))}>{ESTADOS.map(e=><option key={e} value={e}>{e}</option>)}</select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={form.rango||'Civil'} onChange={e=>setForm(p=>({...p,rango:e.target.value}))}>{RANGOS.map(r=><option key={r} value={r}>{r}</option>)}</select>
                <input type="number" className="input" placeholder="Nivel" value={form.nivel||1} onChange={e=>setForm(p=>({...p,nivel:+e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="input" placeholder="Créditos" value={form.creditos||0} onChange={e=>setForm(p=>({...p,creditos:+e.target.value}))} />
                <input type="number" className="input" placeholder="Monedas" value={form.monedas||0} onChange={e=>setForm(p=>({...p,monedas:+e.target.value}))} />
              </div>
              <div className="flex gap-3 mt-4"><button type="submit" className="btn btn-primary">Guardar</button><button type="button" onClick={()=>setShowModal(null)} className="btn btn-secondary">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}

      {showModal==='grant' && (
        <div className="modal-overlay" onClick={()=>setShowModal(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold mb-2">Otorgar Recursos</h2>
            <p className="text-base-400 text-sm mb-4">Usuario: {usuarios.find(u=>u.id===form.user_id)?.nombre} {usuarios.find(u=>u.id===form.user_id)?.apellido}</p>
            <form onSubmit={async(e)=>{e.preventDefault();setMsg('');const user=usuarios.find(u=>u.id===form.user_id);const update={};if(form.creditos)update.creditos=(user.creditos||0)+parseInt(form.creditos);if(form.monedas)update.monedas=(user.monedas||0)+parseInt(form.monedas);if(form.nivel)update.nivel=(user.nivel||0)+parseInt(form.nivel);if(form.xp)update.xp=(user.xp||0)+parseInt(form.xp);if(form.rango)update.rango=form.rango;await supabase.from('usuarios').update(update).eq('id',form.user_id);await supabase.from('movimientos').insert({usuario_id:form.user_id,tipo:'asignacion',monto:parseInt(form.creditos||form.monedas||0),descripcion:`Admin otorgó recursos a ${user.nombre} ${user.apellido}`});setMsg('Recursos otorgados');setShowModal(null);setForm({});loadData()}} className="space-y-3">
              <div><label className="text-sm text-base-400 mb-1 block">Créditos (+/-)</label><input type="number" className="input" value={form.creditos||''} onChange={e=>setForm(p=>({...p,creditos:e.target.value}))} /></div>
              <div><label className="text-sm text-base-400 mb-1 block">Monedas (+/-)</label><input type="number" className="input" value={form.monedas||''} onChange={e=>setForm(p=>({...p,monedas:e.target.value}))} /></div>
              <div><label className="text-sm text-base-400 mb-1 block">Nivel (+/-)</label><input type="number" className="input" value={form.nivel||''} onChange={e=>setForm(p=>({...p,nivel:e.target.value}))} /></div>
              <div><label className="text-sm text-base-400 mb-1 block">XP (+/-)</label><input type="number" className="input" value={form.xp||''} onChange={e=>setForm(p=>({...p,xp:e.target.value}))} /></div>
              <div><label className="text-sm text-base-400 mb-1 block">Rango</label><select className="input" value={form.rango||''} onChange={e=>setForm(p=>({...p,rango:e.target.value}))}><option value="">Sin cambio</option>{RANGOS.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
              <div className="flex gap-3 mt-4"><button type="submit" className="btn btn-primary">Otorgar</button><button type="button" onClick={()=>setShowModal(null)} className="btn btn-secondary">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}

      {showModal==='mission' && (
        <div className="modal-overlay" onClick={()=>setShowModal(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold mb-4">{form.id?'Editar':'Nueva'} Misión</h2>
            <form onSubmit={handleMissionSubmit} className="space-y-3">
              <input className="input" placeholder="Título" value={form.titulo||''} onChange={e=>setForm(p=>({...p,titulo:e.target.value}))} required />
              <textarea className="input" rows={3} placeholder="Descripción" value={form.descripcion||''} onChange={e=>setForm(p=>({...p,descripcion:e.target.value}))} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={form.tipo||'general'} onChange={e=>setForm(p=>({...p,tipo:e.target.value}))}><option value="general">General</option><option value="combate">Combate</option><option value="entrenamiento">Entrenamiento</option><option value="exploracion">Exploración</option><option value="especial">Especial</option></select>
                <select className="input" value={form.dificultad||'normal'} onChange={e=>setForm(p=>({...p,dificultad:e.target.value}))}><option value="facil">Fácil</option><option value="normal">Normal</option><option value="dificil">Difícil</option><option value="elite">Élite</option></select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" className="input" placeholder="XP" value={form.recompensa_xp||''} onChange={e=>setForm(p=>({...p,recompensa_xp:+e.target.value}))} />
                <input type="number" className="input" placeholder="Créditos" value={form.recompensa_creditos||''} onChange={e=>setForm(p=>({...p,recompensa_creditos:+e.target.value}))} />
                <input type="number" className="input" placeholder="Monedas" value={form.recompensa_monedas||''} onChange={e=>setForm(p=>({...p,recompensa_monedas:+e.target.value}))} />
              </div>
              <select className="input" value={form.estado||'activa'} onChange={e=>setForm(p=>({...p,estado:e.target.value}))}><option value="activa">Activa</option><option value="pausada">Pausada</option><option value="finalizada">Finalizada</option></select>
              <div className="flex gap-3 mt-4"><button type="submit" className="btn btn-primary">Guardar</button><button type="button" onClick={()=>setShowModal(null)} className="btn btn-secondary">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}

      {showModal==='item' && (
        <div className="modal-overlay" onClick={()=>setShowModal(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold mb-4">{form.id?'Editar':'Nuevo'} Item</h2>
            <form onSubmit={handleItemSubmit} className="space-y-3">
              <input className="input" placeholder="Nombre" value={form.nombre||''} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} required />
              <textarea className="input" rows={3} placeholder="Descripción" value={form.descripcion||''} onChange={e=>setForm(p=>({...p,descripcion:e.target.value}))} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="input" placeholder="Precio Créditos" value={form.precio_creditos||''} onChange={e=>setForm(p=>({...p,precio_creditos:+e.target.value}))} />
                <input type="number" className="input" placeholder="Precio Monedas" value={form.precio_monedas||''} onChange={e=>setForm(p=>({...p,precio_monedas:+e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="input" placeholder="Stock (-1=infinito)" value={form.stock??''} onChange={e=>setForm(p=>({...p,stock:+e.target.value}))} />
                <input type="number" className="input" placeholder="Descuento %" value={form.descuento||''} onChange={e=>setForm(p=>({...p,descuento:+e.target.value}))} />
              </div>
              <input className="input" placeholder="URL Imagen" value={form.imagen_url||''} onChange={e=>setForm(p=>({...p,imagen_url:e.target.value}))} />
              <div className="flex gap-3 mt-4"><button type="submit" className="btn btn-primary">Guardar</button><button type="button" onClick={()=>setShowModal(null)} className="btn btn-secondary">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}

      {showModal==='role' && (
        <div className="modal-overlay" onClick={()=>setShowModal(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold mb-4">{form.id?'Editar':'Nuevo'} Rol</h2>
            <form onSubmit={handleRoleSubmit} className="space-y-3">
              <input className="input" placeholder="Nombre del rol" value={form.nombre||''} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} required />
              <input type="number" className="input" placeholder="Nivel de permiso" value={form.nivel||0} onChange={e=>setForm(p=>({...p,nivel:+e.target.value}))} />
              <div className="flex gap-3 mt-4"><button type="submit" className="btn btn-primary">Guardar</button><button type="button" onClick={()=>setShowModal(null)} className="btn btn-secondary">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}
    </PanelLayout>
  )
}
