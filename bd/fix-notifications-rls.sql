-- ================================================
-- CORRECCIÓN DE POLÍTICAS RLS - NOTIFICATIONS
-- ================================================
-- Problema: Las políticas referenciaban tabla 'users' 
-- que ya no existe. Debe ser 'profiles'
-- ================================================

-- 1. ELIMINAR POLÍTICAS ANTIGUAS
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- 2. RECREAR POLÍTICAS CORRECTAS (usando 'profiles' en lugar de 'users')

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
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins pueden ver todas las notificaciones
CREATE POLICY "Admins can view all notifications"
  ON notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins pueden eliminar notificaciones
CREATE POLICY "Admins can delete notifications"
  ON notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. VERIFICAR POLÍTICAS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;

-- ================================================
-- RESULTADO ESPERADO:
-- ================================================
-- ✅ 5 políticas recreadas correctamente
-- ✅ Ahora usan tabla 'profiles' en lugar de 'users'
-- ✅ Admins pueden insertar notificaciones
-- ✅ Usuarios pueden ver solo las suyas
-- ================================================

-- 4. PRUEBA RÁPIDA (ejecutar como admin)
/*
-- Verificar tu rol actual:
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- Si eres admin, esto debería funcionar:
INSERT INTO notifications (user_id, title, message, type, created_by)
VALUES (
  auth.uid(),
  'Prueba',
  'Mensaje de prueba',
  'info',
  auth.uid()
);

-- Ver notificaciones:
SELECT * FROM notifications WHERE user_id = auth.uid();
*/
