-- ================================================
-- PERFIL MÉDICO DEL USUARIO
-- ================================================
-- Almacena las condiciones médicas de cada usuario
-- para hacer recomendaciones personalizadas

-- 1. Tabla de condiciones médicas disponibles
CREATE TABLE IF NOT EXISTS medical_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- Nombre de la condición
  category TEXT NOT NULL, -- Categoría (cardiovascular, digestivo, etc)
  description TEXT,
  icon TEXT, -- Emoji o nombre de icono
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Insertar condiciones médicas comunes (sincronizadas con tags de plantas)
INSERT INTO medical_conditions (name, category, description, icon) VALUES
-- ============================================
-- SISTEMA GASTROINTESTINAL
-- ============================================
('Gastritis', 'gastrointestinal', 'Inflamación de la mucosa gástrica', '🔥'),
('Úlcera gástrica', 'gastrointestinal', 'Lesión en la mucosa del estómago', '🩹'),
('Úlcera duodenal', 'gastrointestinal', 'Lesión en el duodeno', '🩹'),
('Dispepsia', 'gastrointestinal', 'Indigestión, mala digestión', '�'),
('Náuseas', 'gastrointestinal', 'Ganas de vomitar', '🤢'),
('Vómitos', 'gastrointestinal', 'Expulsión del contenido gástrico', '🤮'),
('Síndrome del intestino irritable', 'gastrointestinal', 'SII - colon irritable', '🌊'),
('Cólicos abdominales', 'gastrointestinal', 'Dolor abdominal espasmódico', '💢'),
('Flatulencia', 'gastrointestinal', 'Gases intestinales excesivos', '💨'),
('Meteorismo', 'gastrointestinal', 'Distensión abdominal por gases', '🎈'),
('Estreñimiento', 'gastrointestinal', 'Dificultad para evacuar', '🚽'),
('Diarrea crónica', 'gastrointestinal', 'Evacuaciones líquidas frecuentes', '💧'),
('Insuficiencia digestiva', 'gastrointestinal', 'Mala digestión de alimentos', '🍽️'),
('Insuficiencia biliar', 'gastrointestinal', 'Deficiente producción de bilis', '🟡'),
('Colitis ulcerosa', 'gastrointestinal', 'Enfermedad inflamatoria intestinal', '�'),
('Enfermedad de Crohn', 'gastrointestinal', 'Enfermedad inflamatoria intestinal', '🔴'),

-- ============================================
-- SISTEMA HEPATOBILIAR
-- ============================================
('Hígado graso', 'hepatobiliar', 'Esteatosis hepática', '🫀'),
('Insuficiencia hepática', 'hepatobiliar', 'Función hepática reducida', '⚠️'),
('Colesterol alto', 'hepatobiliar', 'Hipercolesterolemia', '🩸'),
('Triglicéridos elevados', 'hepatobiliar', 'Hipertrigliceridemia', '🩸'),
('Cálculos biliares', 'hepatobiliar', 'Piedras en vesícula biliar', '�'),
('Discinesia biliar', 'hepatobiliar', 'Disfunción de vesícula biliar', '🟡'),

-- ============================================
-- SISTEMA RESPIRATORIO
-- ============================================
('Asma', 'respiratorio', 'Enfermedad obstructiva de vías aéreas', '🫁'),
('Bronquitis aguda', 'respiratorio', 'Inflamación bronquial temporal', '😮‍💨'),
('Bronquitis crónica', 'respiratorio', 'Inflamación bronquial persistente', '�‍💨'),
('EPOC', 'respiratorio', 'Enfermedad pulmonar obstructiva crónica', '🫁'),
('Tos seca', 'respiratorio', 'Tos irritativa sin expectoración', '😷'),
('Tos productiva', 'respiratorio', 'Tos con expectoración de moco', '🤧'),
('Sinusitis', 'respiratorio', 'Inflamación de senos paranasales', '😤'),
('Rinosinusitis', 'respiratorio', 'Inflamación nasal y sinusal', '🤧'),
('Congestión nasal', 'respiratorio', 'Nariz tapada', '👃'),
('Faringitis', 'respiratorio', 'Inflamación de faringe - garganta', '🗣️'),
('Laringitis', 'respiratorio', 'Inflamación de laringe - ronquera', '🔇'),
('Traqueítis', 'respiratorio', 'Inflamación de tráquea', '😮'),
('Rinitis alérgica', 'respiratorio', 'Alergia nasal estacional', '🌸'),
('Gripe', 'respiratorio', 'Influenza - infección viral', '🤒'),
('Resfriado común', 'respiratorio', 'Infección viral respiratoria leve', '🤧'),

