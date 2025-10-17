-- ====================================================================
-- AGREGAR COLUMNA GENDER A USER_MEDICAL_PROFILE
-- ====================================================================
-- Este script agrega la columna 'gender' para almacenar el género del usuario
-- y evitar preguntas irrelevantes (como embarazo a hombres)
-- ====================================================================

-- Agregar columna gender si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_medical_profile' 
    AND column_name = 'gender'
  ) THEN
    ALTER TABLE user_medical_profile 
    ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other'));
    
    RAISE NOTICE '✅ Columna gender agregada exitosamente';
  ELSE
    RAISE NOTICE 'ℹ️ Columna gender ya existe';
  END IF;
END $$;

-- Verificar que se agregó
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_medical_profile' 
  AND column_name = 'gender';
