# Corrección: Nombres de Usuarios No Aparecen en Panel de Administrador

## Problema Identificado
En el panel de administrador, los usuarios aparecían con "Sin nombre" a pesar de tener nombres registrados en la base de datos.

## Causa Raíz
El código estaba buscando el campo `full_name` en la tabla `profiles`, pero la tabla real tiene los campos `first_name` y `last_name` separados.

## Archivos Modificados

### 1. `client/modules/admin/UsersManager.tsx`
**Cambios:**
- ✅ Actualizada la interfaz `UserData` para usar `first_name` y `last_name` en lugar de `full_name`
- ✅ Modificada la visualización para construir el nombre completo: `${first_name} ${last_name}`.trim()
- ✅ Manejo correcto de nombres vacíos o null

**Antes:**
```tsx
interface UserData {
  full_name: string | null;
}

<p>{user.full_name || 'Sin nombre'}</p>
```

**Después:**
```tsx
interface UserData {
  first_name: string | null;
  last_name: string | null;
}

<p>
  {user.first_name || user.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
    : 'Sin nombre'}
</p>
```

### 2. `client/modules/plants/PlantComments.tsx`
**Cambios:**
- ✅ Actualizada consulta para obtener `first_name` y `last_name` en lugar de `name`
- ✅ Construcción del nombre completo para mostrar en comentarios
- ✅ Fallback a email si no hay nombre disponible

**Antes:**
```tsx
.select('id, name, email')

user_name: user?.name || user?.email?.split('@')[0]
```

**Después:**
```tsx
.select('id, first_name, last_name, email')

const fullName = user?.first_name || user?.last_name
  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
  : null;
user_name: fullName || user?.email?.split('@')[0]
```

## Archivo de Verificación Creado

### `bd/verificar-nombres-usuarios.sql`
Script SQL para verificar el estado de los nombres en la base de datos:
- Ver todos los usuarios con sus nombres
- Identificar usuarios con nombres faltantes
- Contar usuarios por estado de nombres

## Cómo Verificar la Corrección

1. **En el navegador:**
   - Actualizar la página del panel de administrador
   - Los nombres de usuarios deberían aparecer correctamente ahora

2. **En la base de datos (opcional):**
   ```sql
   -- Ejecutar en Supabase SQL Editor
   SELECT 
     id, 
     email, 
     first_name, 
     last_name,
     CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) as nombre_completo
   FROM profiles
   ORDER BY created_at DESC;
   ```

## Estado Actual
✅ **RESUELTO** - Los nombres de usuarios ahora se muestran correctamente en:
- Panel de administrador (lista de usuarios)
- Comentarios de plantas (nombre del autor del comentario)

## Notas Adicionales
- La página de perfil ya estaba usando correctamente `first_name` y `last_name`
- El hook de autenticación solo consulta el rol, no los nombres
- CommentsManager solo consulta emails, no nombres
