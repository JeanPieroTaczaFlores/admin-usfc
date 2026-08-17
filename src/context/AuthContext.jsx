import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('usuarios').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setUser(data.user)
    await fetchProfile(data.user.id)
    return data.user
  }

  const register = async (email, password, nombre, apellido) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    await supabase.from('usuarios').insert({
      id: data.user.id,
      email,
      nombre,
      apellido,
      rol: 'usuario',
      estado: 'pendiente',
      rango: 'Civil',
      nivel: 1,
      xp: 0,
      creditos: 0,
      monedas: 0,
    })

    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-950">
        <div className="text-accent font-display text-2xl animate-pulse">USMCF</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, profile, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
