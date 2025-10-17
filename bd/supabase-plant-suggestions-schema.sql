  -- ================================================
  -- SISTEMA DE SUGERENCIAS DE PLANTAS
  -- ================================================
  -- Los usuarios pueden sugerir plantas nuevas o correcciones
  -- El admin revisa, aprueba o rechaza las sugerencias

  -- 1. Crear tabla de sugerencias
  CREATE TABLE IF NOT EXISTS plant_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('new', 'correction')),
    
    -- Si es corrección, referencia a la planta existente
    plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
    
    -- Datos de la planta sugerida
    name TEXT NOT NULL,
    scientific_name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    properties TEXT,
    image TEXT,
    tags TEXT[],
    ailments TEXT[],
    usage_instructions TEXT,
    warnings TEXT,
    
    -- Razón de la sugerencia (para correcciones)
    reason TEXT,
    
    -- Estado de la sugerencia
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Respuesta del admin
    admin_comment TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 2. Crear índices
  CREATE INDEX IF NOT EXISTS idx_plant_suggestions_user_id ON plant_suggestions(user_id);
  CREATE INDEX IF NOT EXISTS idx_plant_suggestions_status ON plant_suggestions(status);
  CREATE INDEX IF NOT EXISTS idx_plant_suggestions_created_at ON plant_suggestions(created_at);
  CREATE INDEX IF NOT EXISTS idx_plant_suggestions_plant_id ON plant_suggestions(plant_id);

  -- 3. Comentarios descriptivos
  COMMENT ON TABLE plant_suggestions IS 'Sugerencias de plantas enviadas por usuarios';
  COMMENT ON COLUMN plant_suggestions.suggestion_type IS 'Tipo: new (nueva planta) o correction (corrección de existente)';
  COMMENT ON COLUMN plant_suggestions.plant_id IS 'ID de planta existente si es corrección';
  COMMENT ON COLUMN plant_suggestions.status IS 'Estado: pending, approved, rejected';
  COMMENT ON COLUMN plant_suggestions.reason IS 'Razón de la sugerencia o qué se debe corregir';
  COMMENT ON COLUMN plant_suggestions.admin_comment IS 'Comentario del admin al aprobar/rechazar';

  -- 4. RLS (Row Level Security) Policies
  ALTER TABLE plant_suggestions ENABLE ROW LEVEL SECURITY;

  -- Limpiar políticas existentes primero
  DROP POLICY IF EXISTS "Users can view their own suggestions" ON plant_suggestions;
  DROP POLICY IF EXISTS "Authenticated users can create suggestions" ON plant_suggestions;
  DROP POLICY IF EXISTS "Users can update their pending suggestions" ON plant_suggestions;
  DROP POLICY IF EXISTS "Admins can view all suggestions" ON plant_suggestions;
  DROP POLICY IF EXISTS "Admins can update any suggestion" ON plant_suggestions;
  DROP POLICY IF EXISTS "Admins can delete suggestions" ON plant_suggestions;

  -- Usuarios pueden ver sus propias sugerencias
  CREATE POLICY "Users can view their own suggestions"
    ON plant_suggestions
    FOR SELECT
    USING (auth.uid() = user_id);

  -- Usuarios autenticados pueden crear sugerencias
  CREATE POLICY "Authenticated users can create suggestions"
    ON plant_suggestions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  -- Usuarios pueden actualizar sus propias sugerencias pendientes
  CREATE POLICY "Users can update their pending suggestions"
    ON plant_suggestions
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id AND status = 'pending');

  -- Admins pueden ver todas las sugerencias
  CREATE POLICY "Admins can view all suggestions"
    ON plant_suggestions
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

  -- Admins pueden actualizar cualquier sugerencia
  CREATE POLICY "Admins can update any suggestion"
    ON plant_suggestions
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

  -- Admins pueden eliminar sugerencias
  CREATE POLICY "Admins can delete suggestions"
    ON plant_suggestions
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );

  -- 5. Trigger para actualizar updated_at
  DROP TRIGGER IF EXISTS update_plant_suggestions_updated_at_trigger ON plant_suggestions;
  
  CREATE OR REPLACE FUNCTION update_plant_suggestions_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER update_plant_suggestions_updated_at_trigger
    BEFORE UPDATE ON plant_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_plant_suggestions_updated_at();

  -- 6. Función para aprobar sugerencia y crear/actualizar planta
  CREATE OR REPLACE FUNCTION approve_plant_suggestion(
    suggestion_id UUID,
    admin_id UUID,
    comment TEXT DEFAULT NULL
  )
  RETURNS VOID AS $$
  DECLARE
    suggestion RECORD;
    new_plant_id UUID;
  BEGIN
    -- Obtener la sugerencia
    SELECT * INTO suggestion
    FROM plant_suggestions
    WHERE id = suggestion_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Sugerencia no encontrada';
    END IF;

    IF suggestion.status != 'pending' THEN
      RAISE EXCEPTION 'La sugerencia ya ha sido revisada';
    END IF;

    -- Actualizar estado de la sugerencia
    UPDATE plant_suggestions
    SET 
      status = 'approved',
      reviewed_by = admin_id,
      reviewed_at = NOW(),
      admin_comment = comment
    WHERE id = suggestion_id;

    -- Si es una nueva planta, crearla
    IF suggestion.suggestion_type = 'new' THEN
      INSERT INTO plants (
        name,
        scientific_name,
        description,
        category,
        properties,
        image,
        tags,
        ailments,
        usage_instructions,
        warnings
      )
      VALUES (
        suggestion.name,
        suggestion.scientific_name,
        suggestion.description,
        suggestion.category,
        suggestion.properties,
        suggestion.image,
        suggestion.tags,
        suggestion.ailments,
        suggestion.usage_instructions,
        suggestion.warnings
      )
      RETURNING id INTO new_plant_id;
    
    -- Si es una corrección, actualizar la planta existente
    ELSIF suggestion.suggestion_type = 'correction' AND suggestion.plant_id IS NOT NULL THEN
      UPDATE plants
      SET
        name = COALESCE(suggestion.name, plants.name),
        scientific_name = COALESCE(suggestion.scientific_name, plants.scientific_name),
        description = COALESCE(suggestion.description, plants.description),
        category = COALESCE(suggestion.category, plants.category),
        properties = COALESCE(suggestion.properties, plants.properties),
        image = COALESCE(suggestion.image, plants.image),
        tags = COALESCE(suggestion.tags, plants.tags),
        ailments = COALESCE(suggestion.ailments, plants.ailments),
        usage_instructions = COALESCE(suggestion.usage_instructions, plants.usage_instructions),
        warnings = COALESCE(suggestion.warnings, plants.warnings),
        updated_at = NOW()
      WHERE id = suggestion.plant_id;
      
      new_plant_id := suggestion.plant_id;
    END IF;

    -- Notificar al usuario
    INSERT INTO notifications (user_id, title, message, type, created_by)
    VALUES (
      suggestion.user_id,
      '✅ Sugerencia aprobada',
      CASE 
        WHEN suggestion.suggestion_type = 'new' THEN
          'Tu sugerencia "' || suggestion.name || '" ha sido aprobada y añadida al catálogo.'
        ELSE
          'Tu corrección para "' || suggestion.name || '" ha sido aprobada y aplicada.'
      END,
      'success',
      admin_id
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- 7. Función para rechazar sugerencia
  CREATE OR REPLACE FUNCTION reject_plant_suggestion(
    suggestion_id UUID,
    admin_id UUID,
    reason TEXT
  )
  RETURNS VOID AS $$
  DECLARE
    suggestion RECORD;
  BEGIN
    -- Obtener la sugerencia
    SELECT * INTO suggestion
    FROM plant_suggestions
    WHERE id = suggestion_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Sugerencia no encontrada';
    END IF;

    IF suggestion.status != 'pending' THEN
      RAISE EXCEPTION 'La sugerencia ya ha sido revisada';
    END IF;

    -- Actualizar estado
    UPDATE plant_suggestions
    SET 
      status = 'rejected',
      reviewed_by = admin_id,
      reviewed_at = NOW(),
      admin_comment = reason
    WHERE id = suggestion_id;

    -- Notificar al usuario
    INSERT INTO notifications (user_id, title, message, type, created_by)
    VALUES (
      suggestion.user_id,
      '❌ Sugerencia rechazada',
      'Tu sugerencia "' || suggestion.name || '" ha sido rechazada. Razón: ' || reason,
      'warning',
      admin_id
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- 8. Función para contar sugerencias pendientes (para admin)
  CREATE OR REPLACE FUNCTION get_pending_suggestions_count()
  RETURNS INTEGER AS $$
  BEGIN
    RETURN (
      SELECT COUNT(*)::INTEGER
      FROM plant_suggestions
      WHERE status = 'pending'
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- ================================================
  -- VERIFICAR CREACIÓN
  -- ================================================
  -- Ejecutar esto para verificar:
  /*
  SELECT 
    column_name, 
    data_type, 
    is_nullable
  FROM information_schema.columns
  WHERE table_name = 'plant_suggestions'
  ORDER BY ordinal_position;

  -- Ver políticas RLS
  SELECT policyname, permissive, roles, cmd 
  FROM pg_policies 
  WHERE tablename = 'plant_suggestions';
  */

  -- ================================================
  -- RESULTADO ESPERADO:
  -- ================================================
  -- ✅ Tabla plant_suggestions creada con RLS
  -- ✅ Usuarios pueden sugerir plantas
  -- ✅ Admins pueden aprobar/rechazar
  -- ✅ Notificaciones automáticas al usuario
  -- ✅ Función para aprobar crea/actualiza planta
  -- ✅ Función para rechazar con razón
  -- ================================================
