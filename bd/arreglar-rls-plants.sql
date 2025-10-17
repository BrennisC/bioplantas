-- ================================================
-- ARREGLAR POLÍTICAS RLS DE PLANTS
-- ================================================
-- Esto arregla los permisos para que los admins
-- puedan actualizar TODOS los campos de las plantas

-- 1. Primero, habilitar RLS si estaba deshabilitado
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes que puedan estar causando problemas
DROP POLICY IF EXISTS "Anyone can view plants" ON plants;
DROP POLICY IF EXISTS "Admins can insert plants" ON plants;
DROP POLICY IF EXISTS "Admins can update plants" ON plants;
DROP POLICY IF EXISTS "Admins can delete plants" ON plants;

-- 3. Crear políticas correctas

-- Todos pueden ver plantas
CREATE POLICY "Anyone can view plants"
  ON plants
  FOR SELECT
  USING (true);

-- Admins pueden insertar plantas
CREATE POLICY "Admins can insert plants"
  ON plants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins pueden actualizar plantas (TODOS LOS CAMPOS)
CREATE POLICY "Admins can update plants"
  ON plants
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins pueden eliminar plantas
CREATE POLICY "Admins can delete plants"
  ON plants
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ================================================
-- VERIFICAR POLÍTICAS
-- ================================================
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'plants';

-- Deberías ver 4 políticas:
-- - Anyone can view plants (SELECT)
-- - Admins can insert plants (INSERT)
-- - Admins can update plants (UPDATE)
-- - Admins can delete plants (DELETE)

-- ================================================
-- RESULTADO ESPERADO:
-- ================================================
-- ✅ RLS habilitado
-- ✅ Todos pueden ver plantas
-- ✅ Solo admins pueden crear/editar/eliminar
-- ✅ Admins pueden actualizar TODOS los campos
-- ================================================
