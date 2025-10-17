# 🔧 Instrucciones para Arreglar Módulos del Administrador

## ✅ Estado Actual

### Ya Completado:
1. ✅ **Modo Oscuro en Configuración** - Ya está funcionando
2. ✅ **Campos nuevos agregados** - usage_instructions, warnings, scientific_article_url
3. ✅ **RLS Policies actualizadas** - Permisos para plants table

### Pendiente de Ejecutar (3 Scripts SQL):
1. ❌ **Categorías, Etiquetas y Dolencias** - Tablas no existen
2. ❌ **Favoritos y Tendencias** - Funciones no existen
3. ❌ **Sugerencias** - Tabla no existe

---

## 📋 Paso a Paso para Arreglar TODO

### Paso 1: Arreglar Categorías, Favoritos y Tendencias

1. Ve a tu **Supabase Dashboard** → SQL Editor
2. Abre el archivo: `bd/arreglar-modulos-admin.sql`
3. **Copia TODO el contenido** del archivo
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **RUN** ▶️
6. Deberías ver: "Success. No rows returned"

**Qué arregla este script:**
- ✅ Crea tabla `plant_categories` con 12 categorías por defecto
- ✅ Crea tabla `plant_tags` 
- ✅ Crea tabla `plant_ailments`
- ✅ Configura permisos RLS para las 3 tablas
- ✅ Crea función `get_popular_plants()` para Favoritos
- ✅ Crea función `get_trending_plants()` para Tendencias

### Paso 2: Arreglar Sugerencias

1. En el mismo SQL Editor de Supabase
2. Abre el archivo: `bd/supabase-plant-suggestions-schema.sql`
3. **Copia TODO el contenido** del archivo
4. Pégalo en el SQL Editor
5. Haz clic en **RUN** ▶️
6. Deberías ver: "Success. No rows returned"

**Qué arregla este script:**
- ✅ Crea tabla `plant_suggestions`
- ✅ Configura RLS (usuarios ven sus propias sugerencias, admins ven todas)
- ✅ Crea función `approve_plant_suggestion()` 
- ✅ Crea función `reject_plant_suggestion()`
- ✅ Sistema automático de notificaciones

### Paso 3: Verificar Storage (Permisos de Imágenes)

Si tienes problemas subiendo imágenes, sigue la guía:
- Archivo: `doc/arreglar-storage-permisos.md`

---

## 🧪 Cómo Probar que Todo Funciona

Después de ejecutar los 2 scripts SQL, recarga tu panel de administrador y prueba:

### 1. Modo Oscuro ✅
- Ve a: **Configuración** → Tab "Apariencia"
- Deberías ver 3 botones: Claro / Oscuro / Sistema
- Haz clic en cada uno, el tema debe cambiar inmediatamente

### 2. Categorías ✅
- Ve a: **Categorías**
- Deberías ver las 12 categorías por defecto cargadas
- Intenta agregar una nueva categoría
- Intenta agregar una etiqueta
- Intenta agregar una dolencia

### 3. Favoritos y Tendencias ✅
- Ve a: **Favoritos y Tendencias**
- Deberías ver estadísticas de plantas populares
- Deberías ver gráfico de tendencias de los últimos 7 días

### 4. Sugerencias ✅
- Ve a: **Sugerencias de Usuarios**
- La página debe cargar (aunque esté vacía si no hay sugerencias)
- No debe mostrar error de "table doesn't exist"

---

## 🐛 Si Algo No Funciona

### Error: "relation does not exist"
- Significa que no ejecutaste uno de los scripts SQL
- Vuelve a ejecutar el script correspondiente

### Error: "permission denied"
- Verifica que tu usuario tenga rol 'admin' en la tabla profiles
- Query para verificar:
  ```sql
  SELECT id, email, role FROM profiles WHERE id = auth.uid();
  ```

### Campos nuevos no se guardan desde el admin
- Este es un problema aparte que estamos investigando
- Por ahora puedes editar directamente con SQL:
  ```sql
  UPDATE plants 
  SET 
    usage_instructions = 'tu texto aquí',
    warnings = 'tu texto aquí', 
    scientific_article_url = 'https://...'
  WHERE id = 'id-de-la-planta';
  ```

---

## 📊 Resumen de Archivos Importantes

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `bd/arreglar-modulos-admin.sql` | Arregla 4 módulos | ⚠️ **Ejecutar** |
| `bd/supabase-plant-suggestions-schema.sql` | Arregla sugerencias | ⚠️ **Ejecutar** |
| `bd/arreglar-rls-plants.sql` | Permisos plants | ✅ Ya ejecutado |
| `bd/add-botanic-index-fields.sql` | Campos nuevos | ✅ Ya ejecutado |
| `doc/arreglar-storage-permisos.md` | Guía storage | 📖 Referencia |

---

## 🎯 Próximos Pasos Después de Ejecutar los Scripts

1. **Recargar el panel de administrador** (F5)
2. **Probar cada módulo** según la lista de arriba
3. **Reportar cualquier error** que aún aparezca
4. **Investigar por qué los campos nuevos no se guardan** desde el admin (último bug pendiente)

---

## 💡 Notas Técnicas

### Categorías por Defecto que se Crearán:
- 🌿 Plantas Medicinales
- 🏡 Plantas Ornamentales  
- 🌺 Flores de Jardín
- 🌳 Árboles y Arbustos
- 🌵 Cactáceas y Suculentas
- 🥬 Plantas Comestibles
- 🌱 Hierbas Aromáticas
- 🌴 Plantas Tropicales
- 🏔️ Plantas de Clima Frío
- 🎋 Bambúes y Gramíneas
- 💧 Plantas Acuáticas
- 🪴 Plantas de Interior

### Funciones SQL Creadas:
- `get_popular_plants(limit_count)` - Ordena por favoritos totales
- `get_trending_plants(limit_count)` - Favoritos de últimos 7 días
- `approve_plant_suggestion(suggestion_id)` - Aprobar sugerencia
- `reject_plant_suggestion(suggestion_id, reason)` - Rechazar con motivo

---

**¿Dudas?** Ejecuta primero los 2 scripts SQL y luego prueba. ¡La mayoría de problemas se resolverán! 🚀
