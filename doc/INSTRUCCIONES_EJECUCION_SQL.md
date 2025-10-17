# 🚀 Instrucciones de Ejecución - Sistema Médico

## ⚠️ IMPORTANTE: Ejecutar en este orden

### Paso 1: Ejecutar el SQL actualizado

Ve a **Supabase SQL Editor** y ejecuta el archivo completo:

```sql
-- Copiar y pegar TODO el contenido de:
bd/user-medical-profile.sql
```

Este archivo ahora incluye:
- ✅ Protección contra triggers duplicados (`DROP TRIGGER IF EXISTS`)
- ✅ Protección contra políticas duplicadas (`DROP POLICY IF EXISTS`)
- ✅ Función corregida `get_recommended_plants_for_user()` con nombres de columna correctos
- ✅ Manejo de valores NULL con `COALESCE`

### Paso 2: Verificar que se ejecutó correctamente

```sql
-- 1. Verificar condiciones médicas (debe retornar ~28 filas)
SELECT COUNT(*) FROM medical_conditions;

-- 2. Verificar tabla de perfiles
SELECT COUNT(*) FROM user_medical_profile;

-- 3. Verificar función existe
SELECT proname FROM pg_proc WHERE proname = 'get_recommended_plants_for_user';
```

### Paso 3: Ejecutar el otro SQL (campos médicos en plants)

```sql
-- Copiar y pegar TODO el contenido de:
bd/add-medical-fields.sql
```

### Paso 4: Verificar campos en plants

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'plants' 
  AND column_name IN (
    'therapeutic_indications',
    'safe_pregnancy',
    'safe_lactation',
    'safe_children',
    'evidence_level'
  );
```

Debe retornar 5 filas.

---

## 🧪 Probar el Sistema

### 1. Registrar un usuario nuevo

1. Ir a `/register`
2. Llenar formulario
3. Iniciar sesión

### 2. Completar el Onboarding

Al ir a `/explorar`, el wizard debe aparecer automáticamente.

**Cambios en el wizard:**
- ✅ Opción "Ninguna de estas" agregada en Paso 1 (condiciones médicas)
- ✅ Todos los campos del Paso 3 son opcionales (medicamentos, alergias, preferencias)
- ✅ Mensajes más claros indicando que los campos son opcionales

**Flujo del wizard:**

**Paso 1: Condiciones Médicas**
- Opción destacada: "✅ Ninguna de estas - No tengo ninguna condición médica crónica"
- Si seleccionas otras condiciones, esta opción se desmarca
- Si no tienes condiciones, haz clic en "Ninguna de estas" y sigue al siguiente paso

**Paso 2: Estados Especiales**
- ¿Embarazada? (opcional)
- ¿Lactancia? (opcional)
- ¿Tiene niños? (opcional)
- Puedes dejar todos en NO y seguir

**Paso 3: Medicamentos y Alergias**
- TODO ES OPCIONAL
- Puedes dejar los campos vacíos
- Placeholder dice "o escribe 'Ninguno'"
- Las preferencias de uso también son opcionales

**Paso 4: Resumen**
- Muestra solo lo que seleccionaste
- Botón "Completar" guarda tu perfil

### 3. Ver Recomendaciones

Después de completar el wizard:
- Si hay plantas con datos médicos → verás la sección "Recomendadas para ti"
- Si no hay plantas aún → verás mensaje amigable: "¡Explora nuestro catálogo completo!"

---

## 🐛 Solución de Problemas

### Error: "No se pudieron cargar las recomendaciones"

**Causa:** La función SQL tenía nombres de columna incorrectos (`plant_id` en vez de `id`, `plant_name` en vez de `common_name`)

**Solución:** ✅ Ya corregido en el SQL actualizado. Vuelve a ejecutar `bd/user-medical-profile.sql`

**Verificar fix:**
```sql
-- Probar la función manualmente
SELECT * FROM get_recommended_plants_for_user(auth.uid());
```

Si da error, revisar que los nombres de columna en `plants` sean:
- `id` (INTEGER o UUID)
- `common_name` (TEXT)
- `scientific_name` (TEXT)
- `image_url` (TEXT)
- `safe_pregnancy`, `safe_lactation`, `safe_children` (BOOLEAN)
- `therapeutic_indications`, `evidence_level` (TEXT)

### Error: "trigger already exists"

**Causa:** Intentaste ejecutar el script dos veces sin `DROP TRIGGER IF EXISTS`

**Solución:** ✅ Ya corregido. El nuevo script incluye:
```sql
DROP TRIGGER IF EXISTS update_user_medical_profile_updated_at_trigger ON user_medical_profile;
```

### El wizard no aparece

**Posibles causas:**
1. El usuario ya completó el onboarding → Ir a `/perfil` y buscar "Actualizar condiciones médicas"
2. Error en la query de verificación

**Debug:**
```sql
-- Ver si el perfil existe
SELECT * FROM user_medical_profile WHERE user_id = auth.uid();
```

Si no existe, el wizard debe aparecer automáticamente.

### No aparece la sección "Recomendadas para ti"

**Verificar:**
1. ¿Ejecutaste `bd/add-medical-fields.sql`?
2. ¿Las plantas tienen datos en `therapeutic_indications`?

```sql
-- Ver plantas con información médica
SELECT common_name, therapeutic_indications, safe_pregnancy 
FROM plants 
WHERE therapeutic_indications IS NOT NULL;
```

Si no hay plantas con datos médicos, agrega algunas manualmente:

```sql
UPDATE plants 
SET 
  therapeutic_indications = 'Ayuda con problemas digestivos, dolor de estómago, náuseas',
  safe_pregnancy = true,
  safe_lactation = true,
  safe_children = true,
  evidence_level = 'B'
