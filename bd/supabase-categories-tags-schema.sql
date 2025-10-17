-- ================================================
-- SCHEMA PARA CATEGORÍAS Y TAGS DINÁMICOS
-- ================================================

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.plant_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#10b981',
    icon TEXT DEFAULT 'leaf',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Tags
CREATE TABLE IF NOT EXISTS public.plant_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT DEFAULT 'general', -- 'medicinal', 'general', 'uso', etc.
    color TEXT DEFAULT '#3b82f6',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Dolencias/Ailments
CREATE TABLE IF NOT EXISTS public.plant_ailments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    severity TEXT DEFAULT 'minor', -- 'minor', 'moderate', 'major'
    category TEXT DEFAULT 'general', -- 'digestivo', 'respiratorio', 'nervioso', etc.
    color TEXT DEFAULT '#22c55e',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_plant_categories_name ON public.plant_categories(name);
CREATE INDEX IF NOT EXISTS idx_plant_tags_name ON public.plant_tags(name);
CREATE INDEX IF NOT EXISTS idx_plant_ailments_name ON public.plant_ailments(name);

-- RLS (Row Level Security) Policies
ALTER TABLE public.plant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_ailments ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes antes de crearlas
DROP POLICY IF EXISTS "Categorías son visibles para todos" ON public.plant_categories;
DROP POLICY IF EXISTS "Tags son visibles para todos" ON public.plant_tags;
DROP POLICY IF EXISTS "Dolencias son visibles para todos" ON public.plant_ailments;

DROP POLICY IF EXISTS "Solo admins pueden insertar categorías" ON public.plant_categories;
DROP POLICY IF EXISTS "Solo admins pueden actualizar categorías" ON public.plant_categories;
DROP POLICY IF EXISTS "Solo admins pueden eliminar categorías" ON public.plant_categories;

DROP POLICY IF EXISTS "Solo admins pueden insertar tags" ON public.plant_tags;
DROP POLICY IF EXISTS "Solo admins pueden actualizar tags" ON public.plant_tags;
DROP POLICY IF EXISTS "Solo admins pueden eliminar tags" ON public.plant_tags;

DROP POLICY IF EXISTS "Solo admins pueden insertar dolencias" ON public.plant_ailments;
DROP POLICY IF EXISTS "Solo admins pueden actualizar dolencias" ON public.plant_ailments;
DROP POLICY IF EXISTS "Solo admins pueden eliminar dolencias" ON public.plant_ailments;

-- Todos pueden leer
CREATE POLICY "Categorías son visibles para todos" ON public.plant_categories FOR SELECT USING (true);
CREATE POLICY "Tags son visibles para todos" ON public.plant_tags FOR SELECT USING (true);
CREATE POLICY "Dolencias son visibles para todos" ON public.plant_ailments FOR SELECT USING (true);

-- Solo admins pueden insertar/actualizar/eliminar
CREATE POLICY "Solo admins pueden insertar categorías" ON public.plant_categories FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Solo admins pueden actualizar categorías" ON public.plant_categories FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Solo admins pueden eliminar categorías" ON public.plant_categories FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Mismas policies para tags
CREATE POLICY "Solo admins pueden insertar tags" ON public.plant_tags FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Solo admins pueden actualizar tags" ON public.plant_tags FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Solo admins pueden eliminar tags" ON public.plant_tags FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Mismas policies para ailments
CREATE POLICY "Solo admins pueden insertar dolencias" ON public.plant_ailments FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Solo admins pueden actualizar dolencias" ON public.plant_ailments FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Solo admins pueden eliminar dolencias" ON public.plant_ailments FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- ================================================
-- DATOS INICIALES (SEED)
-- ================================================

-- Insertar categorías MÉDICAS por defecto (sincronizadas con medical_conditions)
INSERT INTO public.plant_categories (name, description, color, display_order) VALUES
    ('Gastrointestinal', 'Trastornos del sistema digestivo', '#f59e0b', 1),
    ('Hepatobiliar', 'Trastornos del hígado y vesícula', '#eab308', 2),
    ('Respiratorio', 'Enfermedades del sistema respiratorio', '#06b6d4', 3),
    ('Nervioso', 'Trastornos nerviosos y salud mental', '#8b5cf6', 4),
    ('Cardiovascular', 'Enfermedades del corazón y circulación', '#ef4444', 5),
    ('Musculoesquelético', 'Dolor articular y muscular', '#f97316', 6),
    ('Dermatológico', 'Afecciones de la piel', '#ec4899', 7),
    ('Genitourinario', 'Trastornos urinarios', '#14b8a6', 8),
    ('Hormonal', 'Desequilibrios hormonales', '#a855f7', 9),
    ('Inmunológico', 'Sistema inmune y defensas', '#22c55e', 10),
    ('Metabólico', 'Trastornos metabólicos', '#84cc16', 11),
    ('Neurológico', 'Enfermedades neurológicas', '#6366f1', 12),
    ('Inflamatorio', 'Procesos inflamatorios crónicos', '#dc2626', 13)
