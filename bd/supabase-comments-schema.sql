-- Tabla de comentarios para plantas
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_comments_plant_id ON comments(plant_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer comentarios
CREATE POLICY "Anyone can view comments"
  ON comments
  FOR SELECT
  USING (true);

-- Política: Solo usuarios autenticados pueden crear comentarios
CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden editar sus propios comentarios
CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden eliminar sus propios comentarios
CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vista para obtener comentarios con información del usuario
CREATE OR REPLACE VIEW comments_with_user AS
SELECT 
  c.id,
  c.plant_id,
  c.user_id,
  c.content,
  c.rating,
  c.created_at,
  c.updated_at,
  u.email as user_email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as user_name
FROM comments c
JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC;
