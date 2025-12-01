# ✅ Solución: Login Redirige a Onboarding en Lugar de la Página Principal

**Fecha:** 30 de Noviembre, 2025

---

## ❌ Problema Reportado

Al iniciar sesión:
1. ✅ Mensaje "Inicio de sesión exitoso"
2. ❌ Aparece formulario de onboarding (wizard médico)
3. ❌ No redirige directamente a `/dashboard` (admins) o `/explorar` (usuarios)

---

## 🔍 Causa del Problema

### 1. Usuarios Admin Veían Onboarding
**Archivo:** `client/modules/user/Explore.tsx`

```typescript
// ANTES ❌
const checkMedicalProfile = async () => {
  const { data } = await supabase
    .from('user_medical_profile')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  if (!data || !data.onboarding_completed) {
    setShowOnboarding(true); // ⬅️ PROBLEMA: Admins también
  }
};
```

**Problema:** El onboarding se mostraba a TODOS los usuarios sin perfil médico, incluyendo admins.

### 2. Login No Esperaba el Rol Correctamente
**Archivo:** `client/modules/auth/Login.tsx`

```typescript
// ANTES ❌
const userRole = result.role || session?.role; // ⬅️ session?.role podía estar undefined
```

**Problema:** Intentaba obtener el rol de `session` que aún no se había actualizado.

---

## ✅ Soluciones Implementadas

### 1. Admins Saltan el Onboarding

**Archivo:** `client/modules/user/Explore.tsx` (líneas 57-64)

```typescript
const checkMedicalProfile = async () => {
  try {
    // ✅ NUEVO: Si es admin, no mostrar onboarding
    if (session?.role === 'admin') {
      console.log('👑 Usuario es admin, saltando onboarding');
      setShowOnboarding(false);
      setUserProfile(null);
      return; // ⬅️ Sale inmediatamente
    }

    // ... resto del código para usuarios normales
```

**Resultado:**
- ✅ Admins → No ven onboarding → Van directo a /dashboard
- ✅ Usuarios nuevos → Ven onboarding → Completan perfil médico
- ✅ Usuarios existentes → No ven onboarding → Van a /explorar

### 2. Login Usa el Rol del Resultado Directamente

**Archivo:** `client/modules/auth/Login.tsx` (líneas 50-78)

```typescript
const result = await login(email, password);

if (result.success) {
  const userRole = result.role; // ✅ CORREGIDO: Usa directamente result.role
  
  console.log('🔐 Login exitoso:', { 
    userRole, 
    email: result.email,
    userId: result.userId 
  });
  
  toast({
    title: "✅ Inicio de sesión exitoso",
    description: userRole === 'admin' 
      ? "Redirigiendo al panel de administración..." 
      : "Bienvenido a BioPlantes",
  });
  
  // Redirigir según el rol INMEDIATAMENTE
  setTimeout(() => {
    if (userRole === 'admin') {
      console.log('👑 Redirigiendo admin a /dashboard');
      nav("/dashboard", { replace: true });
    } else {
      console.log('👤 Redirigiendo usuario a /explorar');
      nav("/explorar", { replace: true });
    }
  }, 300); // ⬅️ REDUCIDO: 500ms → 300ms para redirección más rápida
}
```

**Mejoras:**
- ✅ Usa `result.role` directamente (no `session?.role`)
- ✅ Logs más descriptivos con emojis
- ✅ Timeout reducido de 500ms a 300ms
- ✅ Toast más claro según el rol
- ✅ `setIsLoading(false)` solo en caso de error

---

## 🧪 Flujos Corregidos

### Flujo 1: Admin Login

```
1. Ingresa email/password
2. Click "Ingresar"
   ↓
3. useAuth.login() → role: 'admin'
   ↓
4. Toast: "✅ Inicio de sesión exitoso - Redirigiendo al panel..."
   ↓
5. Console: "👑 Redirigiendo admin a /dashboard"
   ↓
6. navigate("/dashboard", { replace: true })
   ↓
7. ProtectedRoute verifica: session.role === 'admin' ✅
   ↓
8. Renderiza <Dashboard />
```

**NO pasa por Explore** → **NO ve onboarding**

### Flujo 2: Usuario Nuevo Login

```
1. Ingresa email/password
2. Click "Ingresar"
   ↓
3. useAuth.login() → role: 'user'
   ↓
4. Toast: "✅ Inicio de sesión exitoso - Bienvenido a BioPlantes"
   ↓
5. Console: "👤 Redirigiendo usuario a /explorar"
   ↓
6. navigate("/explorar", { replace: true })
   ↓
7. Explore.checkMedicalProfile()
   ↓
8. No existe user_medical_profile → showOnboarding = true
   ↓
9. Renderiza <OnboardingWizard />
```

### Flujo 3: Usuario Existente Login