ON CONFLICT (name) DO NOTHING;

-- Insertar TAGS MÉDICOS (sincronizados con medical_conditions)
INSERT INTO public.plant_tags (name, description, category, display_order) VALUES
    -- SISTEMA GASTROINTESTINAL
    ('Gastritis', 'Inflamación de la mucosa gástrica', 'gastrointestinal', 1),
    ('Úlcera gástrica', 'Lesión en la mucosa del estómago', 'gastrointestinal', 2),
    ('Úlcera duodenal', 'Lesión en el duodeno', 'gastrointestinal', 3),
    ('Dispepsia', 'Indigestión, mala digestión', 'gastrointestinal', 4),
    ('Náuseas', 'Ganas de vomitar', 'gastrointestinal', 5),
    ('Vómitos', 'Expulsión del contenido gástrico', 'gastrointestinal', 6),
    ('Síndrome del intestino irritable', 'SII - colon irritable', 'gastrointestinal', 7),
    ('Cólicos abdominales', 'Dolor abdominal espasmódico', 'gastrointestinal', 8),
    ('Flatulencia', 'Gases intestinales excesivos', 'gastrointestinal', 9),
    ('Meteorismo', 'Distensión abdominal por gases', 'gastrointestinal', 10),
    ('Estreñimiento', 'Dificultad para evacuar', 'gastrointestinal', 11),
    ('Diarrea crónica', 'Evacuaciones líquidas frecuentes', 'gastrointestinal', 12),
    ('Insuficiencia digestiva', 'Mala digestión de alimentos', 'gastrointestinal', 13),
    ('Insuficiencia biliar', 'Deficiente producción de bilis', 'gastrointestinal', 14),
    
    -- SISTEMA HEPATOBILIAR
    ('Hígado graso', 'Esteatosis hepática', 'hepatobiliar', 15),
    ('Insuficiencia hepática', 'Función hepática reducida', 'hepatobiliar', 16),
    ('Colesterol alto', 'Hipercolesterolemia', 'hepatobiliar', 17),
    ('Triglicéridos elevados', 'Hipertrigliceridemia', 'hepatobiliar', 18),
    ('Cálculos biliares', 'Piedras en vesícula biliar', 'hepatobiliar', 19),
    ('Discinesia biliar', 'Disfunción de vesícula biliar', 'hepatobiliar', 20),
    
    -- SISTEMA RESPIRATORIO
    ('Asma', 'Enfermedad obstructiva de vías aéreas', 'respiratorio', 21),
    ('Bronquitis aguda', 'Inflamación bronquial temporal', 'respiratorio', 22),
    ('Bronquitis crónica', 'Inflamación bronquial persistente', 'respiratorio', 23),
    ('EPOC', 'Enfermedad pulmonar obstructiva crónica', 'respiratorio', 24),
    ('Tos seca', 'Tos irritativa sin expectoración', 'respiratorio', 25),
    ('Tos productiva', 'Tos con expectoración de moco', 'respiratorio', 26),
    ('Sinusitis', 'Inflamación de senos paranasales', 'respiratorio', 27),
    ('Rinosinusitis', 'Inflamación nasal y sinusal', 'respiratorio', 28),
    ('Congestión nasal', 'Nariz tapada', 'respiratorio', 29),
    ('Faringitis', 'Inflamación de faringe - garganta', 'respiratorio', 30),
    ('Laringitis', 'Inflamación de laringe - ronquera', 'respiratorio', 31),
    ('Rinitis alérgica', 'Alergia nasal estacional', 'respiratorio', 32),
    ('Gripe', 'Influenza - infección viral', 'respiratorio', 33),
    ('Resfriado común', 'Infección viral respiratoria leve', 'respiratorio', 34),
    
    -- SISTEMA NERVIOSO Y SALUD MENTAL
    ('Ansiedad', 'Trastorno de ansiedad generalizada', 'nervioso', 35),
    ('Nerviosismo', 'Estado de nervios, intranquilidad', 'nervioso', 36),
    ('Estrés', 'Tensión mental o emocional', 'nervioso', 37),
    ('Insomnio', 'Dificultad para conciliar o mantener sueño', 'nervioso', 38),
    ('Trastornos del sueño', 'Alteraciones del patrón de sueño', 'nervioso', 39),
    ('Depresión leve', 'Estado depresivo leve', 'nervioso', 40),
    ('Irritabilidad', 'Facilidad para molestarse', 'nervioso', 41),
    ('Fatiga mental', 'Cansancio cognitivo', 'nervioso', 42),
    
    -- SISTEMA CARDIOVASCULAR
    ('Hipertensión', 'Presión arterial alta', 'cardiovascular', 43),
    ('Hipotensión', 'Presión arterial baja', 'cardiovascular', 44),
    ('Insuficiencia cardíaca leve', 'Función cardíaca reducida', 'cardiovascular', 45),
    ('Arritmias', 'Alteraciones del ritmo cardíaco', 'cardiovascular', 46),
    ('Palpitaciones', 'Latidos cardíacos perceptibles', 'cardiovascular', 47),
    ('Claudicación intermitente', 'Dolor en piernas al caminar', 'cardiovascular', 48),
    ('Insuficiencia venosa', 'Mala circulación venosa', 'cardiovascular', 49),
    ('Varices', 'Venas varicosas', 'cardiovascular', 50),
    ('Hemorroides', 'Varices en zona anal', 'cardiovascular', 51),
    
    -- SISTEMA MUSCULOESQUELÉTICO
    ('Artritis', 'Inflamación de articulaciones', 'musculoesquelético', 52),
    ('Osteoartritis', 'Desgaste articular', 'musculoesquelético', 53),
    ('Artritis reumatoide', 'Enfermedad autoinmune articular', 'musculoesquelético', 54),
    ('Dolor articular', 'Artralgias', 'musculoesquelético', 55),
    ('Dolor lumbar', 'Dolor en zona baja de espalda', 'musculoesquelético', 56),
    ('Dolor muscular', 'Mialgia', 'musculoesquelético', 57),
    ('Fibromialgia', 'Dolor generalizado crónico', 'musculoesquelético', 58),
    ('Esguinces', 'Lesión ligamentosa', 'musculoesquelético', 59),
    ('Contusiones', 'Golpes y hematomas', 'musculoesquelético', 60),
    ('Tendinitis', 'Inflamación de tendones', 'musculoesquelético', 61),
    ('Dolor neuropático', 'Dolor de origen nervioso', 'musculoesquelético', 62),
    
    -- SISTEMA DERMATOLÓGICO
    ('Dermatitis atópica', 'Eczema atópico', 'dermatológico', 63),
    ('Psoriasis', 'Enfermedad inflamatoria de la piel', 'dermatológico', 64),
    ('Acné', 'Acné vulgar', 'dermatológico', 65),
    ('Heridas superficiales', 'Cortes y abrasiones', 'dermatológico', 66),
    ('Quemaduras leves', 'Quemaduras de 1er grado', 'dermatológico', 67),
    ('Quemaduras solares', 'Daño por exposición solar', 'dermatológico', 68),
    ('Picaduras de insectos', 'Reacción a picaduras', 'dermatológico', 69),
    ('Hematomas', 'Moretones', 'dermatológico', 70),
    ('Piel seca', 'Xerosis cutánea', 'dermatológico', 71),
    ('Prurito', 'Picazón en la piel', 'dermatológico', 72),
    
    -- SISTEMA GENITOURINARIO
    ('Cistitis aguda', 'Infección de vejiga', 'genitourinario', 73),
    ('Infecciones urinarias recurrentes', 'ITU recurrente', 'genitourinario', 74),
    ('Prostatitis', 'Inflamación de próstata', 'genitourinario', 75),
    ('Retención de líquidos', 'Edema', 'genitourinario', 76),
    ('Litiasis renal', 'Cálculos renales', 'genitourinario', 77),
    
    -- SISTEMA HORMONAL
    ('Síndrome premenstrual', 'SPM - síntomas pre-menstruales', 'hormonal', 78),
    ('Dismenorrea', 'Dolor menstrual', 'hormonal', 79),
    ('Irregularidades menstruales', 'Ciclo menstrual irregular', 'hormonal', 80),
    ('Menopausia', 'Síntomas menopáusicos', 'hormonal', 81),
    ('Sofocos', 'Calores menopáusicos', 'hormonal', 82),
    ('Mastalgia', 'Dolor en mamas', 'hormonal', 83),
    
    -- SISTEMA INMUNOLÓGICO
    ('Infecciones respiratorias recurrentes', 'Resfriados frecuentes', 'inmunológico', 84),
    ('Inmunodeficiencia', 'Sistema inmune debilitado', 'inmunológico', 85),
    ('Fatiga crónica', 'Cansancio persistente', 'inmunológico', 86),
    ('Infecciones virales', 'Infecciones por virus', 'inmunológico', 87),
    
    -- SISTEMA METABÓLICO
    ('Diabetes tipo 2', 'Diabetes mellitus', 'metabólico', 88),
    ('Obesidad', 'Exceso de peso corporal', 'metabólico', 89),
    ('Síndrome metabólico', 'Conjunto de factores de riesgo', 'metabólico', 90),
    
    -- SISTEMA NEUROLÓGICO
    ('Migraña', 'Dolor de cabeza intenso', 'neurológico', 91),
    ('Cefalea tensional', 'Dolor de cabeza por tensión', 'neurológico', 92),
    ('Deterioro cognitivo leve', 'Pérdida leve de memoria', 'neurológico', 93),
    ('Neuralgia', 'Dolor de origen nervioso', 'neurológico', 94),
    
    -- INFLAMACIÓN Y DOLOR
    ('Inflamación crónica', 'Proceso inflamatorio persistente', 'inflamatorio', 95),
    ('Enfermedades inflamatorias crónicas', 'Patologías inflamatorias', 'inflamatorio', 96),
    ('Trauma musculoesquelético', 'Lesiones por trauma', 'inflamatorio', 97)
