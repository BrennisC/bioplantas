-- ================================================
-- SCRIPT DE MIGRACIÓN SEGURO PARA PROFILES TABLE
-- ================================================
-- Este script agrega first_name y last_name a la tabla profiles
-- y migra datos existentes sin perder información
-- ES SEGURO ejecutar múltiples veces

-- 1. Agregar columnas si no existen
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. Migrar datos existentes de 'name' a 'first_name' y 'last_name'
-- Solo si la columna 'name' existe y tiene datos
DO $$ 
BEGIN
  -- Verificar si existe la columna 'name'
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'name'
  ) THEN
    -- Migrar datos: dividir 'name' en first_name y last_name
    UPDATE profiles 
    SET 
      first_name = COALESCE(
        first_name, 
        CASE 
          WHEN name IS NOT NULL AND name != '' THEN split_part(name, ' ', 1)
          ELSE split_part(email, '@', 1)
        END
      ),
      last_name = COALESCE(
        last_name,
        CASE 
          WHEN name IS NOT NULL AND name LIKE '% %' 
          THEN substring(name FROM position(' ' IN name) + 1)
          ELSE ''
        END
      )
    WHERE first_name IS NULL OR last_name IS NULL;
    
    -- Mensaje de confirmación
    RAISE NOTICE 'Datos migrados exitosamente de "name" a "first_name" y "last_name"';
  ELSE
    RAISE NOTICE 'La columna "name" no existe. Continuando...';
  END IF;
END $$;

-- 3. Asegurar que usuarios sin first_name tengan al menos el email
UPDATE profiles
SET first_name = split_part(email, '@', 1)
WHERE first_name IS NULL OR first_name = '';

UPDATE profiles
SET last_name = ''
WHERE last_name IS NULL;

-- 4. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);

-- 5. Verificar resultados
-- Descomentar estas líneas para ver los resultados:
-- SELECT 
--   id, 
--   email, 
--   first_name, 
--   last_name,
--   CASE 
--     WHEN EXISTS (
--       SELECT 1 FROM information_schema.columns 
--       WHERE table_name = 'profiles' AND column_name = 'name'
--     ) THEN name 
--     ELSE NULL 
--   END as old_name
-- FROM profiles
-- LIMIT 10;

-- ================================================
-- RESULTADO ESPERADO:
-- ================================================
-- ✅ Columnas first_name y last_name agregadas
-- ✅ Datos existentes migrados sin pérdida
-- ✅ Índices creados para mejor rendimiento
-- ✅ Usuarios sin datos tienen email como fallback
-- ================================================
