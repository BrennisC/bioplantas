# 🗄️ Configuración de Base de Datos para Comentarios

## 📋 Pasos en Supabase Dashboard

### Paso 1: Abrir SQL Editor (2 min)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, click en **"SQL Editor"** 📝
3. Click en **"New Query"** 

---

### Paso 2: Crear Tabla de Perfiles (3 min)

#### Script: `supabase-profiles-schema.sql`

```sql
-- Copiar y pegar TODO el contenido de supabase-profiles-schema.sql aquí
```

1. **Copiar** todo el contenido del archivo `supabase-profiles-schema.sql`
2. **Pegar** en el editor SQL
3. Click en **"Run"** (botón verde en la esquina inferior derecha)
4. ✅ Deberías ver: "Success. No rows returned"

#### ¿Qué hace este script?
- ✅ Crea tabla `profiles` con campos: id, name, email, avatar_url, bio
- ✅ Configura índices para mejor rendimiento
- ✅ Habilita Row Level Security (RLS)
- ✅ Crea políticas de seguridad
- ✅ Crea trigger para actualizar `updated_at`
- ✅ Crea función para crear perfiles automáticamente al registrar usuario
- ✅ Crea perfiles para usuarios existentes

---

### Paso 3: Crear Tabla de Comentarios (3 min)

#### Script: `supabase-comments-schema.sql`

```sql
-- Copiar y pegar TODO el contenido de supabase-comments-schema.sql aquí
```

1. **Copiar** todo el contenido del archivo `supabase-comments-schema.sql`
2. **Pegar** en el editor SQL
3. Click en **"Run"**
4. ✅ Deberías ver: "Success. No rows returned"

#### ¿Qué hace este script?
- ✅ Crea tabla `comments` con campos: id, plant_id, user_id, content, rating
- ✅ Configura índices para mejor rendimiento
- ✅ Habilita Row Level Security (RLS)
- ✅ Crea políticas de seguridad
- ✅ Crea trigger para actualizar `updated_at`
- ✅ Crea vista `comments_with_user` para joins optimizados

---

### Paso 4: Verificar Tablas Creadas (1 min)

1. En el menú lateral, click en **"Table Editor"** 📊
2. Deberías ver estas dos nuevas tablas:
   - ✅ `profiles`
   - ✅ `comments`

3. Click en cada tabla para ver su estructura:

