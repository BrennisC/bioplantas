-- ============================================
-- SOLUCIÓN DEFINITIVA: ELIMINAR TABLA USERS
-- ============================================
-- Solo usar PROFILES para todo
-- Esto elimina el error "database error saving user"

-- PASO 1: Eliminar triggers que usan users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- PASO 2: Agregar columna 'role' a profiles si no existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- PASO 3: Llenar roles desde users si existen
UPDATE profiles p
SET role = COALESCE(u.role, 'user')
FROM users u
WHERE p.id = u.id AND (p.role IS NULL OR p.role = '');

-- PASO 4: Hacer role NOT NULL
ALTER TABLE profiles
ALTER COLUMN role SET NOT NULL;

-- PASO 5: Agregar constraint para roles válidos
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

-- PASO 6: Crear índice
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- PASO 7: Eliminar foreign keys de otras tablas hacia users
-- Solo para las tablas que existen
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- PASO 8: Recrear foreign keys apuntando a profiles
-- Solo para las tablas que existen
ALTER TABLE favorites 
ADD CONSTRAINT favorites_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- PASO 9: ELIMINAR tabla users (ya no la necesitas)
DROP TABLE IF EXISTS public.users CASCADE;

-- PASO 10: Crear trigger SIMPLE solo para profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    role = COALESCE(EXCLUDED.role, profiles.role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 11: Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 12: Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PASO 13: Actualizar políticas RLS
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Todos pueden ver todos los perfiles (para mostrar nombres en comentarios, etc)
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  USING (true);

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- PASO 14: Funciones helper
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

-- 1. Ver que users table ya no existe
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public';
-- Debería retornar 0 filas

-- 2. Ver estructura de profiles
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'profiles';

-- 3. Ver perfiles existentes
-- SELECT id, email, role, first_name, last_name FROM profiles LIMIT 10;

-- 4. Verificar tu rol
-- SELECT public.get_current_user_role();

-- ============================================
-- RESULTADO FINAL
-- ============================================
-- ✅ Solo existe tabla PROFILES con campo 'role'
-- ✅ Tabla USERS eliminada
-- ✅ Todas las foreign keys apuntan a profiles
-- ✅ Registro de usuarios funciona
-- ✅ No más conflictos entre 2 tablas
