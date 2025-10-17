-- ================================================
-- VERIFICACIÓN SIMPLE: ¿Existen los campos?
-- ================================================

-- 1. Ver si los campos existen
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'plants'
AND column_name IN ('usage_instructions', 'warnings', 'scientific_article_url')
ORDER BY column_name;

-- Si esto NO muestra 3 filas, entonces el script no se ejecutó correctamente

-- ================================================
-- 2. Ver una planta específica
-- ================================================
-- Ejecuta esto UNA PLANTA A LA VEZ para ver el contenido real

SELECT 
  name,
  usage_instructions,
  warnings,
  scientific_article_url
FROM plants
LIMIT 1;

-- ================================================
-- INTERPRETACIÓN:
-- ================================================
-- Si ves NULL en todos los campos → Los campos existen pero están vacíos (correcto)
-- Si dice "column does not exist" → El script NO se ejecutó
-- ================================================