ON CONFLICT (name) DO NOTHING;

-- Insertar dolencias por defecto
INSERT INTO public.plant_ailments (name, description, severity, category, display_order) VALUES
    ('Dolor de cabeza', 'Cefalea o migraña', 'minor', 'nervioso', 1),
    ('Dolor de estómago', 'Molestias digestivas', 'minor', 'digestivo', 2),
    ('Insomnio', 'Dificultad para dormir', 'moderate', 'nervioso', 3),
    ('Ansiedad', 'Estado de nerviosismo', 'moderate', 'nervioso', 4),
    ('Estrés', 'Tensión mental o emocional', 'moderate', 'nervioso', 5),
    ('Tos', 'Expulsión de aire de los pulmones', 'minor', 'respiratorio', 6),
    ('Resfriado', 'Infección respiratoria leve', 'minor', 'respiratorio', 7),
    ('Gripe', 'Infección viral respiratoria', 'moderate', 'respiratorio', 8),
    ('Fiebre', 'Temperatura corporal elevada', 'moderate', 'general', 9),
    ('Náuseas', 'Ganas de vomitar', 'minor', 'digestivo', 10),
    ('Diarrea', 'Evacuaciones líquidas frecuentes', 'moderate', 'digestivo', 11),
    ('Estreñimiento', 'Dificultad para evacuar', 'minor', 'digestivo', 12),
    ('Acidez estomacal', 'Sensación de ardor en estómago', 'minor', 'digestivo', 13),
    ('Inflamación', 'Hinchazón de tejidos', 'moderate', 'general', 14),
    ('Artritis', 'Inflamación de articulaciones', 'major', 'musculoesquelético', 15),
    ('Dolor muscular', 'Molestia en músculos', 'minor', 'musculoesquelético', 16),
    ('Heridas', 'Lesiones en la piel', 'minor', 'dermatológico', 17),
    ('Quemaduras', 'Daño por calor o químicos', 'moderate', 'dermatológico', 18),
    ('Acné', 'Inflamación de glándulas sebáceas', 'minor', 'dermatológico', 19),
    ('Dermatitis', 'Inflamación de la piel', 'moderate', 'dermatológico', 20),
    ('Presión arterial alta', 'Hipertensión', 'major', 'cardiovascular', 21),
    ('Colesterol alto', 'Niveles elevados de lípidos', 'major', 'cardiovascular', 22),
    ('Diabetes', 'Niveles altos de azúcar en sangre', 'major', 'metabólico', 23),
    ('Retención de líquidos', 'Acumulación de líquido en tejidos', 'moderate', 'general', 24)
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- FUNCIONES ÚTILES
-- ================================================