-- ============================================
-- SISTEMA NERVIOSO Y SALUD MENTAL
-- ============================================
('Ansiedad', 'nervioso', 'Trastorno de ansiedad generalizada', '😰'),
('Nerviosismo', 'nervioso', 'Estado de nervios, intranquilidad', '😬'),
('Estrés', 'nervioso', 'Tensión mental o emocional', '😓'),
('Insomnio', 'nervioso', 'Dificultad para conciliar o mantener sueño', '😴'),
('Trastornos del sueño', 'nervioso', 'Alteraciones del patrón de sueño', '🌙'),
('Depresión leve', 'nervioso', 'Estado depresivo leve', '😔'),
('Irritabilidad', 'nervioso', 'Facilidad para molestarse', '😠'),
('Fatiga mental', 'nervioso', 'Cansancio cognitivo', '🧠'),

-- ============================================
-- SISTEMA CARDIOVASCULAR
-- ============================================
('Hipertensión', 'cardiovascular', 'Presión arterial alta', '💔'),
('Hipotensión', 'cardiovascular', 'Presión arterial baja', '💙'),
('Insuficiencia cardíaca leve', 'cardiovascular', 'Función cardíaca reducida', '❤️'),
('Arritmias', 'cardiovascular', 'Alteraciones del ritmo cardíaco', '💓'),
('Palpitaciones', 'cardiovascular', 'Latidos cardíacos perceptibles', '�'),
('Claudicación intermitente', 'cardiovascular', 'Dolor en piernas al caminar', '🚶'),
('Insuficiencia venosa', 'cardiovascular', 'Mala circulación venosa', '🦵'),
('Varices', 'cardiovascular', 'Venas varicosas', '🔵'),
('Hemorroides', 'cardiovascular', 'Varices en zona anal', '🔴'),

-- ============================================
-- SISTEMA MUSCULOESQUELÉTICO
-- ============================================
('Artritis', 'musculoesquelético', 'Inflamación de articulaciones', '🦴'),
('Osteoartritis', 'musculoesquelético', 'Desgaste articular', '🦴'),
('Artritis reumatoide', 'musculoesquelético', 'Enfermedad autoinmune articular', '🦴'),
('Dolor articular', 'musculoesquelético', 'Artralgias', '😖'),
('Dolor lumbar', 'musculoesquelético', 'Dolor en zona baja de espalda', '🔙'),
('Dolor muscular', 'musculoesquelético', 'Mialgia', '💪'),
('Fibromialgia', 'musculoesquelético', 'Dolor generalizado crónico', '🤕'),
('Esguinces', 'musculoesquelético', 'Lesión ligamentosa', '🩹'),
('Contusiones', 'musculoesquelético', 'Golpes y hematomas', '🟣'),
('Tendinitis', 'musculoesquelético', 'Inflamación de tendones', '💢'),
('Dolor neuropático', 'musculoesquelético', 'Dolor de origen nervioso', '⚡'),

-- ============================================
-- SISTEMA DERMATOLÓGICO
-- ============================================
('Dermatitis atópica', 'dermatológico', 'Eczema atópico', '🩹'),
('Psoriasis', 'dermatológico', 'Enfermedad inflamatoria de la piel', '🔴'),
('Acné', 'dermatológico', 'Acné vulgar', '😣'),
('Heridas superficiales', 'dermatológico', 'Cortes y abrasiones', '🩹'),
('Quemaduras leves', 'dermatológico', 'Quemaduras de 1er grado', '🔥'),
('Quemaduras solares', 'dermatológico', 'Daño por exposición solar', '☀️'),
('Picaduras de insectos', 'dermatológico', 'Reacción a picaduras', '🦟'),
('Hematomas', 'dermatológico', 'Moretones', '🟣'),
('Piel seca', 'dermatológico', 'Xerosis cutánea', '🏜️'),
('Prurito', 'dermatológico', 'Picazón en la piel', '😖'),

