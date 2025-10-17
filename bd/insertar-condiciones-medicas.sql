-- ================================================
-- INSERTAR CONDICIONES MÉDICAS SIMPLIFICADAS
-- ================================================
-- Solo las dolencias que corresponden a las plantas que tenemos
-- Ejecutar este script en el SQL Editor de Supabase

-- Primero crear la tabla si no existe
CREATE TABLE IF NOT EXISTS medical_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Eliminar datos existentes (opcional)
-- TRUNCATE TABLE medical_conditions CASCADE;

-- Insertar SOLO las condiciones que tienen plantas asociadas
INSERT INTO medical_conditions (name, category, description, icon) VALUES
-- DOLENCIAS DIGESTIVAS
('Gastritis', 'digestivo', 'Inflamación del estómago', '🔥'),
('Dispepsia', 'digestivo', 'Mala digestión', '😰'),
('Náuseas', 'digestivo', 'Ganas de vomitar', '🤢'),
('Cólicos', 'digestivo', 'Dolor abdominal', '💢'),
('Gases', 'digestivo', 'Flatulencia', '💨'),

-- DOLENCIAS RESPIRATORIAS
('Tos', 'respiratorio', 'Tos seca o con flema', '😷'),
('Gripe', 'respiratorio', 'Infección viral', '�'),
('Resfriado', 'respiratorio', 'Congestión nasal', '🤧'),
('Bronquitis', 'respiratorio', 'Inflamación bronquios', '�'),

-- DOLENCIAS NERVIOSAS
('Ansiedad', 'nervioso', 'Nerviosismo', '😰'),
('Estrés', 'nervioso', 'Tensión mental', '😓'),
('Insomnio', 'nervioso', 'No poder dormir', '😴'),

-- DOLENCIAS ARTICULARES
('Artritis', 'articular', 'Dolor articulaciones', '🦴'),
('Dolor muscular', 'articular', 'Dolor músculos', '💪'),

-- OTRAS DOLENCIAS
('Dolor de cabeza', 'general', 'Cefalea', '🤕'),
('Infecciones', 'general', 'Defensas bajas', '🛡️')

ON CONFLICT (name) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT 
  category,
  COUNT(*) as cantidad
FROM medical_conditions
GROUP BY category
ORDER BY category;

-- Mostrar todas las condiciones
SELECT * FROM medical_conditions ORDER BY category, name;
