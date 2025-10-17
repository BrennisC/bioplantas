# 🎯 MEJORA: ONBOARDING CON GÉNERO

## 📋 Problema Identificado

**Observación del usuario (100% correcta):**
> "Un hombre no puede estar embarazado, ¿no crees que primero debes preguntar si es mujer u hombre?"

### ❌ Problema Anterior
El wizard preguntaba a **todos los usuarios**:
- "¿Estás embarazada?" 
- "¿Estás en periodo de lactancia?"

Esto era **ilógico** para usuarios masculinos y generaba una mala experiencia.

---

## ✅ Solución Implementada

### 1. **Nuevo Paso 1: Selección de Género**

Ahora el wizard tiene **5 pasos** (antes 4):

```
Paso 1: ¿Cuál es tu género? 👩👨🧑
Paso 2: Condiciones médicas
Paso 3: Estado especial (embarazo/lactancia/niños) - Adaptado según género
Paso 4: Medicamentos y alergias
Paso 5: Resumen
```

### 2. **Opciones de Género**

El usuario elige entre:

| Opción | Icono | Descripción |
|--------|-------|-------------|
| **Mujer** | 👩 | Incluye preguntas sobre embarazo y lactancia |
| **Hombre** | 👨 | Recomendaciones adaptadas a fisiología masculina |
| **Otro / Prefiero no decir** | 🧑 | Recomendaciones generales sin preguntas específicas |

### 3. **Lógica Condicional en Paso 3**

**Si género = 'female' (Mujer):**
```tsx
✅ Mostrar: "¿Estás embarazada?"
✅ Mostrar: "¿Estás en periodo de lactancia?"
✅ Mostrar: "¿Tienes niños pequeños?"
```

**Si género = 'male' (Hombre) o 'other':**
```tsx
❌ NO mostrar: "¿Estás embarazada?"
❌ NO mostrar: "¿Estás en periodo de lactancia?"
✅ Mostrar: "¿Tienes niños pequeños?"
```

### 4. **Base de Datos Actualizada**

**Nueva columna agregada:**
```sql
ALTER TABLE user_medical_profile 
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other'));
```

**Guardado condicional:**
```typescript
{
  gender: gender,
  is_pregnant: gender === 'female' ? isPregnant : false, // Solo si es mujer
  is_lactating: gender === 'female' ? isLactating : false, // Solo si es mujer
  has_children: hasChildren // Para todos
}
```

---

## 🔧 Archivos Modificados

### ✅ Frontend
**`client/components/OnboardingWizard.tsx`** (568 líneas)

**Cambios principales:**

1. **Estado agregado (línea ~28):**
```typescript
const [gender, setGender] = useState<string>("");
```

2. **Nuevo Paso 1 (líneas 170-245):**
```tsx
{/* Step 1: Género */}
{step === 1 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Opción: Mujer */}
    <button onClick={() => setGender('female')}>
      <span className="text-4xl">👩</span>
      Mujer
    </button>
    
    {/* Opción: Hombre */}
    <button onClick={() => setGender('male')}>
      <span className="text-4xl">👨</span>
      Hombre
    </button>
    
    {/* Opción: Otro */}
    <button onClick={() => setGender('other')}>
      <span className="text-4xl">🧑</span>
      Otro / Prefiero no decir
    </button>
  </div>
)}
```

3. **Paso 3 con lógica condicional (líneas 320-395):**
```tsx
{/* Solo mostrar embarazo si es mujer */}
{gender === 'female' && (
  <button onClick={() => setIsPregnant(!isPregnant)}>
    ¿Estás embarazada?
  </button>
)}

{/* Solo mostrar lactancia si es mujer */}
{gender === 'female' && (
  <button onClick={() => setIsLactating(!isLactating)}>
    ¿Estás en periodo de lactancia?
  </button>
)}

{/* Mostrar para todos los géneros */}
<button onClick={() => setHasChildren(!hasChildren)}>
  ¿Tienes niños pequeños?
</button>
```

4. **Validación en nextStep (línea ~123):**
```typescript
const nextStep = () => {
  if (step === 1 && !gender) {
    toast({
      title: "Selecciona una opción",
      description: "Por favor indica tu género para continuar",
      variant: "destructive"
    });
    return;
  }
  setStep(prev => Math.min(prev + 1, 5)); // Ahora son 5 pasos
};
```

5. **Guardado condicional (línea ~90):**
```typescript
const { error } = await supabase
  .from('user_medical_profile')
  .upsert({
    user_id: userId,
    gender: gender, // ⬅️ NUEVO
    is_pregnant: gender === 'female' ? isPregnant : false,
    is_lactating: gender === 'female' ? isLactating : false,
    has_children: hasChildren
  });
```

6. **Header actualizado (línea ~154):**
```tsx
Paso {step} de 5 - Te ayudaremos a encontrar las plantas adecuadas para ti
```

7. **Footer actualizado (línea ~552):**
```tsx
{step < 5 ? ( // Antes era < 4
  <Button onClick={nextStep}>Siguiente</Button>
) : (
  <Button onClick={handleComplete}>Completar</Button>
)}
```

8. **Resumen con género (línea ~477):**
```tsx
{/* Step 5: Resumen */}
<div className="p-4 rounded-lg bg-muted/50">
  <h4 className="font-medium mb-2">Género:</h4>
  <Badge>
    {gender === 'female' ? '👩 Mujer' : 
     gender === 'male' ? '👨 Hombre' : 
     '🧑 Otro / Prefiero no decir'}
  </Badge>
</div>
```

### ✅ Base de Datos
**`bd/add-gender-column.sql`** (Nuevo archivo)

