# 🔧 SOLUCIÓN: Campos No Se Muestran en Detalle de Planta

## 🎯 Problema
Agregaste los campos como administrador pero NO se muestran en el detalle de la planta.

## ✅ Causa Raíz
**Los campos NO EXISTEN en la tabla `plants` de la base de datos.**

Cuando intentaste ejecutar el script de diagnóstico, obtuviste este error:
```
ERROR: column "scientific_article_url" does not exist
```

Esto confirma que nunca se ejecutó el script para agregar estos campos.

---

## 📝 Solución Paso a Paso

### **Paso 1: Ejecutar el script para agregar campos**

Ve a **Supabase Dashboard** → **SQL Editor** → Copia y pega TODO el contenido del archivo:

📄 **`add-botanic-index-fields.sql`**

Haz clic en **RUN** ▶️

Este script agregará 3 campos nuevos a la tabla `plants`:
- ✅ `usage_instructions` - Instrucciones de preparación y uso
- ✅ `warnings` - Advertencias y precauciones
- ✅ `scientific_article_url` - Enlace a artículo científico

---

### **Paso 2: Verificar que los campos se crearon**

Ejecuta este query en Supabase SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'plants'
AND column_name IN ('usage_instructions', 'warnings', 'scientific_article_url')
ORDER BY ordinal_position;
```

**Resultado esperado:** Deberías ver 3 filas con los nombres de las columnas.

---

### **Paso 3: Editar una planta como administrador**

1. Ve al **Panel de Administrador**
2. Ve a la sección **"Plantas"**
3. **Edita** una planta existente
4. Busca los campos:
   - 📖 **Instrucciones de Uso** (textarea grande)
   - ⚠️ **Advertencias y Precauciones** (textarea grande)
   - 🔬 **Artículo Científico** (input con URL)
5. **Escribe contenido REAL** (no dejes vacío)
6. Haz clic en **"💾 Guardar Planta"**

---

### **Paso 4: Verificar en el detalle de la planta**

1. Ve al catálogo de plantas (como usuario)
2. Haz clic en la planta que editaste
3. Baja al **Índice Botánico** (sección de acordeón)
4. **AHORA SÍ deberías ver:**
   - 📖 Cómo Preparar y Usar
   - ⚠️ Advertencias y Contraindicaciones
   - 🔬 Investigación Científica (con botón "Ver artículo científico")

---

## 🐛 Si Todavía No Se Muestra

### Ejecuta este script de diagnóstico:

```sql
-- Ver una planta específica (cambia el ID)
SELECT 
  id,
  name,
  usage_instructions,
  warnings,
  scientific_article_url,
  LENGTH(usage_instructions) as len_instrucciones,
  LENGTH(warnings) as len_advertencias,
  LENGTH(scientific_article_url) as len_articulo
FROM plants
WHERE id = '12345678-1234-1234-1234-123456789abc'; -- CAMBIA ESTE ID
```

**Interpretación:**
- Si `len_instrucciones` = `NULL` → No guardaste contenido
- Si `len_instrucciones` = `0` → Guardaste cadena vacía (problema)
- Si `len_instrucciones` > `0` → Tiene contenido (correcto)

### Limpiar cadenas vacías (si es necesario):

```sql
UPDATE plants
SET 
  usage_instructions = NULL,
  warnings = NULL,
  scientific_article_url = NULL
WHERE 
  (usage_instructions = '' OR TRIM(usage_instructions) = '')
  OR (warnings = '' OR TRIM(warnings) = '')
  OR (scientific_article_url = '' OR TRIM(scientific_article_url) = '');
```

Después de limpiar, **vuelve a editar la planta y guarda contenido real**.

---

## 📋 Checklist Final

- [ ] ✅ Ejecuté `add-botanic-index-fields.sql`
- [ ] ✅ Verifiqué que los 3 campos existen en la tabla
- [ ] ✅ Edité una planta como admin y guardé contenido REAL
- [ ] ✅ Verifiqué que el contenido se guardó en la base de datos
- [ ] ✅ Abrí el detalle de la planta y veo las secciones

---

## 🎓 ¿Por Qué Pasó Esto?

El código del frontend (React) **SÍ está correcto** y **SÍ muestra** estos campos.

El problema es que **la base de datos NO tenía las columnas**, por eso:
1. El admin no podía guardar valores
2. El query `SELECT *` no traía esos campos
3. El frontend no tenía datos para mostrar

**Ahora que agregas las columnas → puedes guardar → el frontend los muestra.**

---

## 🚀 Próximos Pasos

Una vez que funcione:

1. **Edita todas tus plantas** importantes para agregar:
   - Instrucciones de uso detalladas
   - Advertencias específicas
   - Enlaces a artículos científicos (PubMed, Google Scholar, etc.)

2. **Esto mejora mucho la calidad** de tu aplicación porque los usuarios tendrán:
   - Guías prácticas de cómo usar cada planta
   - Información de seguridad importante
   - Referencias científicas confiables

---

¿Ya ejecutaste el script? ¿Te funcionó?
