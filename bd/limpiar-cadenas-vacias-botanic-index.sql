-- ================================================
-- LIMPIAR CADENAS VACÍAS EN BOTANIC INDEX
-- ================================================
-- Este script convierte cadenas vacías en NULL
-- para que las condiciones del frontend funcionen correctamente

-- 1. Limpiar usage_instructions vacías
UPDATE plants
SET usage_instructions = NULL
WHERE usage_instructions = '' 
   OR usage_instructions IS NOT NULL AND TRIM(usage_instructions) = '';

-- 2. Limpiar warnings vacías
UPDATE plants
SET warnings = NULL
WHERE warnings = '' 
   OR warnings IS NOT NULL AND TRIM(warnings) = '';

-- ================================================
-- VERIFICAR RESULTADOS
-- ================================================
SELECT 
  COUNT(*) as total_plantas,
  COUNT(usage_instructions) as con_instrucciones_validas,
  COUNT(warnings) as con_advertencias_validas,
  COUNT(CASE WHEN usage_instructions = '' THEN 1 END) as instrucciones_vacias,
  COUNT(CASE WHEN warnings = '' THEN 1 END) as advertencias_vacias
FROM plants;

-- ================================================
-- Resultado esperado:
-- instrucciones_vacias y advertencias_vacias deben ser 0
-- ================================================

-- 3. Ver ejemplo de plantas con contenido
SELECT 
  id,
  name,
  CASE 
    WHEN usage_instructions IS NOT NULL THEN '✅ Tiene contenido'
    ELSE '❌ Está vacío'
  END as estado_instrucciones,
  CASE 
    WHEN warnings IS NOT NULL THEN '✅ Tiene contenido'
    ELSE '❌ Está vacío'
  END as estado_advertencias
FROM plants
ORDER BY name
LIMIT 10;

-- ================================================
-- IMPORTANTE:
-- ================================================
-- Después de ejecutar este script:
-- 1. Los campos con texto vacío ahora serán NULL
-- 2. El frontend solo mostrará secciones con contenido real
-- 3. Si editaste plantas pero no ves el contenido, 
--    verifica que REALMENTE guardaste texto (no solo espacios)
-- ================================================