-- ============================================
-- SISTEMA GENITOURINARIO
-- ============================================
('Cistitis aguda', 'genitourinario', 'Infección de vejiga', '🚻'),
('Infecciones urinarias recurrentes', 'genitourinario', 'ITU recurrente', '🔁'),
('Prostatitis', 'genitourinario', 'Inflamación de próstata', '👨'),
('Retención de líquidos', 'genitourinario', 'Edema', '💧'),
('Litiasis renal', 'genitourinario', 'Cálculos renales', '💎'),

-- ============================================
-- SISTEMA HORMONAL
-- ============================================
('Síndrome premenstrual', 'hormonal', 'SPM - síntomas pre-menstruales', '📅'),
('Dismenorrea', 'hormonal', 'Dolor menstrual', '😖'),
('Irregularidades menstruales', 'hormonal', 'Ciclo menstrual irregular', '📆'),
('Menopausia', 'hormonal', 'Síntomas menopáusicos', '🌡️'),
('Sofocos', 'hormonal', 'Calores menopáusicos', '🔥'),
('Mastalgia', 'hormonal', 'Dolor en mamas', '🤱'),

-- ============================================
-- SISTEMA INMUNOLÓGICO
-- ============================================
('Infecciones respiratorias recurrentes', 'inmunológico', 'Resfriados frecuentes', '🔁'),
('Inmunodeficiencia', 'inmunológico', 'Sistema inmune debilitado', '🛡️'),
('Fatiga crónica', 'inmunológico', 'Cansancio persistente', '😴'),
('Infecciones virales', 'inmunológico', 'Infecciones por virus', '🦠'),

-- ============================================
-- SISTEMA METABÓLICO
-- ============================================
('Diabetes tipo 2', 'metabólico', 'Diabetes mellitus', '🍬'),
('Obesidad', 'metabólico', 'Exceso de peso corporal', '⚖️'),
('Síndrome metabólico', 'metabólico', 'Conjunto de factores de riesgo', '⚠️'),

-- ============================================
-- SISTEMA NEUROLÓGICO
-- ============================================
('Migraña', 'neurológico', 'Dolor de cabeza intenso', '🤯'),
('Cefalea tensional', 'neurológico', 'Dolor de cabeza por tensión', '😖'),
('Deterioro cognitivo leve', 'neurológico', 'Pérdida leve de memoria', '🧠'),
('Neuralgia', 'neurológico', 'Dolor de origen nervioso', '⚡'),

-- ============================================
-- INFLAMACIÓN Y DOLOR
-- ============================================
('Inflamación crónica', 'inflamatorio', 'Proceso inflamatorio persistente', '�'),
('Enfermedades inflamatorias crónicas', 'inflamatorio', 'Patologías inflamatorias', '🔴'),
('Trauma musculoesquelético', 'inflamatorio', 'Lesiones por trauma', '💥')
ON CONFLICT (name) DO NOTHING;

