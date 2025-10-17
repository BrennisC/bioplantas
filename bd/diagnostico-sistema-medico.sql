-- ================================================
-- SCRIPT DE DIAGNÓSTICO - Sistema Médico
-- ================================================
-- Ejecuta estas queries para verificar que todo está correcto

-- 1. Verificar que la tabla medical_conditions tiene datos
SELECT 
  '1. Condiciones médicas' as test,
  COUNT(*) as total,
  CASE WHEN COUNT(*) >= 25 THEN '✅ OK' ELSE '❌ FALTAN DATOS' END as status
FROM medical_conditions;

-- 2. Ver todas las condiciones médicas
SELECT * FROM medical_conditions ORDER BY category, name;

-- 3. Verificar que la tabla user_medical_profile existe
SELECT 
  '2. Tabla user_medical_profile' as test,
  COUNT(*) as total_perfiles,
  CASE WHEN COUNT(*) > 0 THEN '✅ OK' ELSE 'ℹ️ Sin perfiles aún' END as status
FROM user_medical_profile;

-- 4. Verificar que la función existe
SELECT 
  '3. Función get_recommended_plants_for_user' as test,
  proname as function_name,
  '✅ OK' as status
FROM pg_proc 
WHERE proname = 'get_recommended_plants_for_user';

-- 5. Verificar columnas en plants
SELECT 
  '4. Columnas médicas en plants' as test,
  column_name,
  data_type,
  CASE 
    WHEN column_name IN ('safe_pregnancy', 'safe_lactation', 'safe_children') THEN '✅ OK'
    WHEN column_name IN ('therapeutic_indications', 'evidence_level') THEN '✅ OK'
    ELSE '⚠️ Verificar'
  END as status
FROM information_schema.columns
WHERE table_name = 'plants'
  AND column_name IN (
    'id',
    'common_name',
    'scientific_name',
    'image_url',
    'therapeutic_indications',
    'safe_pregnancy',
    'safe_lactation',
    'safe_children',
    'evidence_level'
  )
ORDER BY column_name;

-- 6. Verificar tipo de dato de id en plants
SELECT 
  '5. Tipo de dato de plants.id' as test,
  data_type,
  CASE 
    WHEN data_type = 'integer' THEN '✅ OK (INTEGER)'
    WHEN data_type = 'uuid' THEN '⚠️ UUID (ajustar función)'
    ELSE '❌ Tipo inesperado'
  END as status
FROM information_schema.columns
WHERE table_name = 'plants' AND column_name = 'id';

-- 7. Ver si hay plantas con datos médicos
SELECT 
  '6. Plantas con información médica' as test,
  COUNT(*) as total,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ OK'
    ELSE '⚠️ Ninguna planta tiene datos médicos aún'
  END as status
FROM plants
WHERE therapeutic_indications IS NOT NULL 
   OR safe_pregnancy IS NOT NULL
   OR safe_lactation IS NOT NULL
   OR safe_children IS NOT NULL;

-- 8. Probar la función con un usuario de prueba
-- (Reemplaza 'TU-USER-ID-AQUI' con tu UUID real)
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Obtener el primer usuario
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE '⚠️ No hay usuarios en el sistema';
  ELSE
    RAISE NOTICE '7. Probando función con user: %', test_user_id;
    
    -- Intentar llamar la función
    PERFORM * FROM get_recommended_plants_for_user(test_user_id);
    
    RAISE NOTICE '✅ Función ejecuta correctamente';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error al ejecutar función: %', SQLERRM;
END $$;

-- 9. Ver detalles de la función (firma completa)
SELECT 
  '8. Firma de la función' as test,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'get_recommended_plants_for_user';

-- 10. Verificar políticas RLS
SELECT 
  '9. Políticas RLS' as test,
  schemaname,
  tablename,
  policyname,
  '✅ OK' as status
FROM pg_policies
WHERE tablename IN ('medical_conditions', 'user_medical_profile')
ORDER BY tablename, policyname;

-- ================================================
-- RESUMEN
-- ================================================
SELECT '=== RESUMEN DE VERIFICACIÓN ===' as info;

SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM medical_conditions) >= 25 THEN '✅'
    ELSE '❌'
  END || ' Condiciones médicas: ' || (SELECT COUNT(*) FROM medical_conditions)::TEXT as check_1
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_recommended_plants_for_user') THEN '✅'
    ELSE '❌'
  END || ' Función existe' as check_2
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'plants' AND column_name = 'safe_pregnancy'
    ) THEN '✅'
    ELSE '❌'
  END || ' Columnas médicas en plants' as check_3
UNION ALL
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM plants WHERE therapeutic_indications IS NOT NULL) > 0 THEN '✅'
    ELSE '⚠️'
  END || ' Plantas con datos médicos: ' || 
  (SELECT COUNT(*) FROM plants WHERE therapeutic_indications IS NOT NULL)::TEXT as check_4;

-- ================================================
-- ACCIONES RECOMENDADAS
-- ================================================
SELECT '=== PRÓXIMOS PASOS ===' as info;

-- Si no hay plantas con datos médicos
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM plants WHERE therapeutic_indications IS NOT NULL) = 0 THEN
    RAISE NOTICE '📝 ACCIÓN: Agregar datos médicos a algunas plantas';
    RAISE NOTICE 'Ejemplo:';
    RAISE NOTICE 'UPDATE plants SET therapeutic_indications = ''Ayuda digestiva'', safe_pregnancy = true WHERE id = 1;';
  ELSE
    RAISE NOTICE '✅ Hay plantas con datos médicos';
  END IF;
END $$;

-- ================================================
-- QUERY DE PRUEBA MANUAL
-- ================================================
-- Ejecuta esto para probar la función directamente
-- (Reemplaza el UUID con tu user_id real)

SELECT 
  '=== PRUEBA MANUAL DE LA FUNCIÓN ===' as info,
  'Copia y ejecuta esta query con tu user_id:' as instruccion;

SELECT 
  'SELECT * FROM get_recommended_plants_for_user(''TU-USER-ID-AQUI'');' as query_ejemplo;
