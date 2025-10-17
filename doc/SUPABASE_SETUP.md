# 🌿 BioPlantas - Configuración de Supabase

## 📋 Pasos para configurar la base de datos

### 1. **Accede a tu proyecto de Supabase**
   - Ve a [https://qzzyjzfxwuaasnfoslud.supabase.co](https://qzzyjzfxwuaasnfoslud.supabase.co)
   - Inicia sesión en tu cuenta de Supabase

### 2. **Ejecuta el esquema SQL**
   - En el panel izquierdo, haz clic en **SQL Editor**
   - Copia todo el contenido del archivo `supabase-schema.sql`
   - Pégalo en el editor SQL
   - Haz clic en **RUN** para ejecutar el script

   Este script creará:
   - ✅ Tabla `users` (perfiles de usuario)
   - ✅ Tabla `plants` (catálogo de plantas)
   - ✅ Tabla `favorites` (plantas favoritas de usuarios)
   - ✅ Tabla `comments` (comentarios y reseñas)
   - ✅ Políticas RLS (Row Level Security)
   - ✅ Triggers automáticos
   - ✅ Datos iniciales (6 plantas de ejemplo)

### 3. **Configura la autenticación**
   - Ve a **Authentication** > **Providers**
   - Asegúrate de que **Email** esté habilitado
   - **Opcional**: Desactiva la confirmación de email para desarrollo:
     - Ve a **Authentication** > **Settings**
     - Desactiva "Enable email confirmations"

### 4. **Verifica las políticas de seguridad**
   - Ve a **Authentication** > **Policies**
   - Verifica que las políticas RLS estén activas en todas las tablas

### 5. **Variables de entorno**
   Las credenciales ya están configuradas en el archivo `.env`:
   ```
   VITE_SUPABASE_URL=https://qzzyjzfxwuaasnfoslud.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 6. **Crear primer usuario administrador**
   Opción 1 - Desde el código:
   - Regístrate normalmente en `/register`
   - Ve a Supabase > **Table Editor** > `users`
   - Encuentra tu usuario y cambia el campo `role` de `user` a `admin`

   Opción 2 - SQL directo:
   ```sql
   -- Después de registrarte, ejecuta esto en SQL Editor
   UPDATE public.users 
   SET role = 'admin' 
   WHERE email = 'tu-email@ejemplo.com';
   ```

## 🚀 Funcionalidades Implementadas

### ✅ **Autenticación Real con Supabase**
- Login con email y contraseña
- Registro de nuevos usuarios
- Sesiones persistentes
- Roles (user/admin)
- Logout funcional

### ✅ **Base de Datos PostgreSQL**
- Todas las plantas se guardan en Supabase
- CRUD completo de plantas (admin)
- Consultas en tiempo real

### ✅ **Seguridad**
- Row Level Security (RLS) activado
- Solo admins pueden crear/editar/eliminar plantas
- Usuarios solo pueden ver plantas
- Validación de permisos

### ✅ **Panel de Administración**
- Gestión completa de plantas
- Agregar nuevas plantas
- Editar plantas existentes
- Eliminar plantas
- Búsqueda en tiempo real

## 📊 Estructura de Datos

### Tabla: `plants`
```sql
- id (UUID, primary key)
- name (text)
- scientific_name (text)
- description (text)
- category (text)
- properties (text)
- image (text - URL)
- tags (text[] - array)
- ailments (text[] - array)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabla: `users`
```sql
- id (UUID, foreign key a auth.users)
- email (text, unique)
- role (text: 'user' | 'admin')
- full_name (text)
- avatar_url (text)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🔐 Políticas de Seguridad (RLS)

### Plants:
- ✅ **SELECT**: Todos pueden ver plantas
- 🔒 **INSERT/UPDATE/DELETE**: Solo administradores

### Users:
- ✅ **SELECT**: Usuarios solo ven su propio perfil
- ✅ **UPDATE**: Usuarios solo editan su propio perfil

### Favorites (para futuro):
- ✅ **SELECT/INSERT/DELETE**: Usuarios solo sus propios favoritos

## 🧪 Pruebas

### Probar autenticación:
1. Ve a `/register`
2. Crea una cuenta con email y contraseña
3. Verifica que te redirija a `/explore`
4. Deberías ver las plantas cargadas desde Supabase

### Probar panel admin:
1. Crea una cuenta
2. Cambia el rol a admin en Supabase
3. Haz logout y login nuevamente
4. Accede a `/dashboard`
5. Prueba crear/editar/eliminar plantas

## 🐛 Troubleshooting

### Error: "Failed to fetch plants"
- Verifica que ejecutaste el SQL schema
- Revisa las políticas RLS
- Verifica las credenciales en `.env`

### Error: "Permission denied"
- Verifica que el usuario tenga rol `admin` para editar plantas
- Revisa las políticas RLS en Supabase

### Las plantas no aparecen:
- Ejecuta el seed data del schema SQL
- Verifica en Table Editor que las plantas existen

## 📝 Próximos pasos sugeridos

1. **Sistema de Favoritos**
   - La tabla ya está creada
   - Implementar UI para añadir/quitar favoritos

2. **Búsqueda Avanzada**
   - Búsqueda por tags
   - Filtros por categoría
   - Full-text search

3. **Upload de Imágenes**
   - Configurar Storage en Supabase
   - Implementar upload directo

4. **Sistema de Comentarios**
   - La tabla ya está creada
   - Implementar UI de reseñas

5. **Dashboard con Estadísticas**
   - Gráficos reales
   - Contadores de plantas/usuarios

## 🔗 Enlaces Útiles

- [Documentación Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
