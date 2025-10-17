-- ====================================================================
-- VERIFICAR SCHEMA DE LA TABLA PLANTS
-- ====================================================================
-- Este script verifica las columnas exactas de la tabla plants
-- para corregir la función get_recommended_plants_for_user
-- ====================================================================

-- Ver todas las columnas de la tabla plants
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'plants'
ORDER BY ordinal_position;

-- Buscar columnas relacionadas con imágenes
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'plants'
  AND (column_name LIKE '%image%' OR column_name LIKE '%photo%' OR column_name LIKE '%pic%');

-- Verificar las columnas médicas que agregamos
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'plants'
  AND (
    column_name LIKE 'safe_%' 
    OR column_name LIKE 'medical_%'
    OR column_name LIKE 'active_%'
    OR column_name LIKE '%pregnancy%'
    OR column_name LIKE '%lactation%'
  );
