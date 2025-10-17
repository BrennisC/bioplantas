-- ============================================
-- SISTEMA DE ROLES CON SEGURIDAD MEJORADA
-- ============================================

-- Tabla para registrar intentos fallidos de admin
CREATE TABLE IF NOT EXISTS public.admin_registration_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT false
);

-- Índice para búsquedas rápidas de intentos
CREATE INDEX IF NOT EXISTS idx_admin_attempts_email ON public.admin_registration_attempts(email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_attempts_ip ON public.admin_registration_attempts(ip_address, attempted_at DESC);

-- Función para verificar rate limiting
CREATE OR REPLACE FUNCTION check_admin_registration_rate_limit(
  p_email TEXT,
  p_ip_address TEXT,
  p_max_attempts INTEGER DEFAULT 3,
  p_window_minutes INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS $$
DECLARE
  failed_attempts INTEGER;
BEGIN
  -- Contar intentos fallidos en la ventana de tiempo
  SELECT COUNT(*)
  INTO failed_attempts
  FROM public.admin_registration_attempts
  WHERE 
    (email = p_email OR ip_address = p_ip_address)
    AND success = false
    AND attempted_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  RETURN failed_attempts < p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar intento
CREATE OR REPLACE FUNCTION log_admin_registration_attempt(
  p_email TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_success BOOLEAN
)
RETURNS UUID AS $$
DECLARE
  attempt_id UUID;
BEGIN
  INSERT INTO public.admin_registration_attempts (email, ip_address, user_agent, success)
  VALUES (p_email, p_ip_address, p_user_agent, p_success)
  RETURNING id INTO attempt_id;
  
  RETURN attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política RLS para admin_registration_attempts (solo lectura para admins)
ALTER TABLE public.admin_registration_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view registration attempts"
  ON public.admin_registration_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Vista para estadísticas de intentos (solo admins)
CREATE OR REPLACE VIEW admin_attempt_stats AS
SELECT 
  DATE_TRUNC('day', attempted_at) as date,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_attempts,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_attempts,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(DISTINCT ip_address) as unique_ips
FROM public.admin_registration_attempts
GROUP BY DATE_TRUNC('day', attempted_at)
ORDER BY date DESC;

-- Función para limpiar intentos antiguos (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_old_admin_attempts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.admin_registration_attempts
  WHERE attempted_at < NOW() - INTERVAL '30 days'
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
