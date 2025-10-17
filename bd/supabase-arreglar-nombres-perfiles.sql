-- ============================================
-- ARREGLAR NOMBRES FALTANTES EN PROFILES
-- ============================================
-- Este script verifica y arregla perfiles que no tienen nombres guardados

-- PASO 1: Ver cuántos perfiles tienen nombres vacíos
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  role,
  CASE 
    WHEN first_name = '' AND last_name = '' THEN '❌ Sin nombres'
    WHEN first_name = '' THEN '⚠️ Sin first_name'
    WHEN last_name = '' THEN '⚠️ Sin last_name'
    ELSE '✅ OK'
  END as estado
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- PASO 2: Ver datos en auth.users (metadata)
SELECT 
  id,
  email,
  raw_user_meta_data->>'first_name' as first_name_metadata,
  raw_user_meta_data->>'last_name' as last_name_metadata,
  raw_user_meta_data->>'role' as role_metadata
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- OPCIÓN A: Actualizar TU perfil manualmente
-- ============================================
-- Reemplaza 'tu@email.com' con tu email real

UPDATE profiles
SET 
  first_name = 'Tu Nombre Aquí',
  last_name = 'Tu Apellido Aquí'
WHERE email = 'tu@email.com';

-- Verificar que se actualizó
SELECT id, email, first_name, last_name, role
FROM profiles
WHERE email = 'tu@email.com';

-- ============================================
-- OPCIÓN B: Migrar nombres desde metadata
-- ============================================
-- Si guardaste los nombres en metadata al registrarte,
-- este query los copia a profiles

UPDATE profiles p
SET 
  first_name = COALESCE(u.raw_user_meta_data->>'first_name', ''),
  last_name = COALESCE(u.raw_user_meta_data->>'last_name', '')
FROM auth.users u
WHERE p.id = u.id
  AND (p.first_name IS NULL OR p.first_name = '')
  AND (u.raw_user_meta_data->>'first_name' IS NOT NULL);

-- Verificar resultados
SELECT id, email, first_name, last_name, role
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- OPCIÓN C: Actualizar TODOS los usuarios sin nombre
-- ============================================
-- Útil si tienes muchos usuarios

UPDATE profiles
SET 
  first_name = CASE 
    WHEN first_name = '' OR first_name IS NULL THEN 'Usuario'
    ELSE first_name
  END,
  last_name = CASE 
    WHEN last_name = '' OR last_name IS NULL THEN split_part(email, '@', 1)
    ELSE last_name
  END
WHERE first_name = '' OR first_name IS NULL;

-- ============================================
-- VERIFICAR QUE EL TRIGGER FUNCIONA AHORA
-- ============================================
-- Verifica que el trigger existe
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Debería mostrar:
-- trigger_name: on_auth_user_created
-- event_manipulation: INSERT
-- event_object_table: users
-- action_statement: EXECUTE FUNCTION public.handle_new_user()

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Después de ejecutar OPCIÓN A, B o C, deberías ver:
-- ✅ first_name lleno
-- ✅ last_name lleno
-- ✅ Los nuevos usuarios SÍ guardarán nombres
