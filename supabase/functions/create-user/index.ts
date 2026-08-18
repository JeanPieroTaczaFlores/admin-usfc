import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 })
  }

  const { email, password, nombre, apellido, rol, estado, rango, nivel, creditos, monedas } = await req.json()

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), { status: 400 })
  }

  const { error: profileError } = await supabase.from("usuarios").insert({
    id: authUser.user.id,
    email,
    nombre: nombre || "",
    apellido: apellido || "",
    rol: rol || "usuario",
    estado: estado || "activo",
    rango: rango || "Civil",
    nivel: nivel || 1,
    xp: 0,
    creditos: creditos || 0,
    monedas: monedas || 0,
  })

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ id: authUser.user.id, email, success: true }), {
    headers: { "Content-Type": "application/json" }
  })
})
