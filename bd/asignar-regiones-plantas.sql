-- ================================================
-- ASIGNAR REGIONES A PLANTAS EXISTENTES
-- ================================================
-- Clasificación basada en origen geográfico de cada planta
-- Costa: Plantas de zonas costeras y cálidas del Perú
-- Sierra: Plantas de zonas andinas y altitud
-- Selva: Plantas de la Amazonía peruana
-- NULL: Plantas introducidas de otros países
-- ================================================

-- ================================================
-- PASO 1: VER QUÉ PLANTAS TENEMOS
-- ================================================
-- Ejecuta esto primero para ver los nombres exactos en tu base de datos

SELECT 
  name as nombre_comun,
  scientific_name as nombre_cientifico,
  region as region_actual
FROM plants
ORDER BY name;

-- ================================================
-- PASO 2: ASIGNAR REGIONES
-- ================================================
-- Después de verificar los nombres, ejecuta lo siguiente:

-- ================================================
-- PLANTAS INTRODUCIDAS (Origen extranjero)
-- ================================================
-- Estas plantas NO son nativas del Perú, fueron introducidas

-- Manzanilla - Origen: Europa, Asia Menor
UPDATE plants SET region = NULL WHERE scientific_name = 'Matricaria chamomilla';

-- Jengibre - Origen: Sudeste Asiático
UPDATE plants SET region = NULL WHERE scientific_name = 'Zingiber officinale';

-- Lavanda - Origen: Mediterráneo (Europa)
UPDATE plants SET region = NULL WHERE scientific_name = 'Lavandula angustifolia';

-- Valeriana - Origen: Europa, Asia
-- Nota: Existe Valeriana pilosa en los Andes, pero Valeriana officinalis es europea
UPDATE plants SET region = NULL WHERE scientific_name = 'Valeriana officinalis';

-- Menta - Origen: Europa, Asia
UPDATE plants SET region = NULL WHERE scientific_name = 'Mentha piperita';

-- Equinácea - Origen: América del Norte
UPDATE plants SET region = NULL WHERE scientific_name = 'Echinacea purpurea';

-- ================================================
-- PLANTAS NATIVAS DEL PERÚ - POR REGIÓN
-- ================================================

-- 🌴 SELVA (Amazonía Peruana)
-- ================================================
-- Plantas que crecen en la región amazónica del Perú

-- Uña de gato - Uncaria tomentosa (Selva amazónica)
UPDATE plants SET region = 'Selva' WHERE name = 'Uña de gato';

-- Sangre de grado - Croton lechleri (Selva tropical)
UPDATE plants SET region = 'Selva' WHERE name = 'Sangre de grado';

-- Ayahuasca - Banisteriopsis caapi (Selva amazónica)
UPDATE plants SET region = 'Selva' WHERE name = 'Ayahuasca';

-- Copaiba - Copaifera officinalis (Selva amazónica)
UPDATE plants SET region = 'Selva' WHERE name = 'Copaiba';

-- Achiote - Bixa orellana (Selva y costa tropical)
UPDATE plants SET region = 'Selva' WHERE name = 'Achiote';

-- Chuchuhuasi - Maytenus krukovii (Selva amazónica)
UPDATE plants SET region = 'Selva' WHERE name = 'Chuchuhuasi';

-- Huito - Genipa americana (Selva)
UPDATE plants SET region = 'Selva' WHERE name = 'Huito';

-- Camu camu - Myrciaria dubia (Selva amazónica)
UPDATE plants SET region = 'Selva' WHERE name = 'Camu camu';

-- ⛰️ SIERRA (Andes Peruanos)
-- ================================================
-- Plantas que crecen en zonas andinas (2000-4500 msnm)

-- Maca - Lepidium meyenii (Andes peruanos, 4000-4500 msnm)
UPDATE plants SET region = 'Sierra' WHERE name = 'Maca';

-- Muña - Minthostachys mollis (Andes, 2500-3500 msnm)
UPDATE plants SET region = 'Sierra' WHERE name = 'Muña';

-- Huamanpinta - Chuquiraga spinosa (Andes, 3500-4500 msnm)
UPDATE plants SET region = 'Sierra' WHERE name = 'Huamanpinta';

-- Hercampuri - Gentianella alborosea (Andes, 3500-4200 msnm)
UPDATE plants SET region = 'Sierra' WHERE name = 'Hercampuri';

-- Matico - Piper aduncum (Andes y selva alta)
UPDATE plants SET region = 'Sierra' WHERE name = 'Matico';

-- Chinchilcoma - Mutisia acuminata (Andes)
UPDATE plants SET region = 'Sierra' WHERE name = 'Chinchilcoma';

-- Quinua - Chenopodium quinoa (Andes, 2500-4000 msnm)
UPDATE plants SET region = 'Sierra' WHERE name = 'Quinua';

-- Huanarpo - Jatropha macrantha (Valles andinos)
UPDATE plants SET region = 'Sierra' WHERE name = 'Huanarpo';

-- Ortiga andina - Urtica urens (Andes)
UPDATE plants SET region = 'Sierra' WHERE name = 'Ortiga';