WHERE id = 1; -- Reemplaza con ID de una planta real
```

---

## 📊 Queries Útiles para Admin

### Ver todos los perfiles de usuario
```sql
SELECT 
  p.email,
  ump.onboarding_completed,
  ump.is_pregnant,
  ump.is_lactating,
  ump.has_children,
  array_length(ump.conditions, 1) as num_conditions
FROM user_medical_profile ump
JOIN profiles p ON p.id = ump.user_id
ORDER BY ump.created_at DESC;
```

### Condiciones médicas más comunes
```sql
SELECT 
  mc.name,
  mc.category,
  COUNT(*) as usuarios
FROM medical_conditions mc
WHERE EXISTS (
  SELECT 1 FROM user_medical_profile ump
  WHERE mc.id = ANY(ump.conditions)
)
GROUP BY mc.id, mc.name, mc.category
ORDER BY usuarios DESC;
```

### Plantas con información médica completa
```sql
SELECT 
  common_name,
  CASE WHEN therapeutic_indications IS NOT NULL THEN '✅' ELSE '❌' END as indicaciones,
  CASE WHEN safe_pregnancy IS NOT NULL THEN '✅' ELSE '❌' END as embarazo,
  CASE WHEN evidence_level IS NOT NULL THEN '✅' ELSE '❌' END as evidencia
FROM plants
ORDER BY common_name;
```

---

## ✅ Checklist de Implementación

- [x] SQL corregido con `DROP IF EXISTS`
- [x] Función de recomendaciones con nombres de columna correctos
- [x] Opción "Ninguna" agregada en wizard (Paso 1)
- [x] Todos los campos del Paso 3 marcados como opcionales
- [x] Mensajes mejorados en placeholders
- [x] Mensaje amigable cuando no hay recomendaciones
- [ ] Usuario ejecuta SQL en Supabase
- [ ] Usuario prueba el flujo completo
- [ ] Admin agrega datos médicos a algunas plantas

---

## 🎯 Siguiente Paso

**AHORA:** Ejecuta el SQL actualizado en Supabase → `bd/user-medical-profile.sql`

**DESPUÉS:** 
1. Ejecuta `bd/add-medical-fields.sql`
2. Registra usuario de prueba
3. Completa wizard (prueba opción "Ninguna")
4. Agrega datos médicos a 2-3 plantas
5. Verifica que aparezcan en recomendaciones

¡Listo! 🚀
