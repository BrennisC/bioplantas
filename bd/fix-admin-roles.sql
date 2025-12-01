-- ============================================
-- FIX: Corregir roles de administradores
-- ============================================
-- Este script ayuda a verificar y corregir los roles de los usuarios administradores

-- PASO 1: Ver todos los usuarios y sus roles actuales
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- PASO 2: Identificar tu cuenta de administrador
-- Reemplaza 'tu-email@ejemplo.com' con tu email real
SELECT 
  id,
  email,
  role
FROM profiles
WHERE email = 'tu-email@ejemplo.com';

-- PASO 3: Actualizar a rol de administrador
-- Reemplaza 'tu-email@ejemplo.com' con tu email real
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';

-- PASO 4: Verificar que se actualizó correctamente
SELECT 
  id,
  email,
  role
FROM profiles
WHERE email = 'tu-email@ejemplo.com';

-- PASO 5 (OPCIONAL): Si necesitas actualizar múltiples usuarios a admin
-- Descomenta y modifica según tus necesidades:
/*
UPDATE profiles
SET role = 'admin'
WHERE email IN (
  'admin1@ejemplo.com',
  'admin2@ejemplo.com',
  'admin3@ejemplo.com'
);
*/

-- PASO 6: Ver todos los administradores
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;
