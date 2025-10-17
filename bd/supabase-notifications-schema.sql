-- ================================================
-- SISTEMA DE NOTIFICACIONES
-- ================================================
-- Tabla para almacenar notificaciones enviadas por admin
-- y recibirlas por usuarios

-- 1. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'announcement')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- 3. Comentarios descriptivos
COMMENT ON TABLE notifications IS 'Notificaciones enviadas a usuarios (generalmente por admin)';
COMMENT ON COLUMN notifications.user_id IS 'Usuario que recibe la notificación';
COMMENT ON COLUMN notifications.title IS 'Título de la notificación';
COMMENT ON COLUMN notifications.message IS 'Contenido del mensaje';
COMMENT ON COLUMN notifications.type IS 'Tipo: info, success, warning, announcement';
COMMENT ON COLUMN notifications.read IS 'Si el usuario ya leyó la notificación';
COMMENT ON COLUMN notifications.created_by IS 'Admin que envió la notificación';

-- 4. RLS (Row Level Security) Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden marcar como leídas sus notificaciones
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins pueden crear notificaciones para cualquier usuario
CREATE POLICY "Admins can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins pueden ver todas las notificaciones
CREATE POLICY "Admins can view all notifications"
  ON notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins pueden eliminar notificaciones
CREATE POLICY "Admins can delete notifications"
  ON notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 4. Función para contar notificaciones no leídas
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM notifications
    WHERE user_id = user_uuid
    AND read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función para marcar todas como leídas
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE
  WHERE user_id = user_uuid
  AND read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- VERIFICAR CREACIÓN
-- ================================================
-- Ejecutar esto para verificar:
/*
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
*/

-- ================================================
-- RESULTADO ESPERADO:
-- ================================================
-- ✅ Tabla notifications creada con RLS
-- ✅ Usuarios ven solo sus notificaciones
-- ✅ Admins pueden enviar a todos
-- ✅ Función para contar no leídas
-- ✅ Función para marcar todas como leídas
-- ================================================
