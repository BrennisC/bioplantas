# Guía Rápida: Implementar Sistema de Comentarios 🚀

## Pasos para Implementar

### 1. Ejecutar Scripts SQL en Supabase (5 min)

Abre tu proyecto en Supabase y ejecuta estos scripts en orden:

#### Script 1: Perfiles de Usuario
```bash
Archivo: supabase-profiles-schema.sql
```

Ve a: **SQL Editor** → **New Query** → Pega el contenido del archivo → **Run**

#### Script 2: Comentarios
```bash
Archivo: supabase-comments-schema.sql
```

Ve a: **SQL Editor** → **New Query** → Pega el contenido del archivo → **Run**

### 2. Verificar Tablas Creadas (2 min)

Ve a **Table Editor** y verifica que existan:
- ✅ `profiles`
- ✅ `comments`

### 3. Verificar Políticas RLS (2 min)

Para cada tabla, ve a **Authentication** → **Policies** y verifica:

**Tabla `comments`:**
- ✅ Anyone can view comments
- ✅ Authenticated users can create comments
- ✅ Users can update their own comments
- ✅ Users can delete their own comments

**Tabla `profiles`:**
- ✅ Anyone can view profiles
- ✅ Users can update their own profile
- ✅ Users can insert their own profile

### 4. Crear Perfiles para Usuarios Existentes (1 min)

Si ya tienes usuarios registrados, ejecuta este SQL:

```sql
INSERT INTO profiles (id, email, name)
SELECT 
  id, 
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);
```

### 5. ¡Listo! 🎉

El sistema ya está funcionando. Los comentarios aparecerán automáticamente en cada página de detalle de planta.

## Probar el Sistema

### Prueba 1: Ver Comentarios (Sin autenticar)
1. Abre cualquier planta: `/plantas/[id]`
2. Scroll hasta "Comentarios y Valoraciones"
3. ✅ Deberías ver la sección pero no poder comentar

### Prueba 2: Publicar Comentario
1. Inicia sesión
2. Abre una planta
3. Scroll a comentarios
4. Selecciona estrellas (opcional)
5. Escribe un comentario
6. Click "Publicar comentario"
7. ✅ Tu comentario aparece inmediatamente

### Prueba 3: Editar Comentario
1. En tu comentario, click en el icono de lápiz ✏️
2. Modifica el texto o las estrellas
3. Click "Guardar"
4. ✅ Se actualiza y muestra "(editado)"

### Prueba 4: Eliminar Comentario
1. En tu comentario, click en el icono de basura 🗑️
2. Confirma la eliminación
3. ✅ El comentario desaparece

## Componentes del Sistema

```
client/
├── modules/
│   └── plants/
│       └── PlantComments.tsx       ← Componente principal
├── pages/
│   └── PlantDetail.tsx              ← Ya integrado aquí
└── components/ui/
    ├── avatar.tsx                   ← UI de avatar
    ├── card.tsx                     ← UI de tarjetas
    ├── textarea.tsx                 ← UI de área de texto
    └── alert-dialog.tsx             ← UI de confirmación
```

## Características Implementadas

✅ Publicar comentarios  
✅ Valoración con estrellas (1-5)  
✅ Editar comentarios propios  
✅ Eliminar comentarios propios  
✅ Ver todos los comentarios  
✅ Promedio de valoraciones  
✅ Contador de valoraciones  
✅ Animaciones suaves  
✅ Responsive design  
✅ Protección con RLS  
✅ Avatares de usuario  
✅ Fechas formateadas  
✅ Indicador de "editado"  
✅ Confirmación antes de eliminar  
✅ Estados de carga  
✅ Manejo de errores  
✅ Toast notifications  

## Personalización Rápida

### Cambiar Cantidad de Estrellas
```typescript
// En PlantComments.tsx, línea ~242
{[1, 2, 3, 4, 5].map((star) => (  // Cambia el array
```

### Cambiar Texto de Placeholder
```typescript
// En PlantComments.tsx, línea ~304
placeholder="Comparte tu experiencia con esta planta..."
```

### Cambiar Color de Estrellas
```typescript
// En PlantComments.tsx, línea ~248
className="fill-yellow-400 text-yellow-400"  // Cambia yellow-400
```

### Hacer Rating Obligatorio
```typescript
// En PlantComments.tsx, línea ~116
if (!newComment.trim() || newRating === 0) {  // Agrega || newRating === 0
  toast({
    title: "Campos incompletos",
    description: "Por favor agrega un comentario y una valoración",
    variant: "destructive"
  });
  return;
}
```

## Solución de Problemas Comunes

### 🔴 Error: "relation profiles does not exist"
**Solución:** Ejecuta `supabase-profiles-schema.sql`

### 🔴 Error: "relation comments does not exist"
**Solución:** Ejecuta `supabase-comments-schema.sql`

### 🔴 Error: "permission denied for table comments"
**Solución:** Verifica las políticas RLS están activas

### 🔴 No veo nombres de usuario
**Solución:** Ejecuta el script para crear perfiles de usuarios existentes (paso 4)

### 🔴 No puedo editar mi comentario
**Solución:** Verifica que la política "Users can update their own comments" existe

## Próximos Pasos Sugeridos

1. **Agregar paginación** - Mostrar 10 comentarios por página
2. **Agregar filtros** - Por valoración, fecha, etc.
3. **Agregar notificaciones** - Email cuando alguien comenta
4. **Agregar respuestas** - Comentarios anidados
5. **Agregar moderación** - Admin puede eliminar comentarios

## Documentación Completa

Para más detalles, consulta: `COMMENTS_SYSTEM.md`

---

**¿Dudas?** Consulta la documentación completa o contacta al equipo de desarrollo.

**Tiempo total de implementación:** ~10 minutos ⚡
