-- ================================================
-- ARREGLAR MÓDULOS DEL ADMINISTRADOR
-- ================================================
-- Este script arregla:
-- 1. Tendencias (trending plants)
-- 2. Favoritos
-- 3. Categorías (tablas para gestión)
-- 4. Sugerencias (ya tienes el script, solo ejecutarlo)

-- ================================================
-- 1. CREAR TABLAS PARA CATEGORÍAS GESTIONABLES
-- ================================================

-- Tabla de categorías editables
CREATE TABLE IF NOT EXISTS plant_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tags editables
CREATE TABLE IF NOT EXISTS plant_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de dolencias editables
CREATE TABLE IF NOT EXISTS plant_ailments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 2. INSERTAR CATEGORÍAS POR DEFECTO
-- ================================================

INSERT INTO plant_categories (name, description, display_order)
VALUES
  ('Hierbas', 'Plantas herbáceas medicinales', 1),
  ('Árboles', 'Árboles medicinales', 2),
  ('Arbustos', 'Arbustos y matorrales', 3),
  ('Flores', 'Plantas con flores medicinales', 4),
  ('Enredaderas', 'Plantas trepadoras', 5),
  ('Suculentas', 'Plantas suculentas', 6),
  ('Helechos', 'Helechos y plantas afines', 7),
  ('Plantas Acuáticas', 'Plantas de ambientes húmedos', 8),
  ('Cactus', 'Cactáceas', 9),
  ('Medicinales', 'Plantas medicinales diversas', 10),
  ('Aromáticas', 'Plantas aromáticas', 11),
  ('Comestibles', 'Plantas comestibles', 12)
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- 3. POLÍTICAS RLS PARA CATEGORÍAS
-- ================================================

ALTER TABLE plant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_ailments ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver
CREATE POLICY "Anyone can view categories" ON plant_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view tags" ON plant_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can view ailments" ON plant_ailments FOR SELECT USING (true);

-- Solo admins pueden modificar
CREATE POLICY "Admins can manage categories" ON plant_categories FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can manage tags" ON plant_tags FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can manage ailments" ON plant_ailments FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ================================================
-- 4. VERIFICAR TABLAS DE FAVORITOS
-- ================================================

-- Ver estructura de favorites
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- Debería tener: id, user_id, plant_id, created_at

-- ================================================
-- 5. FUNCIÓN PARA OBTENER PLANTAS POPULARES
-- ================================================

CREATE OR REPLACE FUNCTION get_popular_plants(limit_count INT DEFAULT 10)
RETURNS TABLE (
  plant_id UUID,
  plant_name TEXT,
  scientific_name TEXT,
  category TEXT,
  image TEXT,
  favorite_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as plant_id,
    p.name as plant_name,
    p.scientific_name,
    p.category,
    p.image,
    COUNT(f.id) as favorite_count
  FROM plants p
  LEFT JOIN favorites f ON p.id = f.plant_id
  GROUP BY p.id, p.name, p.scientific_name, p.category, p.image
  ORDER BY favorite_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 6. FUNCIÓN PARA OBTENER TENDENCIAS (últimos 7 días)
-- ================================================

CREATE OR REPLACE FUNCTION get_trending_plants(limit_count INT DEFAULT 10)
RETURNS TABLE (
  plant_id UUID,
  plant_name TEXT,
  scientific_name TEXT,
  category TEXT,
  image TEXT,
  recent_favorites BIGINT,
  total_favorites BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as plant_id,
    p.name as plant_name,
    p.scientific_name,
    p.category,
    p.image,
    COUNT(CASE WHEN f.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_favorites,
    COUNT(f.id) as total_favorites
  FROM plants p
  LEFT JOIN favorites f ON p.id = f.plant_id
  GROUP BY p.id, p.name, p.scientific_name, p.category, p.image
  HAVING COUNT(CASE WHEN f.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) > 0
  ORDER BY recent_favorites DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- VERIFICACIÓN FINAL
-- ================================================

-- Ver categorías
SELECT * FROM plant_categories ORDER BY display_order;

-- Ver plantas populares
SELECT * FROM get_popular_plants(5);

-- Ver plantas en tendencia
SELECT * FROM get_trending_plants(5);

-- ================================================
-- RESULTADO ESPERADO:
-- ================================================
-- ✅ Tablas de categorías/tags/ailments creadas
-- ✅ Políticas RLS configuradas
-- ✅ Funciones para popular/trending creadas
-- ✅ Datos de prueba insertados
-- ✅ Ahora el admin puede gestionar categorías
-- ✅ Tendencias y Favoritos funcionan
-- ================================================
