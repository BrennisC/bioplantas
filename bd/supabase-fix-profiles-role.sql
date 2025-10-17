-- ============================================
-- FIX: Agregar ROLE a PROFILES (Solución Segura)
-- ============================================
-- Este script arregla el error "database error saving user"
-- causado por la falta del campo 'role' en profiles

-- PASO 1: Agregar columna 'role' a profiles (sin NOT NULL primero)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- PASO 2: Llenar roles existentes desde users
UPDATE profiles p
SET role = COALESCE(u.role, 'user')
FROM users u
WHERE p.id = u.id AND p.role IS NULL;

-- PASO 3: Ahora sí, hacer NOT NULL después de llenar datos
ALTER TABLE profiles
ALTER COLUMN role SET NOT NULL;

-- PASO 4: Crear índice para consultas rápidas por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- PASO 5: ELIMINAR triggers y funciones antiguas que causan conflicto
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- PASO 6: Crear función NUEVA para manejar registro de usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar en profiles con role
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;
  
  -- También mantener users table sincronizada
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 7: Recrear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 8: Recrear trigger para updated_at en profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PASO 9: Actualizar políticas RLS
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    role = 'admin' OR auth.uid() = id
  );

-- PASO 10: Funciones helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM profiles WHERE id = auth.uid()),
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esto para verificar:
-- SELECT id, email, role, first_name, last_name FROM profiles LIMIT 10;
-- SELECT public.get_current_user_role();

-- ============================================
-- TEST DE REGISTRO
-- ============================================
-- Ahora prueba registrarte en la app
-- Si sale error, ejecuta esto para ver detalles:
-- SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 1;
-- SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
