# Sistema de Comentarios y Valoraciones 🌟💬

## Descripción General

Sistema completo de comentarios y valoraciones (rating con estrellas) para las plantas medicinales. Permite a los usuarios autenticados dejar comentarios, valorar plantas del 1 al 5 estrellas, editar y eliminar sus propios comentarios.

## Características Principales

### ✨ Funcionalidades

1. **Comentarios**
   - Publicar comentarios sobre plantas
   - Editar comentarios propios
   - Eliminar comentarios propios
   - Ver comentarios de todos los usuarios

2. **Sistema de Valoración**
   - Calificar plantas del 1 al 5 estrellas
   - Valoración promedio visible
   - Contador de valoraciones totales
   - Estrellas interactivas con hover

3. **Seguridad**
   - Solo usuarios autenticados pueden comentar
   - Solo se pueden editar/eliminar comentarios propios
   - Protección RLS en Supabase
   - Validación de contenido

4. **Experiencia de Usuario**
   - Animaciones suaves con Framer Motion
   - Diseño responsive
   - Avatar de usuario
   - Fecha de publicación formateada
   - Indicador de "editado"
   - Confirmación antes de eliminar

## Estructura de Base de Datos

### Tabla `comments`

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Instalación

### 1. Configurar Base de Datos

Ejecuta los siguientes scripts SQL en tu proyecto de Supabase:

```bash
# 1. Tabla de perfiles
supabase-profiles-schema.sql

# 2. Tabla de comentarios
supabase-comments-schema.sql
```

**Importante:** Ejecuta estos scripts en el orden indicado.

### 2. Verificar Políticas RLS

Asegúrate de que las políticas de Row Level Security estén activas:

```sql
-- Comentarios
✅ Anyone can view comments
✅ Authenticated users can create comments
✅ Users can update their own comments
✅ Users can delete their own comments

-- Perfiles
✅ Anyone can view profiles
✅ Users can update their own profile
✅ Users can insert their own profile
```

### 3. Componente ya Integrado

El componente `PlantComments` ya está integrado en `PlantDetail.tsx`:

```tsx
import PlantComments from "@/modules/plants/PlantComments";

// En el JSX
<PlantComments plantId={plant.id} plantName={plant.name} />
```

## Uso del Componente

### Props

```typescript
interface PlantCommentsProps {
  plantId: string;      // ID de la planta
  plantName: string;    // Nombre de la planta (para mensajes)
}
```

### Ejemplo

```tsx
<PlantComments 
  plantId="123e4567-e89b-12d3-a456-426614174000" 
  plantName="Manzanilla"
/>
```

## Funcionalidades Detalladas

### 1. Publicar Comentario

```typescript
// Usuario hace clic en "Publicar comentario"
const handleSubmitComment = async () => {
  await supabase.from('comments').insert({
    plant_id: plantId,
    user_id: currentUser.id,
    content: newComment.trim(),
    rating: newRating || null
  });
};
```

**Validaciones:**
- ✅ Usuario debe estar autenticado
- ✅ Comentario no puede estar vacío
- ✅ Rating es opcional (1-5 estrellas)

### 2. Editar Comentario

```typescript
// Usuario hace clic en icono de editar
const handleStartEdit = (comment) => {
  setEditingId(comment.id);
  setEditContent(comment.content);
  setEditRating(comment.rating || 0);
};

// Usuario guarda cambios
const handleUpdateComment = async (commentId) => {
  await supabase.from('comments').update({
    content: editContent.trim(),
    rating: editRating || null
  }).eq('id', commentId);
};
```

### 3. Eliminar Comentario

```typescript
// Usuario hace clic en icono de eliminar
setDeletingId(comment.id); // Abre diálogo de confirmación

// Usuario confirma eliminación
const handleDeleteComment = async (commentId) => {
  await supabase.from('comments').delete().eq('id', commentId);
};
```

### 4. Sistema de Valoración

```tsx
const renderStars = (rating, interactive, onRate) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button onClick={() => onRate?.(star)}>
        <Star className={star <= rating ? 'fill-yellow-400' : ''} />
      </button>
    ))}
  </div>
);
```

**Características:**
- ⭐ Hover interactivo
- ⭐ Cambio de color al seleccionar
- ⭐ Promedio calculado automáticamente

