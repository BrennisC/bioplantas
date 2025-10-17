-- ================================================
-- PRUEBA DIRECTA: Actualizar campos como ADMIN
-- ================================================
-- Este script prueba si los campos se pueden actualizar
-- usando el Service Role (admin)

-- 1. Ver una planta específica ANTES del update
SELECT 
  id,
  name,
  usage_instructions,
  warnings,
  scientific_article_url
FROM plants
WHERE name = 'Aloe Vera';

-- 2. Intentar actualizar (copia el ID de arriba)
UPDATE plants
SET 
  usage_instructions = 'TEST: Instrucciones actualizadas ' || NOW()::text,
  warnings = 'TEST: Advertencias actualizadas ' || NOW()::text,
  scientific_article_url = 'https://pubmed.ncbi.nlm.nih.gov/test'
WHERE name = 'Aloe Vera';

-- 3. Verificar que se actualizó
SELECT 
  name,
  usage_instructions,
  warnings,
  scientific_article_url,
  updated_at
FROM plants
WHERE name = 'Aloe Vera';

-- ================================================
-- Si esto funciona → El problema es RLS o permisos del frontend
-- Si esto NO funciona → El problema es más profundo en la DB
-- ================================================

-- 4. SOLUCIÓN TEMPORAL: Deshabilitar RLS para testing
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- Prueba guardar desde el admin ahora

-- 5. Volver a habilitar RLS después
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
