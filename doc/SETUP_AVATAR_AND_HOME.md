# 📸 Guía: Configurar Subida de Avatares

## ✅ Cambios Realizados

### 1. **Profile.tsx - Subida de Avatar Funcional**
- ✅ Input de archivo oculto con label personalizado
- ✅ Validación de tamaño (max 2MB)
- ✅ Validación de formato (solo imágenes)
- ✅ Indicador de carga (Loader2 animado)
- ✅ Subida a Supabase Storage
- ✅ Actualización automática del perfil

### 2. **Index.tsx - Página Limpia y Adaptativa**
- ✅ Versión simplificada para usuarios autenticados
- ✅ Hero compacto con búsqueda rápida
- ✅ 3 accesos rápidos: Explorar, Favoritos, Perfil
- ✅ Solo 3 plantas destacadas (no 6)
- ✅ Sin estadísticas ni categorías para usuarios logueados
- ✅ Landing completo solo para visitantes

### 3. **Navbar.tsx - Navegación Inteligente**
- ✅ Botón "Inicio" se oculta cuando estás en la home (/)
- ✅ Tanto en desktop como en móvil
- ✅ Navegación más limpia y enfocada

---

## 🔧 Configuración Requerida en Supabase

### **Paso 1: Ejecutar el Script SQL**

1. Ve a tu Dashboard de Supabase
2. Abre **SQL Editor**
3. Copia el contenido de `supabase-storage-setup.sql`
4. Haz clic en **"Run"** ▶️

El script crea:
- ✅ Bucket público `profiles`
- ✅ Políticas de seguridad (solo puedes editar tu propio avatar)
- ✅ Estructura: `profiles/avatars/{user_id}-{timestamp}.jpg`

### **Paso 2: Verificar el Bucket**

Ve a **Storage** en el sidebar de Supabase y deberías ver:
- 📁 **profiles** (público)

---

## 🎯 Cómo Funciona la Subida de Avatar

### **Flujo Técnico:**

1. Usuario hace clic en el botón de cámara 📷
2. Se abre el selector de archivos
3. **Validaciones:**
   - Tamaño < 2MB ✅
   - Formato de imagen ✅
4. Subida a Storage: `profiles/avatars/{user_id}-{timestamp}.{ext}`
5. Se obtiene la URL pública
6. Se actualiza la tabla `profiles` con `avatar_url`
7. El avatar se muestra inmediatamente

### **Código Clave:**

```typescript
const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  // Subir a Storage
  const { error } = await supabase.storage
    .from('profiles')
    .upload(filePath, file, { upsert: true });
  
  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('profiles')
    .getPublicUrl(filePath);
  
  // Actualizar perfil
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', session!.id);
};
```

---

## 📱 Experiencia de Usuario

### **Usuarios NO autenticados (Landing):**
- Hero grande con descripción completa
- Estadísticas del sitio
- 6 categorías principales
- 6 plantas destacadas
- CTA para explorar

### **Usuarios autenticados (Dashboard):**
- Hero compacto con bienvenida
- 3 accesos rápidos en cards
- Solo 3 plantas destacadas
- Navegación sin "Inicio" (ya estás ahí)

---

## ✅ Checklist de Configuración

```
[ ] Ejecutar migrate-users-table.sql (para first_name/last_name)
[ ] Ejecutar supabase-storage-setup.sql (para avatares)
[ ] Verificar bucket 'profiles' en Storage
[ ] Probar subir avatar desde /perfil
[ ] Confirmar que la imagen se ve en el perfil
[ ] Probar la home como usuario no autenticado
[ ] Probar la home como usuario autenticado
[ ] Verificar que "Inicio" no aparezca en navbar cuando estás en /
```

---

## 🚨 Solución de Problemas

### Error: "Could not find first_name column"
**Solución:** Ejecuta `migrate-users-table.sql` primero

### Error: "Bucket does not exist"
**Solución:** Ejecuta `supabase-storage-setup.sql`

### Error: "new row violates row-level security policy"
**Solución:** Revisa que las políticas de Storage se hayan creado correctamente

### Avatar no se muestra
**Solución:** 
1. Verifica que el bucket sea público
2. Revisa la URL en `profiles.avatar_url` en la base de datos
3. Confirma que la imagen se subió correctamente en Storage

---

## 🎯 Próximos Pasos

Ahora que tienes:
- ✅ Perfil funcional con avatar
- ✅ Home limpia y adaptativa
- ✅ Navegación inteligente

Es momento de continuar con:
→ **Explorador de plantas con filtros dinámicos**

Este es el siguiente punto en tu plan de desarrollo.

---

## 💡 Tips

- Los avatares se guardan con timestamp para evitar conflictos de caché
- El `upsert: true` permite sobrescribir avatares antiguos
- Las políticas RLS aseguran que solo puedas modificar tu propio avatar
- El botón "Inicio" solo se oculta en la ruta exacta "/"
