-- ================================================
-- VERIFICAR POLÍTICAS RLS DE LA TABLA PLANTS
-- ================================================
-- Las políticas RLS pueden estar bloqueando la actualización
-- de los nuevos campos

-- 1. Ver todas las políticas de la tabla plants
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'plants';

-- ================================================
-- INTERPRETACIÓN:
-- ================================================
-- Busca políticas con cmd = 'UPDATE'
-- Si la política tiene una condición en "with_check" que no incluye
-- los nuevos campos, entonces NO se podrán actualizar

-- ================================================
-- SOLUCIÓN: Deshabilitar RLS temporalmente para probar
-- ================================================
-- ADVERTENCIA: Esto es solo para TESTING
-- NO uses esto en producción

-- Deshabilitar RLS
-- ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- Después de probar, vuelve a habilitar
-- ALTER TABLE plants ENABLE ROW LEVEL SECURITY;

-- ================================================
-- MEJOR SOLUCIÓN: Actualizar la política de UPDATE
-- ================================================
-- Si existe una política restrictiva, necesitas actualizarla
-- para permitir la actualización de los nuevos campos

-- Ver si hay alguna política que esté bloqueando
SELECT policyname, cmd, with_check
FROM pg_policies 
WHERE tablename = 'plants' 
AND cmd = 'UPDATE';
