-- ================================================
-- DIAGNÓSTICO COMPLETO: ¿Por qué no se guardan los campos?
-- ================================================

-- PASO 1: Verificar que los campos EXISTEN en la tabla
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'plants'
AND column_name IN ('usage_instructions', 'warnings', 'scientific_article_url')
ORDER BY column_name;

-- RESULTADO ESPERADO: 3 filas
-- Si sale vacío → Los campos NO EXISTEN, debes ejecutar add-botanic-index-fields.sql

-- ================================================
-- PASO 2: Ver TODAS las columnas de la tabla plants
-- ================================================
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'plants'
ORDER BY ordinal_position;

-- Busca en la lista: usage_instructions, warnings, scientific_article_url
-- Si NO aparecen → Ejecuta add-botanic-index-fields.sql

-- ================================================
-- PASO 3: Intentar insertar manualmente un valor de prueba
-- ================================================
-- Cambia el ID por el de una planta real que tengas
UPDATE plants
SET 
  usage_instructions = 'Prueba de instrucciones de uso',
  warnings = 'Prueba de advertencias',
  scientific_article_url = 'https://pubmed.ncbi.nlm.nih.gov/'
WHERE id = (SELECT id FROM plants LIMIT 1);

-- Si da error "column does not exist" → Los campos NO están creados
-- Si dice "UPDATE 1" → Los campos SÍ existen y se guardó correctamente

-- ================================================
-- PASO 4: Verificar que se guardó
-- ================================================
SELECT 
  name,
  usage_instructions,
  warnings,
  scientific_article_url
FROM plants
WHERE usage_instructions IS NOT NULL
OR warnings IS NOT NULL
OR scientific_article_url IS NOT NULL
LIMIT 5;

-- Si esto muestra plantas → Los campos existen y funcionan
-- Si sale vacío → Verifica que ejecutaste el UPDATE del paso 3

-- ================================================
-- CONCLUSIÓN:
-- ================================================
-- Si PASO 1 sale vacío → Ejecuta add-botanic-index-fields.sql
-- Si PASO 3 da error → Ejecuta add-botanic-index-fields.sql
-- Si PASO 4 muestra datos → Todo funciona, el problema está en el frontend
-- ================================================
