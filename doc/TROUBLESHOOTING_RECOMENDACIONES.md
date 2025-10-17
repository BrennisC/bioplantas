# 🔍 Troubleshooting: Error "No se pudieron cargar las recomendaciones"

## 🎯 Paso 1: Abrir la Consola del Navegador

1. Abre tu aplicación en el navegador
2. Presiona **F12** o clic derecho → **Inspeccionar**
3. Ve a la pestaña **Console**
4. Refresca la página `/explorar`
5. Busca estos mensajes:
   ```
   🔍 Fetching recommendations for user: [UUID]
   📊 RPC Response: { data: ..., error: ... }
   ❌ RPC Error: [detalles del error]
   ```

**Copia y pégame los mensajes que veas en la consola.**

---

## 🗄️ Paso 2: Ejecutar Script de Diagnóstico

1. Ve a **Supabase SQL Editor**
2. Copia y pega TODO el contenido de: `bd/diagnostico-sistema-medico.sql`
3. Ejecuta el script
4. **Toma captura de pantalla de los resultados** o cópiame los mensajes

El script verifica:
- ✅ Condiciones médicas insertadas
- ✅ Función existe
- ✅ Columnas médicas en tabla plants
- ✅ Tipo de dato de plants.id
- ✅ Políticas RLS

---

## 🔧 Paso 3: Verificaciones Manuales

### Verificar que ejecutaste ambos SQL

```sql
-- 1. ¿Existen las condiciones médicas?
SELECT COUNT(*) FROM medical_conditions;
-- Resultado esperado: ~28

-- 2. ¿Existe la función?
SELECT proname FROM pg_proc WHERE proname = 'get_recommended_plants_for_user';
-- Resultado esperado: 1 fila

-- 3. ¿Existen las columnas médicas en plants?
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'plants' 
AND column_name IN ('safe_pregnancy', 'safe_lactation', 'safe_children');
-- Resultado esperado: 3 filas
```

---

## 🐛 Posibles Causas y Soluciones

### Causa 1: No ejecutaste `add-medical-fields.sql`

**Síntoma:** Error menciona columnas que no existen (`safe_pregnancy`, etc.)

**Solución:**
```sql
-- Ejecuta en Supabase SQL Editor:
-- Copiar y pegar contenido completo de bd/add-medical-fields.sql
```

---

### Causa 2: El tipo de `plants.id` no coincide

**Síntoma:** Error de tipo de dato en la función

**Diagnóstico:**
```sql
SELECT data_type FROM information_schema.columns 
WHERE table_name = 'plants' AND column_name = 'id';
```

**Si retorna `uuid`**, necesitamos cambiar la función:

```sql
DROP FUNCTION IF EXISTS get_recommended_plants_for_user(UUID);

CREATE OR REPLACE FUNCTION get_recommended_plants_for_user(p_user_id UUID)
RETURNS TABLE (
  id UUID,  -- ⬅️ CAMBIAR A UUID
  common_name TEXT,
  scientific_name TEXT,
  image_url TEXT,
  relevance_score INTEGER,
  therapeutic_indications TEXT,
  safe_pregnancy BOOLEAN,
  safe_lactation BOOLEAN,
  safe_children BOOLEAN,
  evidence_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_profile AS (
    SELECT 
      COALESCE(conditions, '{}') as conditions, 
      COALESCE(is_pregnant, false) as is_pregnant, 
      COALESCE(is_lactating, false) as is_lactating, 
      COALESCE(has_children, false) as has_children
    FROM user_medical_profile
    WHERE user_id = p_user_id
  )
  SELECT 
    p.id::UUID,  -- ⬅️ CAST A UUID
    p.common_name,
    p.scientific_name,
    p.image_url,
    (
      CASE WHEN up.is_pregnant AND COALESCE(p.safe_pregnancy, false) THEN 10 ELSE 0 END +
      CASE WHEN up.is_lactating AND COALESCE(p.safe_lactation, false) THEN 10 ELSE 0 END +
      CASE WHEN up.has_children AND COALESCE(p.safe_children, false) THEN 10 ELSE 0 END +
      CASE WHEN p.therapeutic_indications IS NOT NULL THEN 5 ELSE 0 END
    )::INTEGER as relevance_score,
    p.therapeutic_indications,
    COALESCE(p.safe_pregnancy, false) as safe_pregnancy,
    COALESCE(p.safe_lactation, false) as safe_lactation,
    COALESCE(p.safe_children, false) as safe_children,
    p.evidence_level
  FROM plants p
  CROSS JOIN user_profile up
  WHERE 
    (NOT up.is_pregnant OR COALESCE(p.safe_pregnancy, true)) AND
    (NOT up.is_lactating OR COALESCE(p.safe_lactation, true)) AND
    (NOT up.has_children OR COALESCE(p.safe_children, true))
  ORDER BY relevance_score DESC, p.common_name
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Y actualizar el frontend:

```typescript
// client/components/RecommendedPlants.tsx
interface RecommendedPlant {
  id: string; // ⬅️ CAMBIAR A string si plants.id es UUID
  common_name: string;
  scientific_name: string;
  // ... resto de campos
}
```

---

### Causa 3: Usuario no tiene perfil médico

**Síntoma:** No aparece error pero tampoco plantas

**Diagnóstico:**
```sql
-- Reemplaza 'TU-USER-ID' con tu UUID real
SELECT * FROM user_medical_profile WHERE user_id = 'TU-USER-ID';
```

**Si no retorna nada:**
- El wizard no se ejecutó correctamente
- Verifica la consola del navegador en el paso del wizard

---

### Causa 4: No hay plantas en la base de datos

**Síntoma:** Función ejecuta pero retorna array vacío

**Diagnóstico:**
```sql
SELECT COUNT(*) FROM plants;
```

**Si retorna 0:**
- No hay plantas en tu base de datos
- Necesitas agregar plantas primero

---

### Causa 5: Políticas RLS bloquean el acceso

**Síntoma:** Error de permisos

**Diagnóstico:**
```sql
-- Ver políticas actuales
SELECT * FROM pg_policies WHERE tablename = 'plants';
```

**Solución temporal (solo para testing):**
```sql
-- SOLO PARA TESTING - Desactivar RLS temporalmente
ALTER TABLE plants DISABLE ROW LEVEL SECURITY;

