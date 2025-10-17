-- ====================================================================
-- TEST: Verificar que la función corregida funciona
-- ====================================================================
-- Este script prueba la función get_recommended_plants_for_user
-- después de corregir los nombres de columnas
-- ====================================================================

-- 1. Verificar que la función existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'get_recommended_plants_for_user';

-- 2. Ver la firma de la función
SELECT 
  p.proname as function_name,
  pg_get_function_result(p.oid) as return_type,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'get_recommended_plants_for_user';

-- 3. Probar la función con un UUID de prueba
-- (Reemplaza con un UUID real de tu tabla auth.users)
-- SELECT * FROM get_recommended_plants_for_user('UUID-AQUI'::UUID);

-- 4. Verificar que las columnas retornadas coinciden con la tabla plants
SELECT 
  'Columnas esperadas por la función' as tipo,
  'id (UUID), common_name (TEXT), scientific_name (TEXT), image (TEXT)' as columnas
UNION ALL
SELECT 
  'Columnas reales en plants',
  string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position)
FROM information_schema.columns
WHERE table_name = 'plants' 
  AND column_name IN ('id', 'name', 'scientific_name', 'image');