#### Tabla `profiles`
```
Columnas:
- id (uuid, primary key)
- name (text)
- email (text)
- avatar_url (text)
- bio (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabla `comments`
```
Columnas:
- id (uuid, primary key)
- plant_id (uuid, foreign key → plants)
- user_id (uuid, foreign key → auth.users)
- content (text)
- rating (integer, 1-5, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

---

### Paso 5: Verificar Políticas RLS (2 min)

1. En el menú lateral, click en **"Authentication"** 🔐
2. Click en **"Policies"**
3. Busca la tabla **`profiles`** y verifica que tenga estas políticas:

```
✅ Anyone can view profiles
   - Operation: SELECT
   - Policy: (true)

✅ Users can update their own profile
   - Operation: UPDATE
   - Policy: (auth.uid() = id)

✅ Users can insert their own profile
   - Operation: INSERT
   - Policy: (auth.uid() = id)
```

4. Busca la tabla **`comments`** y verifica estas políticas:

```
✅ Anyone can view comments
   - Operation: SELECT
   - Policy: (true)

✅ Authenticated users can create comments
   - Operation: INSERT
   - Policy: (auth.uid() = user_id)

✅ Users can update their own comments
   - Operation: UPDATE
   - Policy: (auth.uid() = user_id)

✅ Users can delete their own comments
   - Operation: DELETE
   - Policy: (auth.uid() = user_id)
```

---

### Paso 6: Verificar Triggers (Opcional, 1 min)

1. Ve a **"Database"** → **"Triggers"**
2. Deberías ver:
   - ✅ `update_profiles_updated_at` en tabla `profiles`
   - ✅ `update_comments_updated_at` en tabla `comments`
   - ✅ `on_auth_user_created` en tabla `auth.users`

---

### Paso 7: Probar la Configuración (2 min)

#### Opción A: Desde SQL Editor

```sql
-- 1. Insertar un comentario de prueba (reemplaza los UUIDs)
INSERT INTO comments (plant_id, user_id, content, rating)
VALUES (
  'UUID_DE_UNA_PLANTA',  -- Reemplaza con un ID real de plants
  auth.uid(),             -- Tu usuario actual
  'Este es un comentario de prueba',
  5
);

-- 2. Ver comentarios
SELECT * FROM comments;

-- 3. Ver comentarios con datos de usuario
SELECT * FROM comments_with_user;

-- 4. Eliminar comentario de prueba
DELETE FROM comments WHERE content = 'Este es un comentario de prueba';
```

#### Opción B: Desde la App

1. Abre tu aplicación
2. Ve a cualquier planta
3. Scroll a "Comentarios"
4. Publica un comentario de prueba
5. ✅ Si aparece, ¡todo funciona!

---

## 🎯 Resumen de lo que Hicimos

```
✅ Tabla profiles creada
✅ Tabla comments creada
✅ 7 políticas RLS configuradas
✅ 3 triggers configurados
✅ 1 vista creada (comments_with_user)
✅ 1 función creada (handle_new_user)
✅ Índices optimizados
✅ Referencias (foreign keys) configuradas
```

---

## 🐛 Troubleshooting

### Error: "relation profiles already exists"
**Causa:** Ya ejecutaste el script antes  
**Solución:** 
1. Si quieres recrear: elimina la tabla y ejecuta de nuevo
2. Si no: ignora el error, ya está creada

### Error: "permission denied for table"
**Causa:** Las políticas RLS no están configuradas correctamente  
**Solución:** 
1. Ve a Authentication → Policies
2. Verifica que las políticas existen
3. Re-ejecuta el script si es necesario

### Error: "foreign key violation"
**Causa:** Intentas insertar un comentario con plant_id o user_id que no existe  
**Solución:** 
1. Verifica que la planta existe: `SELECT * FROM plants WHERE id = 'UUID'`
2. Verifica que el usuario existe: `SELECT * FROM auth.users WHERE id = 'UUID'`

### Error: "function handle_new_user already exists"
**Causa:** Ya ejecutaste el script antes  
**Solución:** 
1. El script tiene `CREATE OR REPLACE FUNCTION`, así que no debería fallar
2. Si falla, ejecuta: `DROP FUNCTION IF EXISTS handle_new_user() CASCADE;`
3. Luego re-ejecuta el script

---

## 📸 Capturas de Pantalla de Referencia

### SQL Editor
```
┌─────────────────────────────────────────┐
│ SQL Editor                              │
├─────────────────────────────────────────┤
│                                         │
│  [New Query] [SQL Snippets]            │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ -- Tu script SQL aquí             │ │
│  │ CREATE TABLE profiles (           │ │
│  │   id UUID PRIMARY KEY...          │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Run]                         [Save]  │
└─────────────────────────────────────────┘
```

### Table Editor
```
┌─────────────────────────────────────────┐
│ Tables                                  │
├─────────────────────────────────────────┤
│ › auth                                  │
│ › storage                               │
│ ✓ profiles          👁️  7 rows        │
│ ✓ comments          👁️  0 rows        │
│ › plants                                │
│ › categories                            │
│ › favorites                             │
└─────────────────────────────────────────┘
```

### Policies View
```
┌─────────────────────────────────────────┐
│ Policies for: comments                  │
├─────────────────────────────────────────┤
│                                         │
│ ✓ Anyone can view comments              │
│   SELECT | (true)                       │
│                                         │
│ ✓ Authenticated users can create...    │
│   INSERT | (auth.uid() = user_id)      │
│                                         │
│ ✓ Users can update their own...        │
│   UPDATE | (auth.uid() = user_id)      │
│                                         │
│ ✓ Users can delete their own...        │
│   DELETE | (auth.uid() = user_id)      │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist Final

Marca cada item cuando lo completes:

- [ ] Script `supabase-profiles-schema.sql` ejecutado sin errores
- [ ] Script `supabase-comments-schema.sql` ejecutado sin errores
- [ ] Tabla `profiles` visible en Table Editor
- [ ] Tabla `comments` visible en Table Editor
- [ ] Políticas RLS de `profiles` visibles (3 políticas)
- [ ] Políticas RLS de `comments` visibles (4 políticas)
- [ ] Triggers visibles (3 triggers)
- [ ] Comentario de prueba creado exitosamente
- [ ] Comentario de prueba visible en la app
- [ ] Comentario de prueba eliminado

---

## 🎉 ¡Listo!

Si todos los items del checklist están marcados, **¡el sistema de comentarios está completamente configurado y funcionando!** 🚀

Ahora puedes:
1. Publicar comentarios en plantas
2. Valorar con estrellas
3. Editar tus comentarios
4. Eliminar tus comentarios
5. Ver comentarios de otros usuarios

---

**Tiempo total estimado:** 10-15 minutos ⏱️  
**Dificultad:** ⭐⭐☆☆☆ (Fácil)  
**Siguiente paso:** Probar el sistema desde la app
