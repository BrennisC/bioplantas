-- ================================================
-- AGREGAR CAMPOS MÉDICOS A LA TABLA PLANTS
-- ================================================
-- Estos campos permiten información médica detallada
-- sin cambiar la estructura actual de categorías

-- 1. Agregar nuevos campos médicos
ALTER TABLE plants ADD COLUMN IF NOT EXISTS therapeutic_indications TEXT;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS contraindications TEXT;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS side_effects TEXT;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS drug_interactions TEXT;

-- Dosificación
ALTER TABLE plants ADD COLUMN IF NOT EXISTS dosage_adults TEXT;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS dosage_children TEXT;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS administration_route TEXT[]; -- ['oral', 'topica', 'inhalacion']
ALTER TABLE plants ADD COLUMN IF NOT EXISTS preparation_method TEXT; -- infusion, decoccion, tintura, etc

-- Seguridad
ALTER TABLE plants ADD COLUMN IF NOT EXISTS safe_pregnancy BOOLEAN DEFAULT false;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS safe_lactation BOOLEAN DEFAULT false;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS safe_children BOOLEAN DEFAULT false;

-- Evidencia científica
ALTER TABLE plants ADD COLUMN IF NOT EXISTS evidence_level TEXT CHECK (evidence_level IN ('A', 'B', 'C', 'D', NULL));
ALTER TABLE plants ADD COLUMN IF NOT EXISTS clinical_studies TEXT;

-- Consideraciones de enfermería
ALTER TABLE plants ADD COLUMN IF NOT EXISTS nursing_notes TEXT;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS monitoring_parameters TEXT[];

-- 2. Comentarios descriptivos
COMMENT ON COLUMN plants.therapeutic_indications IS 'Indicaciones terapéuticas y usos médicos';
COMMENT ON COLUMN plants.contraindications IS 'Contraindicaciones y advertencias';
COMMENT ON COLUMN plants.side_effects IS 'Efectos secundarios y reacciones adversas';
COMMENT ON COLUMN plants.drug_interactions IS 'Interacciones con medicamentos';
COMMENT ON COLUMN plants.dosage_adults IS 'Dosis recomendada para adultos';
COMMENT ON COLUMN plants.dosage_children IS 'Dosis para niños (si aplica)';
COMMENT ON COLUMN plants.administration_route IS 'Vías de administración';
COMMENT ON COLUMN plants.preparation_method IS 'Método de preparación';
COMMENT ON COLUMN plants.safe_pregnancy IS 'Seguro durante el embarazo';
COMMENT ON COLUMN plants.safe_lactation IS 'Seguro durante la lactancia';
COMMENT ON COLUMN plants.safe_children IS 'Seguro para uso pediátrico';
COMMENT ON COLUMN plants.evidence_level IS 'Nivel de evidencia científica (A=Alto, D=Bajo)';
COMMENT ON COLUMN plants.clinical_studies IS 'Referencias a estudios clínicos';
COMMENT ON COLUMN plants.nursing_notes IS 'Notas y consideraciones para enfermería';
COMMENT ON COLUMN plants.monitoring_parameters IS 'Parámetros a monitorear';

-- 3. Índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_plants_safe_pregnancy ON plants(safe_pregnancy) WHERE safe_pregnancy = true;
CREATE INDEX IF NOT EXISTS idx_plants_safe_lactation ON plants(safe_lactation) WHERE safe_lactation = true;
CREATE INDEX IF NOT EXISTS idx_plants_safe_children ON plants(safe_children) WHERE safe_children = true;
CREATE INDEX IF NOT EXISTS idx_plants_evidence_level ON plants(evidence_level);

-- ================================================
-- VERIFICAR CAMPOS CREADOS
-- ================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'plants'
  AND column_name IN (
    'therapeutic_indications',
    'contraindications', 
    'side_effects',
    'drug_interactions',
    'dosage_adults',
    'dosage_children',
    'safe_pregnancy',
    'safe_lactation',
    'safe_children',
    'evidence_level',
    'nursing_notes'
  )
ORDER BY ordinal_position;
