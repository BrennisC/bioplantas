-- ============================================
-- AGREGAR ROLE A PROFILES (SOLUCIÓN DEFINITIVA)
-- ============================================
-- Este script unifica el manejo de roles en la tabla profiles
-- para que no tengas que consultar 2 tablas diferentes

-- PASO 1: Agregar columna 'role' a profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- PASO 2: Migrar roles existentes de users a profiles
UPDATE profiles p
SET role = u.role
FROM users u
WHERE p.id = u.id;

-- PASO 3: Crear índice para consultas rápidas por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- PASO 4: Actualizar trigger para incluir role al crear perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar en profiles con role por defecto
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  
  -- También insertar en users para mantener compatibilidad
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 5: Crear trigger si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 6: Actualizar políticas RLS para profiles
-- Permitir que admins vean todos los perfiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- PASO 7: Crear función helper para verificar si usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 8: Crear función para obtener rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esto para verificar que todo funcionó:
-- SELECT id, email, role FROM profiles LIMIT 10;
-- SELECT public.is_admin(); -- Debe retornar true si eres admin
-- SELECT public.get_current_user_role(); -- Debe retornar tu rol

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Ahora profiles tiene el campo 'role'
-- 2. Tanto users como profiles tienen sincronizado el rol
-- 3. Puedes consultar solo profiles para todo
-- 4. Las funciones helper facilitan verificar permisos