-- Probar la función
SELECT * FROM get_recommended_plants_for_user(auth.uid());

-- Reactivar RLS
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
```

---

## 🧪 Prueba Manual Paso a Paso

### 1. Obtén tu User ID

```sql
-- En Supabase SQL Editor
SELECT auth.uid() as my_user_id;
```

Copia el UUID que aparece.

### 2. Verifica tu perfil médico

```sql
-- Reemplaza 'PEGA-TU-UUID-AQUI' con tu UUID
SELECT * FROM user_medical_profile WHERE user_id = 'PEGA-TU-UUID-AQUI';
```

**Si no retorna nada:**
- Ve a `/explorar` en tu app
- El wizard debe abrirse automáticamente
- Complétalo

### 3. Prueba la función manualmente

```sql
-- Reemplaza 'PEGA-TU-UUID-AQUI' con tu UUID
SELECT * FROM get_recommended_plants_for_user('PEGA-TU-UUID-AQUI');
```

**Resultados esperados:**
- ✅ Retorna filas → La función funciona, el problema es en el frontend
- ❌ Error → Hay un problema en la función SQL (cópiame el error)
- 📭 Sin filas → No hay plantas o no cumplen criterios

### 4. Si no hay plantas, agrega una de prueba

```sql
-- Agregar datos médicos a una planta existente
UPDATE plants 
SET 
  therapeutic_indications = 'Ayuda con problemas digestivos y ansiedad',
  safe_pregnancy = true,
  safe_lactation = true,
  safe_children = true,
  evidence_level = 'B'
WHERE id = (SELECT id FROM plants LIMIT 1);

-- Verificar
SELECT id, common_name, therapeutic_indications FROM plants LIMIT 1;

-- Probar función de nuevo
SELECT * FROM get_recommended_plants_for_user('PEGA-TU-UUID-AQUI');
```

---

## 📊 Checklist de Verificación

Marca cada paso que hayas completado:

- [ ] Ejecuté `bd/user-medical-profile.sql` completo
- [ ] Ejecuté `bd/add-medical-fields.sql` completo
- [ ] Ejecuté `bd/diagnostico-sistema-medico.sql` y revisé resultados
- [ ] Vi la consola del navegador (F12) y copié los errores
- [ ] Verifiqué que `medical_conditions` tiene ~28 filas
- [ ] Verifiqué que la función existe en pg_proc
- [ ] Verifiqué que `plants` tiene columnas `safe_pregnancy`, etc.
- [ ] Verifiqué el tipo de dato de `plants.id` (INTEGER o UUID)
- [ ] Probé la función manualmente con mi user_id
- [ ] Agregué datos médicos a al menos 1 planta

---

## 🆘 Si Nada Funciona

**Envíame esta información:**

1. **Resultado del diagnóstico:**
   ```sql
   -- Ejecuta esto y pégame el resultado
   SELECT COUNT(*) as condiciones FROM medical_conditions
   UNION ALL
   SELECT COUNT(*) as plantas FROM plants
   UNION ALL
   SELECT COUNT(*) as perfiles FROM user_medical_profile
   UNION ALL
   SELECT COUNT(*) as funciones FROM pg_proc WHERE proname = 'get_recommended_plants_for_user';
   ```

2. **Tipo de dato de plants.id:**
   ```sql
   SELECT data_type FROM information_schema.columns 
   WHERE table_name = 'plants' AND column_name = 'id';
   ```

3. **Mensajes de la consola del navegador** (F12 → Console)

4. **Error exacto de Supabase** al ejecutar:
   ```sql
   SELECT * FROM get_recommended_plants_for_user(auth.uid());
   ```

---

## ✅ Solución Rápida (Empezar de Cero)

Si quieres empezar limpio:

```sql
-- 1. Eliminar todo lo relacionado
DROP FUNCTION IF EXISTS get_recommended_plants_for_user(UUID);
DROP TABLE IF EXISTS user_medical_profile CASCADE;
DROP TABLE IF EXISTS medical_conditions CASCADE;

-- 2. Ejecutar de nuevo (en orden):
-- bd/user-medical-profile.sql
-- bd/add-medical-fields.sql

-- 3. Verificar
SELECT COUNT(*) FROM medical_conditions; -- Debe ser ~28
SELECT proname FROM pg_proc WHERE proname = 'get_recommended_plants_for_user'; -- Debe existir
```

---

**Una vez que identifiques el error exacto, puedo ayudarte a solucionarlo.** 🚀
