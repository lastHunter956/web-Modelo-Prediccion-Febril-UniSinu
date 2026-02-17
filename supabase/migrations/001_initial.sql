-- ============================================================
-- Predicción Febril Pediátrica — Setup Supabase
-- Universidad del Sinú, Cartagena
-- ============================================================
-- Ejecutar este SQL en el SQL Editor de Supabase Dashboard
-- ============================================================

-- 1. Tabla de perfiles de médicos
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  especialidad TEXT,
  institucion TEXT DEFAULT 'Universidad del Sinú',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de evaluaciones
CREATE TABLE IF NOT EXISTS evaluaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  datos_paciente JSONB NOT NULL,
  prediccion TEXT NOT NULL,         -- 'Leve', 'Moderada', 'Severa'
  prediccion_codigo INT NOT NULL,   -- 0, 1, 2
  probabilidades JSONB NOT NULL,    -- {"leve": 85.0, "moderada": 10.0, "severa": 5.0}
  factores JSONB,                   -- ["Glasgow alterado", ...]
  confianza FLOAT,                  -- Probabilidad máxima
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índice para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_evaluaciones_user_id ON evaluaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_created_at ON evaluaciones(created_at DESC);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS para evaluaciones
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evaluaciones"
  ON evaluaciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluaciones"
  ON evaluaciones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Trigger: crear perfil automáticamente al registrarse
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, especialidad)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Sin nombre'),
    COALESCE(NEW.raw_user_meta_data->>'especialidad', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger existente si hay
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
