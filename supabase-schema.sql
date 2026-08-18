-- USMCF Admin Panel - Supabase Schema
-- Ejecuta esto en: Supabase Dashboard > SQL Editor > New Query

-- Tabla de usuarios (extendida desde auth.users)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT DEFAULT '',
  apellido TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  direccion TEXT,
  rol TEXT NOT NULL DEFAULT 'usuario',
  rango TEXT DEFAULT 'Civil',
  nivel INT DEFAULT 1,
  xp INT DEFAULT 0,
  creditos INT DEFAULT 0,
  monedas INT DEFAULT 0,
  estado TEXT DEFAULT 'pendiente',
  avatar_url TEXT,
  fecha_nacimiento DATE,
  pais TEXT DEFAULT '',
  idioma TEXT DEFAULT 'es',
  notificaciones BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  nivel INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (nombre, nivel) VALUES
  ('super_admin', 100), ('admin', 80), ('staff', 50), ('usuario', 10)
ON CONFLICT (nombre) DO NOTHING;

-- Tabla de rangos
CREATE TABLE IF NOT EXISTS rangos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  salario INT DEFAULT 0,
  nivel_minimo INT DEFAULT 1,
  imagen_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO rangos (nombre, salario, nivel_minimo) VALUES
  ('Civil', 0, 1), ('Recruta', 100, 1), ('Soldado', 250, 3),
  ('Cabo', 500, 5), ('Sargento', 1000, 10), ('Sargento 1ro', 1500, 15),
  ('Sargento Mayor', 2500, 20), ('Tte. Cvto', 3500, 25), ('Cvto', 5000, 30),
  ('1er Cvto', 7000, 35), ('Suboficial', 9000, 40), ('Suboficial 1ro', 12000, 45),
  ('Suboficial Mayor', 16000, 50), ('Suboficial Superior', 21000, 55),
  ('Alferez', 27000, 60), ('1er Alferez', 34000, 65), ('Capitan', 42000, 70),
  ('May. batallon', 52000, 75), ('Cnl. batallon', 65000, 80),
  ('Coronel', 80000, 85), ('General de brigada', 100000, 90),
  ('General division', 125000, 95), ('General ejercito', 150000, 100)
ON CONFLICT (nombre) DO NOTHING;

-- Tabla de misiones
CREATE TABLE IF NOT EXISTS misiones (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT DEFAULT 'general',
  dificultad TEXT DEFAULT 'normal',
  recompensa_xp INT DEFAULT 0,
  recompensa_creditos INT DEFAULT 0,
  recompensa_monedas INT DEFAULT 0,
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  estado TEXT DEFAULT 'activa',
  max_participantes INT DEFAULT 0,
  creador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de misiones participantes
CREATE TABLE IF NOT EXISTS misiones_participantes (
  id SERIAL PRIMARY KEY,
  mision_id INT NOT NULL REFERENCES misiones(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  estado TEXT DEFAULT 'asignado',
  progreso INT DEFAULT 0,
  completada_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tienda
CREATE TABLE IF NOT EXISTS tienda_items (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT DEFAULT 'general',
  precio_creditos INT DEFAULT 0,
  precio_monedas INT DEFAULT 0,
  imagen_url TEXT,
  stock INT DEFAULT -1,
  descuento INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de compras
CREATE TABLE IF NOT EXISTS compras (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  item_id INT NOT NULL REFERENCES tienda_items(id) ON DELETE CASCADE,
  cantidad INT DEFAULT 1,
  total_creditos INT DEFAULT 0,
  total_monedas INT DEFAULT 0,
  estado TEXT DEFAULT 'completada',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de opiniones
CREATE TABLE IF NOT EXISTS opiniones (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo TEXT,
  contenido TEXT,
  calificacion INT DEFAULT 5,
  estado TEXT DEFAULT 'aprobada',
  admin_respuesta TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de movimientos (historial de cambios)
CREATE TABLE IF NOT EXISTS movimientos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  monto INT DEFAULT 0,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Habilitar pero permitir todo por ahora
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rangos ENABLE ROW LEVEL SECURITY;
ALTER TABLE misiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE misiones_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tienda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE opiniones ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (ajustar después)
CREATE POLICY "Allow all for authenticated" ON usuarios FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON roles FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON rangos FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON misiones FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON misiones_participantes FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON tienda_items FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON compras FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON opiniones FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON movimientos FOR ALL USING (true);
