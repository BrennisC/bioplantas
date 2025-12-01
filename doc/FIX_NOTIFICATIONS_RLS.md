# 🔧 Solución: Error al enviar notificaciones

## ❌ Error Actual

```
new row violates row-level security policy for table "notifications"
```

## 🔍 Causa del Problema

Las políticas RLS (Row Level Security) de la tabla `notifications` están mal configuradas:
- Usan la tabla `users` (que ya no existe)
- Deberían usar la tabla `profiles`

## ✅ Solución

### Paso 1: Ejecutar Script SQL

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de: `bd/fix-notifications-rls.sql`
5. Click en **"Run"**

### Paso 2: Verificar Políticas

Ejecuta esta query para verificar:

```sql
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'notifications'
ORDER BY policyname;
```

Deberías ver **5 políticas**:
- ✅ `Admins can delete notifications`
- ✅ `Admins can insert notifications`
- ✅ `Admins can view all notifications`
- ✅ `Users can update their own notifications`
- ✅ `Users can view their own notifications`

### Paso 3: Verificar tu Rol de Admin

```sql
SELECT id, email, role 
FROM profiles 
WHERE id = auth.uid();
```

**Debe decir:** `role = 'admin'`

Si dice `'user'`, ejecuta:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

### Paso 4: Probar Notificación

1. Ve a **Dashboard** → **Notificaciones**
2. Click en **"Enviar Notificación"**
3. Completa:
   - Título: "Prueba"
   - Mensaje: "Mensaje de prueba"
   - Tipo: Anuncio
   - Destinatarios: **Todos los usuarios**
4. Click **"Enviar"**
5. Abre **consola del navegador** (F12)

**Logs esperados:**
```
📧 Enviando notificación... { target: 'all', currentUser: '...' }
👥 Usuarios encontrados: 5 [...]
📝 Insertando notificaciones: 5
✅ Notificaciones enviadas exitosamente
```

## 🐛 Si Sigue Fallando

### Verificar en consola (F12):

1. **Error de autenticación:**
   ```
   ❌ Error obteniendo usuarios: {...}
   ```
   → Tu sesión expiró, vuelve a hacer login

2. **Error de permisos:**
   ```
   ❌ Error insertando notificaciones: RLS policy violation
   ```
   → Tu usuario no tiene rol 'admin', ejecuta UPDATE arriba

3. **Sin destinatarios:**
   ```
   Sin destinatarios - No hay usuarios para enviar
   ```
   → No hay usuarios en la tabla profiles

### Verificar usuarios en BD:

```sql
SELECT id, email, role 
FROM profiles 
ORDER BY role, email;
```

Si no hay usuarios (o solo 1):
```sql
-- Verificar en auth.users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

Si existen en `auth.users` pero no en `profiles`, ejecuta:

```sql
-- Crear perfiles faltantes
INSERT INTO profiles (id, email, role)
SELECT 
  id, 
  email, 
  'user' as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

## 📋 Checklist de Verificación

- [ ] Script `fix-notifications-rls.sql` ejecutado
- [ ] 5 políticas RLS verificadas
- [ ] Tu rol es 'admin' en tabla profiles
- [ ] Hay al menos 2 usuarios en tabla profiles
- [ ] Notificación de prueba enviada correctamente
- [ ] Logs en consola muestran ✅ success

## 🎯 Resumen

**Problema:** Políticas RLS usaban tabla `users` (inexistente)  
**Solución:** Recrear políticas usando tabla `profiles`  
**Archivo:** `bd/fix-notifications-rls.sql`  
**Tiempo:** ~2 minutos

Una vez ejecutado el script, el envío de notificaciones debería funcionar correctamente.
