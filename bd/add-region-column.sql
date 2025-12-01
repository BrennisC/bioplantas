-- ================================================
-- AGREGAR COLUMNA REGION A TABLA PLANTS
-- ================================================
-- Permite filtrar plantas por región geográfica
-- Opciones: Costa, Sierra, Selva
-- ================================================

-- 1. Agregar columna region con tipo TEXT
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS region TEXT;

-- 2. Agregar restricción para solo permitir valores válidos
ALTER TABLE plants 
ADD CONSTRAINT valid_region 
CHECK (region IS NULL OR region IN ('Costa', 'Sierra', 'Selva'));

-- 3. Crear índice para mejorar el rendimiento de filtrado
CREATE INDEX IF NOT EXISTS idx_plants_region ON plants(region);

-- 4. Verificar que la columna se creó correctamente
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'plants'
  AND column_name = 'region';

-- 5. Ver las restricciones de la tabla
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE con.contype
    WHEN 'c' THEN pg_get_constraintdef(con.oid)
    ELSE NULL
  END AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'plants'
  AND con.contype = 'c'
  AND con.conname = 'valid_region';

-- ================================================
-- RESULTADO ESPERADO:
-- ================================================
-- ✅ Columna 'region' agregada a tabla plants
-- ✅ Solo acepta: NULL, 'Costa', 'Sierra', 'Selva'
-- ✅ Índice creado para filtrado rápido
-- ================================================

-- ================================================
-- PRUEBAS (OPCIONAL)
-- ================================================

-- Ejemplo: Actualizar algunas plantas existentes
/*
-- Plantas de la costa
UPDATE plants SET region = 'Costa' WHERE name IN ('Uña de gato', 'Hercampuri');

-- Plantas de la sierra
UPDATE plants SET region = 'Sierra' WHERE name IN ('Maca', 'Muña');

-- Plantas de la selva
UPDATE plants SET region = 'Selva' WHERE name IN ('Ayahuasca', 'Sangre de grado');

-- Verificar actualización
SELECT name, category, region FROM plants WHERE region IS NOT NULL;
*/

-- ================================================
-- CONSULTAS ÚTILES
-- ================================================

-- Ver distribución de plantas por región
SELECT 
  region,
  COUNT(*) as total_plantas
FROM plants
GROUP BY region
ORDER BY total_plantas DESC;

-- Ver plantas sin región asignada
SELECT name, category FROM plants WHERE region IS NULL LIMIT 10;
