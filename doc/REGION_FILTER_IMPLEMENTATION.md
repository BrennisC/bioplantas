# ✅ Filtrado de Plantas por Región (Costa, Sierra, Selva)

**Fecha:** 30 de Noviembre, 2025

---

## 🎯 Objetivo

Agregar la funcionalidad de **seleccionar y filtrar plantas por región geográfica** (Costa, Sierra, Selva) directamente desde el panel de administración, sin necesidad de editar manualmente la base de datos.

---

## 📋 Pasos de Implementación

### 1️⃣ Ejecutar Script SQL

**Archivo:** `bd/add-region-column.sql`

**Qué hace:**
- ✅ Agrega columna `region` a la tabla `plants`
- ✅ Restringe valores a: `NULL`, `'Costa'`, `'Sierra'`, `'Selva'`
- ✅ Crea índice para filtrado rápido
- ✅ Incluye consultas de verificación

**Cómo ejecutar:**

1. Abre **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Crea una **nueva consulta**
4. Pega el contenido de `bd/add-region-column.sql`
5. Haz clic en **Run**

**Verificación:**
```sql
-- Ver si la columna se creó
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'plants' AND column_name = 'region';

-- Debería retornar:
-- column_name | data_type
-- region      | text
```

---

### 2️⃣ Usar el Panel de Administración

Una vez ejecutado el script SQL, ya puedes usar la nueva funcionalidad:

#### **Agregar Región a Planta Nueva:**

1. Dashboard → **Plantas** → **+ Agregar Planta**
2. Llena los campos normales (nombre, científico, etc.)
3. En el nuevo campo **"Región"**, selecciona:
   - 🌊 **Costa**
   - ⛰️ **Sierra**
   - 🌴 **Selva**
   - O déjalo en **"Sin región específica"** (NULL)
4. Guarda la planta

#### **Editar Región de Planta Existente:**

1. Dashboard → **Plantas**
2. Haz clic en el botón **✏️ Editar** de cualquier planta
3. Cambia el valor del selector **"Región"**
4. Guarda los cambios

---

## 🎨 Características Implementadas

### ✅ En el Formulario de Edición/Creación

```tsx
<select className="input w-full">
  <option value="">Sin región específica</option>
  <option value="Costa">🌊 Costa</option>
  <option value="Sierra">⛰️ Sierra</option>
  <option value="Selva">🌴 Selva</option>
</select>
```

**Ubicación:** Aparece junto al selector de "Categoría"

### ✅ En la Tabla de Plantas

Las plantas ahora muestran **2 badges**:
1. **Verde** → Categoría (ej: "Hierbas", "Medicinales")
2. **Azul** → Región (ej: "🌊 Costa", "⛰️ Sierra", "🌴 Selva")

**Si no tiene región asignada:** Solo muestra el badge de categoría

---

## 📊 Base de Datos

### Estructura de la Columna

| Campo | Tipo | Nullable | Constraint |
|-------|------|----------|------------|
| `region` | TEXT | ✅ Sí | CHECK: `NULL` o `'Costa'`, `'Sierra'`, `'Selva'` |

### Índice Creado

```sql
CREATE INDEX idx_plants_region ON plants(region);
```

**Ventaja:** Filtrado rápido incluso con miles de plantas

---

## 🔍 Consultas SQL Útiles

### Ver plantas por región

```sql
-- Plantas de la Costa
SELECT name, category, region FROM plants WHERE region = 'Costa';

-- Plantas de la Sierra
SELECT name, category, region FROM plants WHERE region = 'Sierra';

-- Plantas de la Selva
SELECT name, category, region FROM plants WHERE region = 'Selva';

-- Plantas sin región asignada
SELECT name, category FROM plants WHERE region IS NULL;
```

### Distribución de plantas por región

```sql
SELECT 
  COALESCE(region, 'Sin región') as region,
  COUNT(*) as total
FROM plants
GROUP BY region
ORDER BY total DESC;
```

### Actualizar región masivamente

