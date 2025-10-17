-- ================================================
-- CONFIGURACIÓN DE STORAGE PARA AVATARES
-- ================================================
-- Este script crea el bucket de almacenamiento para avatares
-- y configura las políticas de seguridad

-- IMPORTANTE: Primero eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;

-- 1. Crear el bucket 'profiles' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Cualquiera puede VER archivos en el bucket profiles (público)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- 3. Política: Usuarios autenticados pueden SUBIR archivos
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

-- 4. Política: Usuarios autenticados pueden ACTUALIZAR archivos
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles')
WITH CHECK (bucket_id = 'profiles');

-- 5. Política: Usuarios autenticados pueden ELIMINAR archivos
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profiles');

-- ================================================
-- RESULTADO ESPERADO:
-- ================================================
-- ✅ Bucket 'profiles' creado y público
-- ✅ Cualquiera puede VER avatares
-- ✅ Usuarios autenticados pueden SUBIR/EDITAR/ELIMINAR
-- ✅ Estructura: profiles/avatars/{user_id}-{timestamp}.{ext}
-- ================================================

-- VERIFICAR:
-- SELECT * FROM storage.buckets WHERE id = 'profiles';
-- SELECT * FROM storage.policies WHERE bucket_id = 'profiles';