-- Canchalagua - Schkuhria pinnata (Andes)
UPDATE plants SET region = 'Sierra' WHERE name = 'Canchalagua';

-- 🌊 COSTA (Costa Peruana)
-- ================================================
-- Plantas de zonas costeras y valles interandinos bajos

-- Tara - Caesalpinia spinosa (Costa y valles interandinos)
UPDATE plants SET region = 'Costa' WHERE name = 'Tara';

-- Yacón - Smallanthus sonchifolius (Valles interandinos, costa)
UPDATE plants SET region = 'Costa' WHERE name = 'Yacón';

-- Llantén - Plantago major (Costa y sierra baja, introducida pero naturalizada)
UPDATE plants SET region = 'Costa' WHERE name = 'Llantén';

-- Paico - Dysphania ambrosioides (Costa y valles)
UPDATE plants SET region = 'Costa' WHERE name = 'Paico';

-- Saúco - Sambucus peruviana (Costa y sierra baja)
UPDATE plants SET region = 'Costa' WHERE name = 'Saúco';

-- ================================================
-- VERIFICAR ASIGNACIONES
-- ================================================

-- Ver distribución por región
SELECT 
  CASE 
    WHEN region IS NULL THEN '🌍 Introducidas (Extranjeras)'
    WHEN region = 'Costa' THEN '🌊 Costa'
    WHEN region = 'Sierra' THEN '⛰️ Sierra'
    WHEN region = 'Selva' THEN '🌴 Selva'
  END as region_emoji,
  COUNT(*) as total_plantas
FROM plants
GROUP BY region
ORDER BY total_plantas DESC;

-- Ver plantas por región con nombre científico
SELECT 
  CASE 
    WHEN region IS NULL THEN '🌍 Introducidas'
    WHEN region = 'Costa' THEN '🌊 Costa'
    WHEN region = 'Sierra' THEN '⛰️ Sierra'
    WHEN region = 'Selva' THEN '🌴 Selva'
  END as region_emoji,
  name as nombre_comun,
  scientific_name as nombre_cientifico,
  category as categoria
FROM plants
ORDER BY 
  CASE 
    WHEN region = 'Sierra' THEN 1
    WHEN region = 'Selva' THEN 2
    WHEN region = 'Costa' THEN 3
    ELSE 4
  END,
  name;

-- ================================================
-- RESUMEN DETALLADO
-- ================================================

-- PLANTAS DE LA SIERRA (Andes)
SELECT '⛰️ SIERRA - Plantas Andinas' as titulo;
SELECT name, scientific_name, category 
FROM plants 
WHERE region = 'Sierra' 
ORDER BY name;

-- PLANTAS DE LA SELVA (Amazonía)
SELECT '🌴 SELVA - Plantas Amazónicas' as titulo;
SELECT name, scientific_name, category 
FROM plants 
WHERE region = 'Selva' 
ORDER BY name;

-- PLANTAS DE LA COSTA
SELECT '🌊 COSTA - Plantas Costeras' as titulo;
SELECT name, scientific_name, category 
FROM plants 
WHERE region = 'Costa' 
ORDER BY name;

-- PLANTAS INTRODUCIDAS (No nativas del Perú)
SELECT '🌍 INTRODUCIDAS - Plantas de otros países' as titulo;
SELECT name, scientific_name, category 
FROM plants 
WHERE region IS NULL 
ORDER BY name;

-- ================================================
-- ESTADÍSTICAS FINALES
-- ================================================
SELECT 
  '📊 RESUMEN FINAL' as titulo,
  COUNT(*) as total_plantas,
  COUNT(CASE WHEN region = 'Sierra' THEN 1 END) as sierra,
  COUNT(CASE WHEN region = 'Selva' THEN 1 END) as selva,
  COUNT(CASE WHEN region = 'Costa' THEN 1 END) as costa,
  COUNT(CASE WHEN region IS NULL THEN 1 END) as introducidas
FROM plants;

-- ================================================
-- NOTAS IMPORTANTES
-- ================================================
/*
🌍 PLANTAS INTRODUCIDAS (NO NATIVAS):
- Manzanilla: Europa/Asia Menor
- Jengibre: Sudeste Asiático
- Lavanda: Mediterráneo
- Valeriana: Europa/Asia
- Menta: Europa/Asia
- Equinácea: América del Norte

⛰️ PLANTAS DE LA SIERRA (Andes):
- Crecen entre 2500-4500 msnm
- Adaptadas al frío y altitud
- Ejemplos: Maca, Muña, Hercampuri

🌴 PLANTAS DE LA SELVA (Amazonía):
- Clima tropical húmedo
- Biodiversidad amazónica
- Ejemplos: Uña de gato, Sangre de grado

🌊 PLANTAS DE LA COSTA:
- Zonas costeras y valles bajos
- Clima seco y cálido
- Ejemplos: Tara, Yacón, Paico

CRITERIO DE CLASIFICACIÓN:
- Se basa en el origen geográfico natural de la planta
- Plantas introducidas = NULL (no son del Perú)
- Plantas nativas = Asignadas a su región de origen
*/
