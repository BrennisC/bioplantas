# 🔧 Cómo Arreglar: "Database Error Saving User"

## 🚨 El Error

Cuando intentas registrarte, sale error:
```
Database error saving user
```

**Causa**: La tabla `profiles` ahora necesita el campo `role`, pero el trigger de registro no lo está manejando correctamente.

---

## ✅ SOLUCIÓN

### Paso 1: Ejecutar el SQL Arreglado

1. Ve a **Supabase Dashboard**
2. Click en **SQL Editor**
3. Abre el archivo: `supabase-fix-profiles-role.sql`
4. **Copia TODO el contenido**
5. **Pégalo en el editor**
6. Click en **RUN** (ejecutar)

Este script hace:
- ✅ Agrega `role` a `profiles` (sin romper nada)
- ✅ Migra datos existentes de `users` a `profiles`
- ✅ Elimina triggers viejos que causan conflicto
- ✅ Crea trigger NUEVO que maneja `role` correctamente
- ✅ Actualiza políticas RLS
- ✅ Crea funciones helper

### Paso 2: Verificar que Funcionó

En Supabase SQL Editor, ejecuta:

```sql
-- Ver estructura de profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Debería mostrar:
-- role | text | NO

-- Ver perfiles existentes
SELECT id, email, role, first_name, last_name 
FROM profiles 
LIMIT 5;
```

### Paso 3: Probar Registro

1. **Cierra sesión** en tu app (si estás logueado)
2. Ve a **Register**
3. Llena el formulario:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Password: `test123456`
4. Click en **Registrar**

**Debería funcionar sin errores** ✅

### Paso 4: Verificar en Supabase

1. Ve a **Supabase Dashboard** → **Table Editor**
2. Click en tabla **profiles**
3. Busca el usuario recién creado
4. **Debería tener**:
   - ✅ `id` (UUID)
   - ✅ `email`
   - ✅ `first_name`
   - ✅ `last_name`
   - ✅ `role` = `'user'`

---

## 🐛 Si Aún Hay Error

### Debug Paso a Paso:

#### 1. Verificar que el trigger existe:

```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Debería mostrar:
-- on_auth_user_created | INSERT | users
```

#### 2. Verificar la función:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Debería mostrar:
-- handle_new_user
```

#### 3. Ver errores de auth:

```sql
SELECT * FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;

-- Verifica si el usuario se creó en auth.users
```

#### 4. Ver si llegó a profiles:

```sql
SELECT * FROM profiles 
ORDER BY created_at DESC 
LIMIT 1;

-- Verifica si se creó el perfil
```

#### 5. Si el usuario está en `auth.users` pero NO en `profiles`:

El trigger no se ejecutó. Manualmente crea el perfil:

```sql
-- Reemplaza USER_ID con el ID del usuario de auth.users
INSERT INTO profiles (id, email, role, first_name, last_name)
SELECT 
  id, 
  email,
  'user',
  '',
  ''
FROM auth.users 
WHERE id = 'USER_ID_AQUI';
```

---

## 🔄 Alternativa: Limpiar y Empezar de Nuevo

Si nada funciona, ejecuta esto para resetear todo:

```sql
-- ⚠️ CUIDADO: Esto borra TODOS los usuarios
-- Solo usa en desarrollo

-- 1. Borrar usuarios de auth
DELETE FROM auth.users;

-- 2. Borrar perfiles
DELETE FROM profiles;

-- 3. Borrar users
DELETE FROM users;

-- 4. Ahora ejecuta supabase-fix-profiles-role.sql
-- 5. Registra un usuario nuevo
```

---

## 📝 Checklist de Verificación

Antes de decir que funciona, verifica:

- [ ] El SQL se ejecutó sin errores
- [ ] La columna `role` existe en `profiles`
- [ ] El trigger `on_auth_user_created` existe
- [ ] Puedes registrarte sin error
- [ ] El usuario aparece en `auth.users`
- [ ] El perfil aparece en `profiles` con `role='user'`
- [ ] Puedes hacer login
- [ ] El dashboard carga correctamente

---

## 💡 Entender el Flujo

### Antes (no funcionaba):
```
1. Usuario se registra
2. Supabase crea en auth.users ✅
3. Trigger intenta crear en profiles ❌ (falta role)
4. ERROR: "database error saving user"
```

### Ahora (debería funcionar):
```
1. Usuario se registra
2. Supabase crea en auth.users ✅
3. Trigger crea en profiles CON role='user' ✅
4. Trigger crea en users CON role='user' ✅
5. Usuario registrado exitosamente ✅
```

---

## 🎯 Si Sigue Sin Funcionar

Dime:
- **"Ejecuté el SQL, aún sale error"** → Debuggeamos juntos
- **"El SQL dio error"** → Te muestro el error específico
- **"Ya funciona"** → ¡Celebramos! 🎉

### Info útil para debuggear:
- Copia el **error exacto** que sale
- Copia el resultado de: `SELECT * FROM profiles LIMIT 1;`
- Dime si el usuario se creó en `auth.users`
