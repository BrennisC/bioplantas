-- ============================================
-- VERIFICAR NOMBRES DE USUARIOS EN PROFILES
-- ============================================

-- Ver todos los usuarios con sus nombres
SELECT 
  id, 
  email, 
  first_name, 
  last_name,
  CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) as nombre_completo,
  role,
  created_at,
  CASE 
    WHEN first_name IS NULL AND last_name IS NULL THEN '❌ Sin nombres (NULL)'
    WHEN first_name = '' AND last_name = '' THEN '❌ Sin nombres (vacío)'
    WHEN first_name = '' OR first_name IS NULL THEN '⚠️ Sin primer nombre'
    WHEN last_name = '' OR last_name IS NULL THEN '⚠️ Sin apellido'
    ELSE '✅ OK'
  END as estado
FROM profiles
ORDER BY created_at DESC;

-- Ver solo usuarios con problemas de nombres
SELECT 
  id, 
  email, 
  first_name, 
  last_name,
  role,
  created_at
FROM profiles
WHERE (first_name IS NULL OR first_name = '') 
   OR (last_name IS NULL OR last_name = '')
ORDER BY created_at DESC;

-- Contar usuarios por estado de nombres
SELECT 
  CASE 
    WHEN first_name IS NULL AND last_name IS NULL THEN 'Sin nombres (NULL)'
    WHEN first_name = '' AND last_name = '' THEN 'Sin nombres (vacío)'
    WHEN first_name = '' OR first_name IS NULL THEN 'Sin primer nombre'
    WHEN last_name = '' OR last_name IS NULL THEN 'Sin apellido'
    ELSE 'Nombres completos'
  END as estado,
  COUNT(*) as cantidad
FROM profiles
GROUP BY estado
ORDER BY cantidad DESC;