```sql
-- Ejemplo: Asignar plantas de la costa
UPDATE plants 
SET region = 'Costa' 
WHERE name IN ('Hercampuri', 'Uña de gato');

-- Ejemplo: Asignar plantas de la sierra
UPDATE plants 
SET region = 'Sierra' 
WHERE name IN ('Maca', 'Muña', 'Quinua');

-- Ejemplo: Asignar plantas de la selva
UPDATE plants 
SET region = 'Selva' 
WHERE name IN ('Ayahuasca', 'Sangre de grado', 'Copaiba');
```

---

## 🧪 Testing

### Test 1: Crear planta con región

1. Dashboard → Plantas → + Agregar Planta
2. Nombre: "Maca"
3. Científico: "Lepidium meyenii"
4. Categoría: "Medicinales"
5. **Región: ⛰️ Sierra**
6. Guardar

**Verificar:**
- ✅ Badge azul "⛰️ Sierra" aparece en la tabla
- ✅ Al editar, el selector muestra "⛰️ Sierra" seleccionado

### Test 2: Editar región existente

1. Selecciona planta sin región
2. Editar → Cambiar región a "🌴 Selva"
3. Guardar

**Verificar:**
- ✅ Badge azul "🌴 Selva" aparece
- ✅ Supabase muestra `region = 'Selva'`

### Test 3: Quitar región

1. Editar planta con región
2. Cambiar selector a "Sin región específica"
3. Guardar

**Verificar:**
- ✅ Badge azul desaparece
- ✅ Supabase muestra `region = NULL`

---

## 🚀 Próximos Pasos (Opcional)

### Implementar Filtrado en la Interfaz de Usuario

Podrías agregar filtros en la página de exploración:

```tsx
// En Explore.tsx o similar
<select onChange={(e) => setRegionFilter(e.target.value)}>
  <option value="">Todas las regiones</option>
  <option value="Costa">🌊 Costa</option>
  <option value="Sierra">⛰️ Sierra</option>
  <option value="Selva">🌴 Selva</option>
</select>
```

```tsx
// Query filtrada
const { data } = await supabase
  .from('plants')
  .select('*')
  .eq('region', regionFilter); // Solo si regionFilter no es vacío
```

### Agregar Filtro Combinado

```tsx
// Filtrar por categoría Y región
const { data } = await supabase
  .from('plants')
  .select('*')
  .eq('category', 'Medicinales')
  .eq('region', 'Sierra');
```

---

## 📁 Archivos Modificados

### 1. `bd/add-region-column.sql` (NUEVO)
- Script SQL para agregar columna `region`
- Incluye constraint de validación
- Crea índice para performance

### 2. `client/modules/admin/PlantsManager.tsx`
**Cambios:**
- ✅ Selector de región en formulario (línea ~680)
- ✅ Campo `region` en UPDATE (línea ~101)
- ✅ Campo `region` en INSERT (línea ~130)
- ✅ Campo `region` en onSave (línea ~668)
- ✅ Badge de región en tabla (línea ~327)

---

## 🎯 Resumen

| Característica | Estado |
|----------------|--------|
| Columna `region` en BD | ✅ SQL creado |
| Selector en formulario | ✅ Implementado |
| Guardado en UPDATE | ✅ Implementado |
| Guardado en INSERT | ✅ Implementado |
| Visualización en tabla | ✅ Badge azul |
| Validación de datos | ✅ Solo 3 valores + NULL |
| Índice de performance | ✅ Creado |

---

## ✨ Resultado Final

**ANTES:**
```
┌────────────────┬──────────────┐
│ Nombre         │ Categoría    │
├────────────────┼──────────────┤
│ Maca           │ Medicinales  │
└────────────────┴──────────────┘
```

**AHORA:**
```
┌────────────────┬────────────────────────────┐
│ Nombre         │ Categoría & Región         │
├────────────────┼────────────────────────────┤
│ Maca           │ 🟢 Medicinales             │
│                │ 🔵 ⛰️ Sierra                │
└────────────────┴────────────────────────────┘
```

**Ahora puedes asignar regiones directamente desde el panel de administración sin tocar la base de datos manualmente!** 🎉
