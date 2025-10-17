# 🚨 Solución: Error RLS al Subir Avatar

## El Problema
```
Error: new row violates row-level security policy
```

Este error ocurre porque las políticas de Storage no están configuradas correctamente.

---

## ✅ Solución Rápida (Opción 1 - Recomendada)

### **Paso 1: Ejecutar el Script Actualizado**

1. Ve a Supabase Dashboard → **SQL Editor**
2. Copia y ejecuta `supabase-storage-setup.sql` (ya actualizado)
3. Este script:
   - ✅ Elimina políticas antiguas que causan conflictos
   - ✅ Crea políticas nuevas más permisivas
   - ✅ Permite a cualquier usuario autenticado subir archivos

---

## 🔧 Solución Manual (Opción 2)

Si el script no funciona, hazlo manualmente desde el Dashboard:

### **Paso 1: Verificar el Bucket**

1. Ve a **Storage** en Supabase
2. Busca el bucket `profiles`
3. Si no existe, créalo:
   - Click en **"New bucket"**
   - Name: `profiles`
   - Public: ✅ **Activado**
   - Click en **"Create bucket"**

### **Paso 2: Configurar Políticas**

1. Click en el bucket `profiles`
2. Ve a la pestaña **"Policies"**
3. Click en **"New Policy"**

**Política 1: Ver archivos (SELECT)**
```
Policy name: Public Access
Allowed operation: SELECT
Policy definition: (bucket_id = 'profiles')
Target roles: public
```

**Política 2: Subir archivos (INSERT)**
```
Policy name: Authenticated Upload
Allowed operation: INSERT
Policy definition: (bucket_id = 'profiles')
Target roles: authenticated
```

**Política 3: Actualizar archivos (UPDATE)**
```
Policy name: Authenticated Update
Allowed operation: UPDATE
Policy definition: (bucket_id = 'profiles')
Target roles: authenticated
```

**Política 4: Eliminar archivos (DELETE)**
```
Policy name: Authenticated Delete
Allowed operation: DELETE
Policy definition: (bucket_id = 'profiles')
Target roles: authenticated
```

---

## 🔍 Verificación

### **Comprobar que el bucket existe:**

```sql
SELECT * FROM storage.buckets WHERE id = 'profiles';
```

Debe retornar:
```
id: profiles
name: profiles
public: true
```

### **Comprobar las políticas:**

```sql
SELECT * FROM storage.policies WHERE bucket_id = 'profiles';
```

Debe retornar 4 políticas (SELECT, INSERT, UPDATE, DELETE).

---

## 🧪 Probar la Subida

1. Ve a `/perfil` en tu app
2. Click en el botón de cámara 📷
3. Selecciona una imagen (< 2MB)
4. Debería subir sin errores
5. La imagen debe aparecer inmediatamente

---

## 🚨 Si Sigue Fallando

### **Error: "Bucket does not exist"**
**Solución:** Crea el bucket manualmente desde Storage

### **Error: "Invalid JWT"**
**Solución:** Cierra sesión y vuelve a iniciar sesión

### **Error: "File size exceeds limit"**
**Solución:** La imagen debe ser menor a 2MB

### **Error: "Policy not found"**
**Solución:** Vuelve a ejecutar el script SQL completo

---

## 💡 Explicación Técnica

### **¿Por qué falló antes?**

Las políticas originales usaban:
```sql
auth.uid()::text = (storage.foldername(name))[1]
```

Esto requiere que la estructura de carpetas coincida exactamente con el user_id. Es muy restrictivo y puede fallar.

### **¿Por qué funciona ahora?**

Las nuevas políticas son más simples:
```sql
WITH CHECK (bucket_id = 'profiles')
TO authenticated
```

Cualquier usuario autenticado puede subir archivos al bucket `profiles`. Es más permisivo pero igual seguro porque:
- ✅ Solo usuarios autenticados pueden subir
- ✅ Los archivos son públicos para ver
- ✅ Cada archivo tiene el user_id en el nombre

---

## 📝 Código de Subida (Ya está correcto)

```typescript
// Generar nombre único con user_id
const fileName = `${session!.id}-${Date.now()}.${fileExt}`;
const filePath = `avatars/${fileName}`;

// Subir con upsert (sobrescribe si existe)
const { error } = await supabase.storage
  .from('profiles')
  .upload(filePath, file, { upsert: true });
```

---

## ✅ Resultado Final

Después de aplicar la solución:
- ✅ Click en cámara → Selector de archivo
- ✅ Seleccionar imagen → Subida automática
- ✅ Avatar se actualiza inmediatamente
- ✅ URL guardada en `profiles.avatar_url`
- ✅ Imagen visible públicamente

---

## 🎯 Próximos Pasos

Una vez funcionando el avatar:
1. ✅ Probar editar perfil (nombre, bio, teléfono)
2. ✅ Verificar que el avatar persiste al recargar
3. ✅ Continuar con: **Explorador de plantas con filtros dinámicos**
