-- Ejecuta esto en: Supabase SQL Editor
-- Función para que admins creen usuarios (bypass rate limit)

CREATE OR REPLACE FUNCTION admin_create_user(
  p_email TEXT,
  p_password TEXT,
  p_nombre TEXT DEFAULT '',
  p_apellido TEXT DEFAULT '',
  p_rol TEXT DEFAULT 'usuario',
  p_estado TEXT DEFAULT 'activo',
  p_rango TEXT DEFAULT 'Civil',
  p_nivel INT DEFAULT 1,
  p_creditos INT DEFAULT 0,
  p_monedas INT DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  v_user_id := gen_random_uuid();
  v_encrypted_password := crypt(p_password, gen_salt('bf'));

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
    p_email, v_encrypted_password,
    NOW(), NOW(), NOW(), encode(gen_random_bytes(32), 'hex'), ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id, v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', p_email),
    'email', NOW(), NOW(), NOW()
  );

  INSERT INTO public.usuarios (
    id, email, nombre, apellido, rol, estado, rango, nivel, xp, creditos, monedas
  ) VALUES (
    v_user_id, p_email, p_nombre, p_apellido, p_rol, p_estado, p_rango, p_nivel, 0, p_creditos, p_monedas
  );

  RETURN json_build_object('id', v_user_id, 'email', p_email, 'success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
