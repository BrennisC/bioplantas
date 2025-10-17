# PlantComments Component 🌟💬

Sistema completo de comentarios y valoraciones para plantas medicinales.

## 📦 Instalación Rápida

1. **Ejecutar scripts SQL** (5 min)
   ```bash
   # En Supabase SQL Editor
   supabase-profiles-schema.sql
   supabase-comments-schema.sql
   ```

2. **Ya está integrado** ✅
   El componente ya está importado en `PlantDetail.tsx`

3. **Probar**
   - Ve a cualquier planta: `/plantas/[id]`
   - Scroll a "Comentarios y Valoraciones"
   - ¡Listo! 🎉

## 📚 Documentación

- 📖 **Guía rápida (10 min):** `COMMENTS_QUICK_GUIDE.md`
- 📖 **Documentación completa:** `COMMENTS_SYSTEM.md`
- 📖 **Setup de Supabase:** `SUPABASE_COMMENTS_SETUP.md`
- 📖 **Resumen ejecutivo:** `COMMENTS_SUMMARY.md`

## ✨ Características

```typescript
✅ Comentarios con texto
✅ Valoración 1-5 estrellas
✅ Editar comentarios propios
✅ Eliminar comentarios propios
✅ Promedio de valoraciones
✅ Animaciones suaves
✅ Responsive design
✅ RLS Security
✅ Dark mode support
```

## 🎯 Uso del Componente

```tsx
import PlantComments from "@/modules/plants/PlantComments";

<PlantComments 
  plantId="uuid-de-la-planta" 
  plantName="Nombre de la Planta"
/>
```

## 🔐 Permisos

| Acción | Anónimo | Autenticado | Autor |
|--------|---------|-------------|-------|
| Ver    | ✅      | ✅          | ✅    |
| Crear  | ❌      | ✅          | ✅    |
| Editar | ❌      | ❌          | ✅    |
| Borrar | ❌      | ❌          | ✅    |

## 🗄️ Base de Datos

### Tabla: `comments`
- `id` - UUID
- `plant_id` - UUID (FK → plants)
- `user_id` - UUID (FK → auth.users)
- `content` - TEXT
- `rating` - INTEGER (1-5, nullable)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Tabla: `profiles`
- `id` - UUID (FK → auth.users)
- `name` - TEXT
- `email` - TEXT
- `avatar_url` - TEXT
- `bio` - TEXT
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

## 🎨 UI Components

```typescript
// shadcn/ui
Avatar, Card, Button, Textarea, AlertDialog

// Icons (lucide-react)
Star, MessageSquare, Send, Edit2, Trash2, Loader2

// Animations
Framer Motion
```

## 🧪 Testing

```bash
# Probar como usuario autenticado
1. Iniciar sesión
2. Ir a una planta
3. Publicar comentario con estrellas
4. Editar el comentario
5. Eliminar el comentario

# Probar como anónimo
1. Cerrar sesión
2. Ir a una planta
3. Ver comentarios (no poder publicar)
```

## 🐛 Troubleshooting

### No se muestran comentarios
```sql
-- Verificar en Supabase SQL Editor
SELECT * FROM comments;
SELECT * FROM profiles;
```

### No puedo publicar
1. ¿Estás autenticado?
2. ¿Ejecutaste los scripts SQL?
3. ¿Las políticas RLS están activas?

### No veo nombres de usuario
```sql
-- Crear perfiles para usuarios existentes
INSERT INTO profiles (id, email, name)
SELECT id, email, split_part(email, '@', 1)
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);
```

## 📈 Mejoras Futuras

- [ ] Paginación
- [ ] Respuestas a comentarios
- [ ] Reacciones (like, etc.)
- [ ] Reportar contenido
- [ ] Notificaciones
- [ ] Moderación admin

## 🔗 Enlaces Útiles

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Framer Motion](https://www.framer.com/motion/)
- [shadcn/ui](https://ui.shadcn.com/)

## 📞 Soporte

¿Problemas? Consulta la documentación completa en `COMMENTS_SYSTEM.md`

---

**Versión:** 1.0.0  
**Estado:** ✅ Production Ready  
**Autor:** Cosmos Haven Team  
**Fecha:** Octubre 2025
