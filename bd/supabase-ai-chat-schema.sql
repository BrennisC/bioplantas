-- =============================================
-- Sistema de IA con Google Gemini
-- Historial de conversaciones e identificaciones
-- =============================================

-- Tabla para historial de conversaciones del chat
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}', -- Metadata adicional (plantas mencionadas, etc.)
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para historial de identificaciones de plantas por imagen
CREATE TABLE IF NOT EXISTS ai_plant_identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  identified_plant_name TEXT,
  confidence_score DECIMAL(3,2), -- 0.00 a 1.00
  matched_plant_id UUID REFERENCES plants(id) ON DELETE SET NULL,
  gemini_response JSONB NOT NULL, -- Respuesta completa de Gemini
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX idx_ai_plant_identifications_user_id ON ai_plant_identifications(user_id);
CREATE INDEX idx_ai_plant_identifications_created_at ON ai_plant_identifications(created_at DESC);

-- =============================================
-- RLS Policies
-- =============================================

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_plant_identifications ENABLE ROW LEVEL SECURITY;

-- Políticas para ai_conversations
CREATE POLICY "Users can view their own conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations"
  ON ai_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Políticas para ai_plant_identifications
CREATE POLICY "Users can view their own identifications"
  ON ai_plant_identifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own identifications"
  ON ai_plant_identifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all identifications"
  ON ai_plant_identifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- =============================================
-- Funciones útiles
-- =============================================

-- Función para obtener historial de conversación de una sesión
CREATE OR REPLACE FUNCTION get_conversation_history(
  p_session_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  role TEXT,
  content TEXT,
  context JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai_conversations.id,
    ai_conversations.role,
    ai_conversations.content,
    ai_conversations.context,
    ai_conversations.created_at
  FROM ai_conversations
  WHERE ai_conversations.session_id = p_session_id
    AND ai_conversations.user_id = auth.uid()
  ORDER BY ai_conversations.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de uso de IA del usuario
CREATE OR REPLACE FUNCTION get_ai_usage_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_conversations', (
      SELECT COUNT(DISTINCT session_id) 
      FROM ai_conversations 
      WHERE user_id = p_user_id
    ),
    'total_messages', (
      SELECT COUNT(*) 
      FROM ai_conversations 
      WHERE user_id = p_user_id
    ),
    'total_identifications', (
      SELECT COUNT(*) 
      FROM ai_plant_identifications 
      WHERE user_id = p_user_id
    ),
    'total_tokens_used', (
      SELECT COALESCE(SUM(tokens_used), 0) 
      FROM ai_conversations 
      WHERE user_id = p_user_id
    ),
    'last_activity', (
      SELECT MAX(created_at) 
      FROM ai_conversations 
      WHERE user_id = p_user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar conversaciones antiguas (>90 días)
CREATE OR REPLACE FUNCTION cleanup_old_ai_conversations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_conversations
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Comentarios y documentación
-- =============================================

COMMENT ON TABLE ai_conversations IS 'Historial de conversaciones del chatbot de IA';
COMMENT ON TABLE ai_plant_identifications IS 'Historial de identificaciones de plantas por imagen usando Gemini Vision';
COMMENT ON COLUMN ai_conversations.session_id IS 'ID de sesión de chat (múltiples mensajes en una conversación)';
COMMENT ON COLUMN ai_conversations.context IS 'Metadata JSON con información adicional como plantas mencionadas';
COMMENT ON COLUMN ai_plant_identifications.confidence_score IS 'Nivel de confianza de la identificación (0.00 a 1.00)';
COMMENT ON COLUMN ai_plant_identifications.matched_plant_id IS 'ID de la planta del catálogo que mejor coincide con la identificación';
