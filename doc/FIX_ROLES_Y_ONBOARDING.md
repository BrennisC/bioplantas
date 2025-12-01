# 🔧 Corrección de Errores: Roles y Formulario de Bienvenida

## 📋 Problemas Identificados

### 1. ❌ **Error de Roles: Todos los usuarios entran como "paciente"**

**Problema:**
El sistema asignaba automáticamente el rol `'user'` a TODOS los usuarios cuando había cualquier error al leer la tabla `profiles`, incluyendo a los administradores.

**Causa:**
En `useAuth.tsx`, el bloque `catch` asignaba rol `'user'` por defecto sin verificar si el error era porque:
- El perfil no existía (código PGRST116)
- Había un error real de permisos/conexión

**Solución Implementada:**
```typescript
// ANTES ❌
catch (error) {
  console.error('Error fetching user profile:', error);
  setSession({
    email: user.email!,
    role: 'user',  // ⬅️ SIEMPRE asignaba 'user'
    id: userId,
    user
  });
}

// DESPUÉS ✅
if (error.code === 'PGRST116') {
  // Perfil no existe, crear uno nuevo con rol 'user'
  console.log('⚠️ Perfil no existe, creando uno nuevo...');
  // ... crear perfil
} else {
  // Otros errores = no establecer sesión
  throw error;
}
```

**Beneficios:**
- ✅ Los administradores mantienen su rol correctamente
- ✅ Si hay un error real, la sesión no se establece (más seguro)
- ✅ Logs más informativos para debugging

---

### 2. ❌ **Error en Formulario de Bienvenida: No avanza pasos**

**Problema:**
El formulario de diagnóstico/bienvenida (OnboardingWizard) no avanzaba correctamente después del paso 4.

**Causa:**
Inconsistencia en el número de pasos:
- El código tenía **6 pasos** (0, 1, 2, 3, 4, 5)
- La lógica decía máximo **5 pasos** (0, 1, 2, 3, 4)
- El botón "Siguiente" se deshabilitaba en el paso 4 aunque faltaba el paso 5

**Solución Implementada:**
```typescript
// ANTES ❌
Paso {step + 1} de 5
animate={{ width: `${((step + 1) / 5) * 100}%` }}
setStep(prev => Math.min(prev + 1, 4));
{step < 4 ? (...) : (...)}

// DESPUÉS ✅
Paso {step + 1} de 6
animate={{ width: `${((step + 1) / 6) * 100}%` }}
setStep(prev => Math.min(prev + 1, 5));
{step < 5 ? (...) : (...)}
```

**Pasos del Formulario:**
- **Paso 0:** 🏥 Preferencia de tratamiento (Natural/Convencional/Integrativa)
- **Paso 1:** 👤 Género
- **Paso 2:** 💊 Condiciones médicas
- **Paso 3:** 🌿 Estado especial (embarazo, lactancia, niños)
- **Paso 4:** 📋 Medicamentos y alergias
- **Paso 5:** ✅ Resumen y confirmación

---

## 🔍 Cómo Verificar si Tus Roles Están Correctos

### Opción 1: En Supabase Dashboard

1. Abre Supabase Dashboard
2. Ve a **Table Editor** → Tabla `profiles`
3. Busca tu email
4. Verifica que la columna `role` diga **`admin`** (no `user`)

### Opción 2: Con SQL (Archivo incluido)

Ejecuta el archivo `bd/fix-admin-roles.sql` en Supabase SQL Editor:

```sql
-- Ver tu cuenta
SELECT id, email, role
FROM profiles
WHERE email = 'tu-email@ejemplo.com';

-- Si aparece role = 'user', actualízala:
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

---

## 🧪 Cómo Probar las Correcciones

### Test 1: Verificar Rol de Administrador

1. **Cierra sesión** completamente
2. **Inicia sesión** con tu cuenta de admin
3. Abre la **consola del navegador** (F12)
4. Busca estos logs:
   ```
   ✅ Perfil cargado correctamente: { userId: "...", role: "admin" }
   ✅ Login exitoso - Rol: admin
   🎯 Redirigiendo a /dashboard
   ```
5. Deberías ser redirigido a `/dashboard` (panel de administración)

### Test 2: Verificar Formulario de Bienvenida

1. **Crea una cuenta nueva** (o borra `user_medical_profile` de una cuenta de prueba)
2. Al iniciar sesión, debería aparecer el **formulario de bienvenida**
3. **Avanza** paso por paso:
   - Paso 1/6 → Selecciona preferencia de tratamiento
   - Paso 2/6 → Selecciona género
   - Paso 3/6 → Selecciona condiciones (opcional)
   - Paso 4/6 → Estado especial (opcional)
   - Paso 5/6 → Medicamentos y alergias (opcional)
   - Paso 6/6 → Resumen ✅
4. Haz click en **"Completar"**
5. Deberías ver la página de exploración de plantas

---

## 📝 Logs de Debugging Mejorados

Ahora el sistema imprime logs más claros en la consola:

**Login exitoso:**
```
👤 Login - Datos del usuario: { userId: "abc123", userData: { role: "admin" }, userError: null }
✅ Login exitoso - Rol: admin
✅ Perfil cargado correctamente: { userId: "abc123", role: "admin" }
🎯 Redirigiendo a /dashboard
```

**Perfil no existe:**
```
❌ Error al obtener perfil: { code: "PGRST116", ... }
⚠️ Perfil no existe, creando uno nuevo con rol user...
```

**Error crítico:**
```
💥 Error crítico en fetchUserProfile: { message: "..." }
```

---

## ✅ Checklist de Verificación

- [ ] **Roles corregidos en base de datos** (ejecutar `fix-admin-roles.sql`)
- [ ] **Cerrar sesión y volver a iniciar** con cuenta admin
- [ ] **Verificar redirección a `/dashboard`** (no `/explorar`)
- [ ] **Probar formulario de bienvenida** con cuenta nueva
- [ ] **Verificar que avanza hasta paso 6/6**
- [ ] **Completar formulario** y verificar que se guarda

---

## 🚨 Problemas Conocidos

### Si sigues viendo rol 'user' después de las correcciones:

1. **Limpia caché del navegador:**
   - Chrome: Ctrl + Shift + Delete → Borrar todo
   - O abre en ventana de incógnito

2. **Verifica en Supabase:**
   ```sql
   SELECT * FROM profiles WHERE email = 'tu-email@ejemplo.com';
   ```
   Debe mostrar `role: 'admin'`

3. **Verifica Row Level Security (RLS):**
   - En Supabase, ve a **Authentication** → **Policies**
   - Asegúrate de que exista policy para `SELECT` en tabla `profiles`

---

## 📞 Soporte

Si después de aplicar estas correcciones sigues teniendo problemas:

1. Revisa los **logs en consola del navegador** (F12)
2. Revisa los **logs en Supabase Dashboard** → Logs
3. Verifica que el campo `role` en tabla `profiles` tiene valores: `'user'` o `'admin'` (no otros valores)

---

**Fecha de corrección:** 30 de Noviembre, 2025
**Archivos modificados:**
- `client/modules/auth/useAuth.tsx`
- `client/components/OnboardingWizard.tsx`
- `bd/fix-admin-roles.sql` (nuevo)