-- 3. Tabla de perfil médico del usuario
CREATE TABLE IF NOT EXISTS user_medical_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Condiciones médicas
  conditions UUID[] DEFAULT '{}', -- Array de IDs de medical_conditions
  
  -- Estado especial
  is_pregnant BOOLEAN DEFAULT false,
  is_lactating BOOLEAN DEFAULT false,
  has_children BOOLEAN DEFAULT false,
  
  -- Medicamentos actuales
  current_medications TEXT[], -- Lista de medicamentos que toma
  
  -- Alergias
  allergies TEXT[], -- Alergias conocidas
  
  -- Preferencias
  preferred_administration TEXT[], -- oral, topica, inhalacion
  avoid_bitter_taste BOOLEAN DEFAULT false,
  
  -- Wizard completado
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_user_medical_profile_user_id ON user_medical_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_user_medical_profile_conditions ON user_medical_profile USING GIN(conditions);
CREATE INDEX IF NOT EXISTS idx_user_medical_profile_onboarding ON user_medical_profile(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_category ON medical_conditions(category);

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_user_medical_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe antes de crearlo
DROP TRIGGER IF EXISTS update_user_medical_profile_updated_at_trigger ON user_medical_profile;

CREATE TRIGGER update_user_medical_profile_updated_at_trigger
  BEFORE UPDATE ON user_medical_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_user_medical_profile_updated_at();

-- 6. RLS Policies
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_medical_profile ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Anyone can view medical conditions" ON medical_conditions;
DROP POLICY IF EXISTS "Users can view their own medical profile" ON user_medical_profile;
DROP POLICY IF EXISTS "Users can create their medical profile" ON user_medical_profile;
DROP POLICY IF EXISTS "Users can update their medical profile" ON user_medical_profile;
DROP POLICY IF EXISTS "Admins can view all medical profiles" ON user_medical_profile;

-- Todos pueden ver las condiciones médicas disponibles
CREATE POLICY "Anyone can view medical conditions"
  ON medical_conditions
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Usuarios pueden ver solo su propio perfil médico
CREATE POLICY "Users can view their own medical profile"
  ON user_medical_profile
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden crear su perfil médico
CREATE POLICY "Users can create their medical profile"
  ON user_medical_profile
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update their medical profile"
  ON user_medical_profile
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins pueden ver todos los perfiles (sin datos personales)
CREATE POLICY "Admins can view all medical profiles"
  ON user_medical_profile
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 7. Función para obtener plantas recomendadas según perfil

-- Eliminar la función anterior si existe (necesario porque cambiamos la firma)
DROP FUNCTION IF EXISTS get_recommended_plants_for_user(UUID);

CREATE OR REPLACE FUNCTION get_recommended_plants_for_user(p_user_id UUID)
RETURNS TABLE (
  id UUID,  -- ⬅️ CORREGIDO: UUID en vez de INTEGER
  common_name TEXT,
  scientific_name TEXT,
  image TEXT,  -- ⬅️ CORREGIDO: 'image' en vez de 'image_url'
  relevance_score INTEGER,
  therapeutic_indications TEXT,
  safe_pregnancy BOOLEAN,
  safe_lactation BOOLEAN,
  safe_children BOOLEAN,
  evidence_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_profile AS (
    SELECT 
      COALESCE(conditions, '{}') as conditions, 
      COALESCE(is_pregnant, false) as is_pregnant, 
      COALESCE(is_lactating, false) as is_lactating, 
      COALESCE(has_children, false) as has_children
    FROM user_medical_profile
    WHERE user_id = p_user_id
  )
  SELECT 
    p.id,
    p.name as common_name,  -- ⬅️ CORREGIDO: usar 'name' con alias
    p.scientific_name,
    p.image,  -- ⬅️ CORREGIDO: usar 'image' (no 'image_url')
    (
      -- Puntuación basada en coincidencias de seguridad
      CASE WHEN up.is_pregnant AND COALESCE(p.safe_pregnancy, false) THEN 10 ELSE 0 END +
      CASE WHEN up.is_lactating AND COALESCE(p.safe_lactation, false) THEN 10 ELSE 0 END +
      CASE WHEN up.has_children AND COALESCE(p.safe_children, false) THEN 10 ELSE 0 END +
      -- Puntos base para plantas con información médica
      CASE WHEN p.therapeutic_indications IS NOT NULL THEN 5 ELSE 0 END
    )::INTEGER as relevance_score,
    p.therapeutic_indications,
    COALESCE(p.safe_pregnancy, false) as safe_pregnancy,
    COALESCE(p.safe_lactation, false) as safe_lactation,
    COALESCE(p.safe_children, false) as safe_children,
    p.evidence_level
  FROM plants p
  CROSS JOIN user_profile up
  WHERE 
    -- Filtrar plantas no seguras según el perfil del usuario
    (NOT up.is_pregnant OR COALESCE(p.safe_pregnancy, true)) AND
    (NOT up.is_lactating OR COALESCE(p.safe_lactation, true)) AND
    (NOT up.has_children OR COALESCE(p.safe_children, true))
  ORDER BY relevance_score DESC, p.name  -- ⬅️ CORREGIDO: usar 'name'
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- VERIFICACIÓN
-- ================================================
-- Ver condiciones médicas creadas
SELECT * FROM medical_conditions ORDER BY category, name;

-- Ver estructura de user_medical_profile
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_medical_profile'
ORDER BY ordinal_position;
