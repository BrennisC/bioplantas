-- ================================================
-- ARREGLAR PERMISOS DEL STORAGE (BUCKET)
-- ================================================
-- Esto arregla los permisos para subir imágenes

-- IMPORTANTE: Estos comandos NO se ejecutan en SQL Editor
-- Debes ir a: Supabase Dashboard → Storage → Policies

-- ================================================
-- OPCIÓN 1: Usar la interfaz de Supabase
-- ================================================
-- 1. Ve a: Storage → Buckets
-- 2. Encuentra el bucket "plants" o el que uses para imágenes
-- 3. Click en "Policies"
-- 4. Asegúrate de tener estas políticas:

-- POLÍTICA 1: Todos pueden VER imágenes
-- Nombre: "Public can view plant images"
-- Tipo: SELECT
-- Target roles: public
-- Policy definition: true

-- POLÍTICA 2: Admins pueden SUBIR imágenes
-- Nombre: "Admins can upload plant images"
-- Tipo: INSERT
-- Target roles: authenticated
-- Policy definition:
-- (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))

-- POLÍTICA 3: Admins pueden ACTUALIZAR imágenes
-- Nombre: "Admins can update plant images"
-- Tipo: UPDATE
-- Target roles: authenticated
-- Policy definition:
-- (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))

-- POLÍTICA 4: Admins pueden ELIMINAR imágenes
-- Nombre: "Admins can delete plant images"
-- Tipo: DELETE
-- Target roles: authenticated
-- Policy definition:
-- (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))

-- ================================================
-- OPCIÓN 2: Hacer el bucket PÚBLICO (más simple)
-- ================================================
-- Si no necesitas restricciones, haz el bucket público:
-- 1. Ve a: Storage → Buckets
-- 2. Click en los 3 puntos del bucket
-- 3. Click "Edit bucket"
-- 4. Marca "Public bucket" ✅
-- 5. Guarda

-- Con un bucket público:
-- - Todos pueden VER las imágenes (sin autenticación)
-- - Solo usuarios autenticados (admins) pueden SUBIR

-- ================================================
-- VERIFICACIÓN
-- ================================================
-- Después de configurar:
-- 1. Ve al panel de admin
-- 2. Intenta editar una planta
-- 3. Sube una imagen
-- 4. Debería funcionar sin errores

-- Si sigue fallando, revisa:
-- - La URL del bucket en .env (VITE_SUPABASE_URL)
-- - Que el nombre del bucket sea correcto en el código
-- - Que el usuario esté autenticado como admin

-- ================================================
-- CONFIGURACIÓN RECOMENDADA:
-- ================================================
-- Para un sitio de plantas público:
-- ✅ Bucket público (todos pueden ver)
-- ✅ RLS en INSERT/UPDATE/DELETE (solo admins)
-- ✅ Sin restricciones en SELECT (ver imágenes)
-- ================================================