```sql
-- Agregar columna gender con validación
ALTER TABLE user_medical_profile 
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other'));
```

---

## 🚀 Pasos para Aplicar

### 1. **Ejecutar SQL en Supabase**

```bash
# Ve a Supabase → SQL Editor
# Ejecuta: bd/add-gender-column.sql
```

Esto agrega la columna `gender` a la tabla `user_medical_profile`.

### 2. **Verificar en la App**

1. **Cierra sesión** y vuelve a iniciar sesión (para resetear el onboarding)
2. **Completa el onboarding nuevamente**
3. Verás:
   - ✅ **Paso 1**: Selección de género (3 opciones)
   - ✅ **Paso 2**: Condiciones médicas
   - ✅ **Paso 3**: 
     - Si seleccionaste **Mujer** → Verás embarazo + lactancia + niños
     - Si seleccionaste **Hombre** → Solo verás niños
     - Si seleccionaste **Otro** → Solo verás niños
   - ✅ **Paso 4**: Medicamentos y alergias
   - ✅ **Paso 5**: Resumen (incluye el género seleccionado)

### 3. **Probar Filtrado**

**Escenario 1: Mujer embarazada**
```
1. Selecciona "Mujer" en Paso 1
2. Marca "Estoy embarazada" en Paso 3
3. En catálogo, click "Solo seguras para mí"
4. Solo verás plantas con safe_pregnancy = true
```

**Escenario 2: Hombre con niños**
```
1. Selecciona "Hombre" en Paso 1
2. NO verás opción de embarazo/lactancia ✅
3. Marca "Tengo niños pequeños" en Paso 3
4. En catálogo, click "Solo seguras para mí"
5. Solo verás plantas con safe_children = true
```

---

## 📊 Comparación Antes/Después

### ❌ Antes (4 pasos)
```
Paso 1: Condiciones médicas
Paso 2: ¿Estás embarazada? ← Pregunta a TODOS (incluso hombres) ❌
        ¿Estás lactando?    ← Pregunta a TODOS (incluso hombres) ❌
        ¿Tienes niños?
Paso 3: Medicamentos y alergias
Paso 4: Resumen
```

### ✅ Ahora (5 pasos)
```
Paso 1: ¿Cuál es tu género? 👩👨🧑 ← NUEVO
Paso 2: Condiciones médicas
Paso 3: ¿Estás embarazada?  ← Solo si género = mujer ✅
        ¿Estás lactando?     ← Solo si género = mujer ✅
        ¿Tienes niños?       ← Para todos
Paso 4: Medicamentos y alergias
Paso 5: Resumen (incluye género)
```

---

## 🎯 Beneficios

### 1. **Mejor UX**
- ✅ No hace preguntas irrelevantes
- ✅ Respeta la identidad del usuario
- ✅ Más profesional y coherente

### 2. **Datos Más Precisos**
- ✅ `is_pregnant` solo se guarda si `gender = 'female'`
- ✅ `is_lactating` solo se guarda si `gender = 'female'`
- ✅ Evita datos incoherentes en la BD

### 3. **Inclusividad**
- ✅ Opción "Otro / Prefiero no decir"
- ✅ Recomendaciones generales para quienes no se identifican con género binario

### 4. **Validación Mejorada**
- ✅ Obliga a seleccionar género antes de continuar
- ✅ Toast de error si intenta avanzar sin seleccionar

---

## 🧪 Testing

### Test 1: Usuario Mujer
```
✅ Paso 1: Seleccionar "Mujer"
✅ Paso 3: Ver opciones de embarazo, lactancia, niños
✅ Paso 5: Resumen muestra "👩 Mujer"
✅ BD: gender = 'female', is_pregnant = true/false, is_lactating = true/false
```

### Test 2: Usuario Hombre
```
✅ Paso 1: Seleccionar "Hombre"
✅ Paso 3: NO ver opciones de embarazo/lactancia
✅ Paso 3: Solo ver opción de niños
✅ Paso 5: Resumen muestra "👨 Hombre"
✅ BD: gender = 'male', is_pregnant = false, is_lactating = false
```

### Test 3: Usuario Otro
```
✅ Paso 1: Seleccionar "Otro / Prefiero no decir"
✅ Paso 3: NO ver opciones de embarazo/lactancia
✅ Paso 3: Solo ver opción de niños
✅ Paso 5: Resumen muestra "🧑 Otro / Prefiero no decir"
✅ BD: gender = 'other', is_pregnant = false, is_lactating = false
```

### Test 4: Validación
```
✅ Paso 1: No seleccionar género
✅ Click "Siguiente"
✅ Ver toast: "Por favor indica tu género para continuar"
✅ No avanza al Paso 2
```

---

## 📝 Notas Técnicas

### Tipos de Datos
```typescript
gender: 'male' | 'female' | 'other'
```

### Valores en BD
```sql
CHECK (gender IN ('male', 'female', 'other'))
```

### Guardado Condicional
```typescript
is_pregnant: gender === 'female' ? isPregnant : false
is_lactating: gender === 'female' ? isLactating : false
has_children: hasChildren // Sin condición, para todos
```

---

## 🎉 Resultado Final

**Sistema de onboarding inteligente que:**
- ✅ Pregunta género primero
- ✅ Adapta preguntas según el género seleccionado
- ✅ No hace preguntas biológicamente imposibles (embarazo a hombres)
- ✅ Es inclusivo (opción "Otro")
- ✅ Valida selección antes de continuar
- ✅ Guarda datos coherentes en la BD
- ✅ Mejora la experiencia del usuario

**¡Excelente observación del usuario que mejoró significativamente el sistema!** 🚀