```
1. Ingresa email/password
2. Click "Ingresar"
   ↓
3. useAuth.login() → role: 'user'
   ↓
4. Toast: "✅ Inicio de sesión exitoso - Bienvenido a BioPlantes"
   ↓
5. Console: "👤 Redirigiendo usuario a /explorar"
   ↓
6. navigate("/explorar", { replace: true })
   ↓
7. Explore.checkMedicalProfile()
   ↓
8. Existe user_medical_profile.onboarding_completed = true
   ↓
9. Console: "✅ Perfil médico completo"
   ↓
10. Renderiza lista de plantas con filtros personalizados
```

---

## 📋 Logs en Consola

### Login como Admin:
```
🔐 Login exitoso: { userRole: 'admin', email: '...', userId: '...' }
👑 Redirigiendo admin a /dashboard
```

### Login como Usuario Nuevo:
```
🔐 Login exitoso: { userRole: 'user', email: '...', userId: '...' }
👤 Redirigiendo usuario a /explorar
📋 Mostrando onboarding - perfil incompleto
```

### Login como Usuario Existente:
```
🔐 Login exitoso: { userRole: 'user', email: '...', userId: '...' }
👤 Redirigiendo usuario a /explorar
✅ Perfil médico completo
```

---

## 🎯 Archivos Modificados

1. **`client/modules/user/Explore.tsx`**
   - Agregada verificación: `if (session?.role === 'admin') return;`
   - Logs descriptivos agregados
   - Admins saltan el onboarding completamente

2. **`client/modules/auth/Login.tsx`**
   - Usa `result.role` en lugar de `session?.role`
   - Timeout reducido: 500ms → 300ms
   - Toasts más descriptivos
   - Logs mejorados con emojis

---

## ✅ Verificación

### Test 1: Login como Admin

1. Ir a `/login`
2. Ingresar credenciales de admin
3. Click "Ingresar"
4. **Esperado:**
   - ✅ Toast: "Redirigiendo al panel de administración..."
   - ✅ Console: "👑 Redirigiendo admin a /dashboard"
   - ✅ URL cambia a `/dashboard`
   - ✅ Se muestra Dashboard (NO onboarding)

### Test 2: Login como Usuario Nuevo

1. Ir a `/login`
2. Ingresar credenciales de usuario sin perfil médico
3. Click "Ingresar"
4. **Esperado:**
   - ✅ Toast: "Bienvenido a BioPlantes"
   - ✅ Console: "👤 Redirigiendo usuario a /explorar"
   - ✅ Console: "📋 Mostrando onboarding - perfil incompleto"
   - ✅ URL cambia a `/explorar`
   - ✅ Se muestra OnboardingWizard

### Test 3: Login como Usuario Existente

1. Ir a `/login`
2. Ingresar credenciales de usuario con perfil completo
3. Click "Ingresar"
4. **Esperado:**
   - ✅ Toast: "Bienvenido a BioPlantes"
   - ✅ Console: "👤 Redirigiendo usuario a /explorar"
   - ✅ Console: "✅ Perfil médico completo"
   - ✅ URL cambia a `/explorar`
   - ✅ Se muestra lista de plantas (NO onboarding)

---

## 🔍 Solución de Problemas

### Problema: Admin sigue viendo onboarding

**Causa:** El rol no se está cargando correctamente

**Solución:**
1. Abre consola (F12)
2. Verifica log: `🔐 Login exitoso: { userRole: '?' }`
3. Si dice `userRole: 'user'` en lugar de `'admin'`:
   ```sql
   -- Ejecutar en Supabase SQL Editor:
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'tu-email@ejemplo.com';
   ```

### Problema: Usuario normal no ve onboarding

**Causa:** Ya tiene perfil médico con `onboarding_completed = true`

**Verificar:**
```sql
SELECT * FROM user_medical_profile 
WHERE user_id = 'tu-user-id';
```

**Resetear onboarding:**
```sql
UPDATE user_medical_profile
SET onboarding_completed = false
WHERE user_id = 'tu-user-id';
```

### Problema: Redirección muy lenta

**Causa:** Timeout de 300ms + tiempo de carga

**Normal:** 300-500ms total
**Si es > 1 segundo:** Verificar queries de `checkMedicalProfile`

---

## 📊 Resumen de Cambios

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| `Explore.tsx` | Agregado check de admin antes de onboarding | +8 |
| `Login.tsx` | Mejorada lógica de redirección y logs | ~30 |
| **Total** | 2 archivos modificados | ~38 |

---

## ✅ Estado Final

- ✅ Admins → Directo a `/dashboard` (sin onboarding)
- ✅ Usuarios nuevos → Onboarding en `/explorar`
- ✅ Usuarios existentes → Plantas en `/explorar`
- ✅ Redirección rápida (300ms)
- ✅ Logs descriptivos en consola
- ✅ Toasts informativos

**¡El login ahora redirige correctamente según el rol!** 🎉
