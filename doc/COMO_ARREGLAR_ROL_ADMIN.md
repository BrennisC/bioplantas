# 🔧 Cómo Arreglar el Problema de Rol Admin

## 🚨 El Problema

Tienes 2 tablas:
- `users` → tiene `role` ✅
- `profiles` → NO tiene `role` ❌

Cuando te registras como admin, el sistema no te lleva al panel correcto porque busca el `role` en `profiles`.

## ✅ SOLUCIÓN

### Paso 1: Ejecutar SQL en Supabase

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo: `supabase-add-role-to-profiles.sql`
3. **Copia TODO el contenido**
4. **Pégalo en el SQL Editor**
5. Click en **RUN** (ejecutar)

Este script hace:
- ✅ Agrega campo `role` a `profiles`
- ✅ Migra roles de `users` a `profiles`
- ✅ Crea funciones helper (`is_admin()`, `get_current_user_role()`)
- ✅ Actualiza triggers para sincronizar ambas tablas

### Paso 2: Actualizar tu Código Frontend

Ahora solo necesitas consultar **profiles** (no users):

#### ANTES (2 consultas):
```typescript
// ❌ Tenías que consultar users Y profiles
const { data: user } = await supabase
  .from('users')
  .select('role')
  .single();

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .single();
```

#### AHORA (1 sola consulta):
```typescript
// ✅ Solo profiles tiene todo
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .single();

// profile ahora tiene:
// - role ✅
// - first_name
// - last_name
// - email
// - avatar_url
// - bio
// - etc...
```

## 🔍 Archivos que Debes Actualizar

### 1. `client/modules/auth/useAuth.tsx`

Busca donde consultas `users` y cámbialo a `profiles`:

```typescript
// ANTES:
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

// AHORA:
const { data: userData } = await supabase
  .from('profiles')
  .select('role, email, first_name, last_name, avatar_url')
  .eq('id', user.id)
  .single();
```

### 2. `client/modules/auth/Register.tsx`

Al registrar, incluye el rol en metadata:

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      first_name: firstName,
      last_name: lastName,
      role: 'user' // o 'admin' si es admin
    }
  }
});
```

### 3. Cualquier verificación de admin

Usa la función helper de SQL:

```typescript
// Opción 1: Consultar profiles directamente
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .single();

const isAdmin = profile?.role === 'admin';

// Opción 2: Usar función SQL helper
const { data } = await supabase.rpc('is_admin');
const isAdmin = data; // true o false
```

## 🧪 Cómo Verificar que Funcionó

### En Supabase Dashboard:

```sql
-- Ver todos los perfiles con sus roles
SELECT id, email, role, first_name, last_name 
FROM profiles 
LIMIT 10;

-- Verificar tu propio rol (como usuario logueado)
SELECT public.get_current_user_role();

-- Verificar si eres admin
SELECT public.is_admin();
```

### En tu App:

1. **Regístrate** con un nuevo usuario
2. **Ve a Supabase** → Table Editor → profiles
3. **Edita el rol** del usuario a `'admin'`
4. **Recarga la app**
5. Deberías ser **redirigido al Dashboard de Admin**

## 🎯 Beneficios de Esta Solución

✅ **Una sola tabla** → Solo consultas `profiles`  
✅ **Sincronización automática** → `users` y `profiles` siempre en sync  
✅ **Funciones helper** → `is_admin()` y `get_current_user_role()`  
✅ **RLS actualizado** → Admins pueden ver todos los perfiles  
✅ **Migraciones automáticas** → Roles existentes se migran  

## 🚀 Próximos Pasos

1. ✅ Ejecuta `supabase-add-role-to-profiles.sql` en Supabase
2. ✅ Actualiza `useAuth.tsx` para usar `profiles`
3. ✅ Actualiza `Register.tsx` para incluir rol en metadata
4. ✅ Prueba registrarte y verificar el panel correcto

## ❓ ¿Necesitas Ayuda?

Dime:
- "actualiza useAuth.tsx" → Actualizo el código de autenticación
- "actualiza Register.tsx" → Actualizo el formulario de registro
- "busca donde uso users table" → Te muestro todos los archivos que consultan users

---

**¿Quieres que busque y actualice todos los archivos que usan `users` table automáticamente?**