-- Función para obtener conteo de uso de categorías
CREATE OR REPLACE FUNCTION get_category_usage_count(category_name TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM public.plants 
        WHERE category = category_name
    );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener conteo de uso de tags
CREATE OR REPLACE FUNCTION get_tag_usage_count(tag_name TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM public.plants 
        WHERE tags @> ARRAY[tag_name]::TEXT[]
    );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener conteo de uso de ailments
CREATE OR REPLACE FUNCTION get_ailment_usage_count(ailment_name TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM public.plants 
        WHERE ailments @> ARRAY[ailment_name]::TEXT[]
    );
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- FUNCIÓN DE FILTRADO MÉDICO INTELIGENTE
-- ================================================
-- Filtra plantas según las condiciones médicas del usuario
-- y su estado especial (embarazo, lactancia, niños)

CREATE OR REPLACE FUNCTION get_plants_for_user_conditions(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    scientific_name TEXT,
    image TEXT,
    category TEXT,
    tags TEXT[],
    description TEXT,
    properties TEXT,
    therapeutic_indications TEXT,
    safe_pregnancy BOOLEAN,
    safe_lactation BOOLEAN,
    safe_children BOOLEAN,
    evidence_level TEXT,
    relevance_score INTEGER,
    matched_conditions TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH user_conditions AS (
        -- Obtener condiciones del usuario desde medical_conditions
        SELECT 
            COALESCE(ump.conditions, '{}') as condition_ids,
            COALESCE(ump.is_pregnant, false) as is_pregnant,
            COALESCE(ump.is_lactating, false) as is_lactating,
            COALESCE(ump.has_children, false) as has_children
        FROM user_medical_profile ump
        WHERE ump.user_id = p_user_id
    ),
    user_condition_names AS (
        -- Convertir IDs de condiciones a nombres
        SELECT ARRAY_AGG(mc.name) as condition_names
        FROM user_conditions uc
        CROSS JOIN LATERAL unnest(uc.condition_ids) AS condition_id
        JOIN medical_conditions mc ON mc.id = condition_id
    )
    SELECT 
        p.id,
        p.name,
        p.scientific_name,
        p.image,
        p.category,
        p.tags,
        p.description,
        p.properties,
        p.therapeutic_indications,
        COALESCE(p.safe_pregnancy, false) as safe_pregnancy,
        COALESCE(p.safe_lactation, false) as safe_lactation,
        COALESCE(p.safe_children, false) as safe_children,
        p.evidence_level,
        -- Calcular score de relevancia
        (
            -- Puntos por coincidencia de tags con condiciones del usuario
            (SELECT COUNT(*) * 10 FROM unnest(p.tags) tag 
             WHERE tag = ANY(ucn.condition_names)) +
            -- Puntos por seguridad según estado del usuario
            CASE WHEN uc.is_pregnant AND COALESCE(p.safe_pregnancy, false) THEN 15 ELSE 0 END +
            CASE WHEN uc.is_lactating AND COALESCE(p.safe_lactation, false) THEN 15 ELSE 0 END +
            CASE WHEN uc.has_children AND COALESCE(p.safe_children, false) THEN 10 ELSE 0 END +
            -- Puntos por nivel de evidencia
            CASE p.evidence_level
                WHEN 'Alto' THEN 5
                WHEN 'Moderado' THEN 3
                WHEN 'Bajo' THEN 1
                ELSE 0
            END
        )::INTEGER as relevance_score,
        -- Array de condiciones que coinciden
        ARRAY(
            SELECT tag FROM unnest(p.tags) tag 
            WHERE tag = ANY(ucn.condition_names)
        ) as matched_conditions
    FROM plants p
    CROSS JOIN user_conditions uc
    CROSS JOIN user_condition_names ucn
    WHERE 
        -- Filtrar plantas no seguras según estado del usuario
        (NOT uc.is_pregnant OR COALESCE(p.safe_pregnancy, true)) AND
        (NOT uc.is_lactating OR COALESCE(p.safe_lactation, true)) AND
        (NOT uc.has_children OR COALESCE(p.safe_children, true)) AND
        -- Al menos una coincidencia con condiciones del usuario
        EXISTS (
            SELECT 1 FROM unnest(p.tags) tag 
            WHERE tag = ANY(ucn.condition_names)
        )
    ORDER BY relevance_score DESC, p.name
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- FUNCIÓN DE BÚSQUEDA POR TAG O CATEGORÍA
-- ================================================
-- Busca plantas por tag médico o categoría

CREATE OR REPLACE FUNCTION search_plants_by_medical_tag(
    p_tag_name TEXT DEFAULT NULL,
    p_category_name TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    scientific_name TEXT,
    image TEXT,
    category TEXT,
    tags TEXT[],
    description TEXT,
    properties TEXT,
    safe_pregnancy BOOLEAN,
    safe_lactation BOOLEAN,
    safe_children BOOLEAN,
    evidence_level TEXT,
    is_safe_for_user BOOLEAN
) AS $$
DECLARE
    v_is_pregnant BOOLEAN := false;
    v_is_lactating BOOLEAN := false;
    v_has_children BOOLEAN := false;
BEGIN
    -- Obtener estado del usuario si se proporciona user_id
    IF p_user_id IS NOT NULL THEN
        SELECT 
            COALESCE(is_pregnant, false),
            COALESCE(is_lactating, false),
            COALESCE(has_children, false)
        INTO v_is_pregnant, v_is_lactating, v_has_children
        FROM user_medical_profile
        WHERE user_id = p_user_id;
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.scientific_name,
        p.image,
        p.category,
        p.tags,
        p.description,
        p.properties,
        COALESCE(p.safe_pregnancy, false) as safe_pregnancy,
        COALESCE(p.safe_lactation, false) as safe_lactation,
        COALESCE(p.safe_children, false) as safe_children,
        p.evidence_level,
        -- Verificar si es segura para el usuario
        (
            (NOT v_is_pregnant OR COALESCE(p.safe_pregnancy, true)) AND
            (NOT v_is_lactating OR COALESCE(p.safe_lactation, true)) AND
            (NOT v_has_children OR COALESCE(p.safe_children, true))
        ) as is_safe_for_user
    FROM plants p
    WHERE 
        -- Filtrar por tag si se proporciona
        (p_tag_name IS NULL OR p.tags @> ARRAY[p_tag_name]::TEXT[]) AND
        -- Filtrar por categoría si se proporciona
        (p_category_name IS NULL OR p.category ILIKE '%' || p_category_name || '%')
    ORDER BY 
        -- Priorizar plantas seguras para el usuario
        CASE WHEN (
            (NOT v_is_pregnant OR COALESCE(p.safe_pregnancy, true)) AND
            (NOT v_is_lactating OR COALESCE(p.safe_lactation, true)) AND
            (NOT v_has_children OR COALESCE(p.safe_children, true))
        ) THEN 0 ELSE 1 END,
        p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- FUNCIÓN PARA OBTENER TAGS MÁS RELEVANTES
-- ================================================
-- Obtiene los tags más comunes según las plantas del usuario

CREATE OR REPLACE FUNCTION get_relevant_tags_for_user(p_user_id UUID)
RETURNS TABLE (
    tag_name TEXT,
    tag_description TEXT,
    tag_category TEXT,
    plant_count INTEGER,
    user_has_condition BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH user_condition_names AS (
        SELECT ARRAY_AGG(mc.name) as conditions
        FROM user_medical_profile ump
        JOIN LATERAL unnest(ump.conditions) AS condition_id ON true
        JOIN medical_conditions mc ON mc.id = condition_id
        WHERE ump.user_id = p_user_id
    )
    SELECT 
        pt.name as tag_name,
        pt.description as tag_description,
        pt.category as tag_category,
        COUNT(DISTINCT p.id)::INTEGER as plant_count,
        (pt.name = ANY(ucn.conditions)) as user_has_condition
    FROM plant_tags pt
    LEFT JOIN plants p ON p.tags @> ARRAY[pt.name]::TEXT[]
    CROSS JOIN user_condition_names ucn
    WHERE 
        -- Solo tags que el usuario tiene o que tienen plantas
        (pt.name = ANY(ucn.conditions) OR COUNT(p.id) > 0)
    GROUP BY pt.name, pt.description, pt.category, ucn.conditions
    ORDER BY 
        user_has_condition DESC,
        plant_count DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
