-- ================================================
-- AGREGAR CAMPOS DE BOTANIC INDEX A PLANTS
-- ================================================
-- Script para agregar campos editables por admin
-- para las secciones del Botanic Index

-- 1. Agregar campo "usage_instructions" (Cómo preparar y usar)
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS usage_instructions TEXT;

-- 2. Agregar campo "warnings" (Advertencias y contraindicaciones)
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS warnings TEXT;

-- 3. Agregar campo "scientific_article_url" (Enlace a artículo científico)
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS scientific_article_url TEXT;

-- 4. Comentarios descriptivos
COMMENT ON COLUMN plants.usage_instructions IS 'Instrucciones de preparación y uso de la planta (infusiones, tópico, etc). Editable por admin.';
COMMENT ON COLUMN plants.warnings IS 'Advertencias, contraindicaciones y precauciones. Editable por admin.';
COMMENT ON COLUMN plants.scientific_article_url IS 'URL del artículo científico o estudio sobre la planta. Editable por admin.';

-- ================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ================================================
-- Puedes descomentar esto para agregar datos de ejemplo

/*
UPDATE plants 
SET usage_instructions = E'💧 Infusión / Té:\nHervir agua y añadir 1-2 cucharaditas de la planta seca. Dejar reposar 5-10 minutos. Colar y beber.\n\n🧴 Uso Tópico:\nPreparar una infusión concentrada y aplicar con compresas sobre la zona afectada.'
WHERE usage_instructions IS NULL;

UPDATE plants 
SET warnings = E'⚠️ Precauciones:\n• No usar durante el embarazo sin consultar a un médico\n• Puede interactuar con ciertos medicamentos\n• No exceder las dosis recomendadas\n• Suspender si aparecen reacciones adversas\n\n⚠️ Consulta siempre a un profesional de la salud antes de usar plantas medicinales.'
WHERE warnings IS NULL;

UPDATE plants
SET scientific_article_url = 'https://pubmed.ncbi.nlm.nih.gov/'
WHERE scientific_article_url IS NULL;
*/

-- ================================================
-- VERIFICAR CAMBIOS
-- ================================================
-- Ejecutar esto para ver la estructura actualizada:
/*
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'plants'
AND column_name IN ('usage_instructions', 'warnings', 'scientific_article_url')
ORDER BY ordinal_position;
*/

-- ================================================
-- RESULTADO ESPERADO:
-- ================================================
-- ✅ Campo usage_instructions agregado (TEXT, NULL permitido)
-- ✅ Campo warnings agregado (TEXT, NULL permitido)
-- ✅ Campo scientific_article_url agregado (TEXT, NULL permitido)
-- ✅ Admin puede editar desde el panel
-- ✅ PlantDetail muestra info dinámica
-- ================================================