## Permisos y Seguridad

### Matriz de Permisos

| Acción | Usuario Anónimo | Usuario Autenticado | Autor del Comentario |
|--------|----------------|-------------------|---------------------|
| Ver comentarios | ✅ | ✅ | ✅ |
| Crear comentario | ❌ | ✅ | ✅ |
| Editar comentario | ❌ | ❌ | ✅ |
| Eliminar comentario | ❌ | ❌ | ✅ |

### Políticas RLS

```sql
-- Solo el autor puede editar/eliminar
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);
```

## Interfaz de Usuario

### Elementos Visuales

1. **Cabecera**
   - Título con icono
   - Promedio de valoración
   - Contador de valoraciones

2. **Formulario de Nuevo Comentario**
   - Selector de estrellas interactivo
   - Área de texto para comentario
   - Botón de publicar con estado de carga
   - Mensaje de "debes iniciar sesión" si no autenticado

3. **Lista de Comentarios**
   - Avatar de usuario
   - Nombre de usuario
   - Fecha formateada
   - Indicador de "editado"
   - Estrellas de valoración
   - Contenido del comentario
   - Botones de editar/eliminar (solo autor)

4. **Estados**
   - Loading: Skeleton loaders
   - Empty: Mensaje de "sé el primero en comentar"
   - Error: Toast notifications

### Animaciones

```typescript
// Animación de entrada para cada comentario
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ delay: index * 0.05 }}
>
```

## Mejoras Futuras Sugeridas

### Prioridad Alta
- [ ] Paginación de comentarios (mostrar 10 por vez)
- [ ] Ordenar por: más recientes, mejor valorados, más antiguos
- [ ] Reportar comentarios inapropiados

### Prioridad Media
- [ ] Responder a comentarios (nested comments)
- [ ] Reacciones (me gusta, útil, etc.)
- [ ] Imágenes en comentarios
- [ ] Mencionar a otros usuarios (@usuario)

### Prioridad Baja
- [ ] Insignias de usuarios verificados
- [ ] Comentarios destacados por admin
- [ ] Notificaciones de nuevos comentarios
- [ ] Filtrar comentarios por valoración

## Troubleshooting

### Problema: No se muestran los comentarios

**Solución:**
1. Verificar que la tabla `comments` existe
2. Verificar políticas RLS
3. Revisar consola del navegador
4. Verificar conexión a Supabase

### Problema: No puedo publicar comentarios

**Solución:**
1. Verificar que el usuario esté autenticado
2. Verificar que la tabla `profiles` existe
3. Revisar políticas RLS de INSERT
4. Verificar que el campo `content` no esté vacío

### Problema: No veo el nombre de usuario

**Solución:**
1. Verificar que existe la tabla `profiles`
2. Ejecutar el script para crear perfiles de usuarios existentes
3. Verificar que el trigger `on_auth_user_created` esté activo

### Problema: No puedo editar/eliminar comentarios

**Solución:**
1. Verificar que el `user_id` del comentario coincida con el usuario actual
2. Revisar políticas RLS de UPDATE y DELETE
3. Verificar que el `currentUser` esté cargado correctamente

## Testing

### Casos de Prueba

```typescript
// 1. Ver comentarios sin autenticar
// ✅ Debería mostrar comentarios existentes
// ✅ No debería mostrar botones de editar/eliminar
// ✅ No debería permitir publicar

// 2. Ver comentarios autenticado
// ✅ Debería mostrar comentarios existentes
// ✅ Debería mostrar botones solo en comentarios propios
// ✅ Debería permitir publicar

// 3. Publicar comentario
// ✅ Con texto y rating
// ✅ Solo con texto
// ✅ No debería permitir comentario vacío

// 4. Editar comentario
// ✅ Debería guardar cambios
// ✅ Debería actualizar fecha de modificación
// ✅ Debería permitir cancelar

// 5. Eliminar comentario
// ✅ Debería pedir confirmación
// ✅ Debería eliminar al confirmar
// ✅ Debería cancelar sin eliminar
```

## Recursos

- [Documentación de Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [shadcn/ui Components](https://ui.shadcn.com/)

## Soporte

Si encuentras algún problema o tienes sugerencias, por favor contacta al equipo de desarrollo.

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0
