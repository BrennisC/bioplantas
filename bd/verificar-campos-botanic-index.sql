-- ================================================
-- VERIFICAR CAMPOS BOTANIC INDEX
-- ================================================
-- Script para diagnosticar por qué no se muestran
-- las instrucciones y advertencias

-- 1. Verificar que los campos existan en la tabla
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plants'
AND column_name IN ('usage_instructions', 'warnings')
ORDER BY ordinal_position;

-- ================================================
-- Resultado esperado:
-- column_name          | data_type | is_nullable | column_default
-- ---------------------|-----------|-------------|---------------
-- usage_instructions   | text      | YES         | NULL
-- warnings             | text      | YES         | NULL
-- ================================================

-- 2. Ver cuántas plantas tienen estos campos con valores
SELECT 
  COUNT(*) as total_plantas,
  COUNT(usage_instructions) as con_instrucciones,
  COUNT(warnings) as con_advertencias,
  COUNT(CASE WHEN usage_instructions IS NOT NULL AND warnings IS NOT NULL THEN 1 END) as con_ambos
FROM plants;

-- ================================================
-- Resultado esperado (ejemplo):
-- total_plantas | con_instrucciones | con_advertencias | con_ambos
-- --------------|-------------------|------------------|----------
-- 50            | 3                 | 3                | 3
-- ================================================

-- 3. Ver las plantas que SÍ tienen estos campos llenos
SELECT 
  id,
  name,
  CASE 
    WHEN usage_instructions IS NOT NULL THEN '✅ Sí'
    ELSE '❌ No'
  END as tiene_instrucciones,
  CASE 
    WHEN warnings IS NOT NULL THEN '✅ Sí'
    ELSE '❌ No'
  END as tiene_advertencias,
  LENGTH(usage_instructions) as largo_instrucciones,
  LENGTH(warnings) as largo_advertencias
FROM plants
ORDER BY id
LIMIT 20;

-- ================================================
-- 4. Ver el contenido REAL de una planta específica
-- CAMBIA EL ID por el de la planta que editaste
-- ================================================
SELECT 
  id,
  name,
  scientific_name,
  usage_instructions,
  warnings
FROM plants
WHERE id = 1; -- CAMBIA ESTE ID

-- ================================================
-- DIAGNÓSTICO:
-- ================================================
-- Si los campos NO aparecen en la consulta 1:
--   → Ejecutar: add-botanic-index-fields.sql
--
-- Si los campos aparecen pero COUNT es 0:
--   → Los campos existen pero no se guardaron valores
--   → Verifica que el formulario admin esté guardando correctamente
--
-- Si los campos tienen valores pero no se muestran:
--   → El problema está en el frontend (PlantDetail.tsx)
--   → Revisar la condición: {plant.usage_instructions && ...}
-- ================================================
