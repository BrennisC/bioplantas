-- ============================================
-- BIOPLANTAS DATABASE SCHEMA FOR SUPABASE
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Policy for initial user creation (needed for the trigger)
CREATE POLICY "Service role can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- ============================================
-- PLANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  scientific_name TEXT,
  description TEXT,
  category TEXT,
  properties TEXT,
  image TEXT,
  tags TEXT[], -- Array of strings
  ailments TEXT[], -- Array of strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for plants
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plants"
  ON public.plants FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert plants"
  ON public.plants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update plants"
  ON public.plants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete plants"
  ON public.plants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plant_id) -- Prevent duplicate favorites
);

-- RLS Policies for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS TABLE (for future implementation)
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON public.plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Obtener el rol desde los metadatos del usuario (raw_user_meta_data)
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  
  -- Validar que el rol sea válido
  IF user_role NOT IN ('user', 'admin') THEN
    user_role := 'user';
  END IF;
  
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_plants_name ON public.plants(name);
CREATE INDEX IF NOT EXISTS idx_plants_category ON public.plants(category);
CREATE INDEX IF NOT EXISTS idx_plants_tags ON public.plants USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_plant_id ON public.favorites(plant_id);
CREATE INDEX IF NOT EXISTS idx_comments_plant_id ON public.comments(plant_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- ============================================
-- SEED DATA (Initial Plants)
-- ============================================
-- Nota: No especificamos 'id' para que se genere automáticamente con uuid_generate_v4()
INSERT INTO public.plants (name, scientific_name, description, category, properties, tags, ailments) VALUES
  ('Aloe Vera', 'Aloe barbadensis miller', 'Gel calmante para quemaduras y cuidado de la piel.', 'Suculentas', 'Cicatrizante, hidratante', ARRAY['piel', 'antiinflamatorio'], ARRAY['piel', 'quemaduras']),
  ('Manzanilla', 'Matricaria chamomilla', 'Infusión relajante y digestiva.', 'Flores', 'Calmantes, antiinflamatorias', ARRAY['digestivo', 'relajante'], ARRAY['ansiedad', 'insomnio', 'digestión']),
  ('Lavanda', 'Lavandula angustifolia', 'Relajante y aromática.', 'Flores', 'Relajantes, antisépticas', ARRAY['relajante', 'aromática'], ARRAY['estrés', 'insomnio']),
  ('Menta', 'Mentha spicata', 'Refrescante, ayuda con la digestión y el aliento.', 'Hierbas', 'Digestivas, refrescantes', ARRAY['digestivo', 'refrescante'], ARRAY['digestión', 'náuseas', 'dolor de cabeza']),
  ('Romero', 'Rosmarinus officinalis', 'Estimulante, antioxidante.', 'Hierbas', 'Estimulantes, antioxidantes', ARRAY['estimulante', 'antioxidante'], ARRAY['memoria', 'circulación']),
  ('Jengibre', 'Zingiber officinale', 'Ayuda con las náuseas y la digestión.', 'Raíces', 'Antiinflamatorias, digestivas', ARRAY['digestivo', 'antiinflamatorio'], ARRAY['náuseas', 'digestión', 'inflamación']);
