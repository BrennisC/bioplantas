-- ================================================
-- DIAGNOSTICAR CAMPOS DE PLANTAS
-- ================================================
-- Este script te muestra QUÉ EXACTAMENTE tienen 
-- tus plantas en los campos que agregaste

-- 1. Ver TODOS los campos que existen en la tabla plants
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'plants'
ORDER BY ordinal_position;

-- ================================================
-- Si no ves usage_instructions, warnings o scientific_article_url
-- entonces DEBES ejecutar: add-botanic-index-fields.sql
-- ================================================

-- 2. Ver las primeras 5 plantas con TODOS sus campos
SELECT 
  id,
  name,
  usage_instructions,
  warnings,
  scientific_article_url,
  -- Ver longitud de los campos
  LENGTH(usage_instructions) as len_instrucciones,
  LENGTH(warnings) as len_advertencias,
  LENGTH(scientific_article_url) as len_articulo
FROM plants
ORDER BY id
LIMIT 5;

-- ================================================
-- INTERPRETACIÓN DE RESULTADOS:
-- ================================================
-- Si len_instrucciones = NULL → No se guardó nada (correcto)
-- Si len_instrucciones = 0 → Cadena vacía "" (PROBLEMA)
-- Si len_instrucciones > 0 → Tiene contenido (correcto)
-- ================================================

-- 3. Ver cuántas plantas tienen contenido REAL
SELECT 
  COUNT(*) as total_plantas,
  
  -- Instrucciones de uso
  COUNT(CASE WHEN usage_instructions IS NOT NULL AND LENGTH(TRIM(usage_instructions)) > 0 THEN 1 END) as con_instrucciones,
  COUNT(CASE WHEN usage_instructions = '' THEN 1 END) as instrucciones_vacias,
  
  -- Advertencias
  COUNT(CASE WHEN warnings IS NOT NULL AND LENGTH(TRIM(warnings)) > 0 THEN 1 END) as con_advertencias,
  COUNT(CASE WHEN warnings = '' THEN 1 END) as advertencias_vacias,
  
  -- Artículo científico
  COUNT(CASE WHEN scientific_article_url IS NOT NULL AND LENGTH(TRIM(scientific_article_url)) > 0 THEN 1 END) as con_articulo,
  COUNT(CASE WHEN scientific_article_url = '' THEN 1 END) as articulos_vacios
FROM plants;

-- 4. Ver plantas que DEBERÍAN tener contenido (editaste como admin)
-- Cambia el ID por el de la planta que editaste
SELECT 
  id,
  name,
  scientific_name,
  '--- USAGE INSTRUCTIONS ---' as separator1,
  usage_instructions,
  '--- WARNINGS ---' as separator2,
  warnings,
  '--- SCIENTIFIC ARTICLE URL ---' as separator3,
  scientific_article_url
FROM plants
WHERE id = 1; -- CAMBIA ESTE ID

-- ================================================
-- 5. SOLUCIÓN RÁPIDA: Limpiar cadenas vacías
-- ================================================
-- Si ves que muchas plantas tienen cadenas vacías,
-- ejecuta esto para limpiarlas:

/*
UPDATE plants
SET 
  usage_instructions = NULL
WHERE usage_instructions = '' OR TRIM(usage_instructions) = '';

UPDATE plants
SET 
  warnings = NULL
WHERE warnings = '' OR TRIM(warnings) = '';

UPDATE plants
SET 
  scientific_article_url = NULL
WHERE scientific_article_url = '' OR TRIM(scientific_article_url) = '';
*/

-- ================================================
-- DESPUÉS DE LIMPIAR:
-- ================================================
-- 1. Ve al panel de admin
-- 2. Edita una planta
-- 3. ESCRIBE CONTENIDO REAL en los campos
-- 4. Guarda
-- 5. Ve al detalle de la planta
-- 6. AHORA SÍ deberías ver las secciones
-- ================================================
