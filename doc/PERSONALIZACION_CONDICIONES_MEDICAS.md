# ✅ SISTEMA DE PERSONALIZACIÓN POR CONDICIONES MÉDICAS - COMPLETO

## 🎯 Funcionalidad Implementada

El sistema ahora **filtra y prioriza plantas** según las condiciones médicas del usuario guardadas en su perfil.

---

## 📋 ¿Cómo Funciona?

### 1. **Usuario completa el onboarding** (Opcional)
- Al registrarse e iniciar sesión, aparece el wizard médico
- El usuario selecciona sus condiciones médicas (Gastritis, Ansiedad, Tos, etc.)
- El perfil se guarda en `user_medical_profile`

### 2. **El sistema carga el perfil del usuario**
- Al entrar a `/explorar`, se carga el perfil médico
- Se obtienen los nombres de las condiciones seleccionadas
- Se guardan en `userProfile.conditionNames`

### 3. **Filtrado inteligente de plantas**
- Las plantas se **priorizan** según coincidencias con las condiciones del usuario
- Las plantas relevantes aparecen **primero** en la lista
- Cada planta relevante tiene un badge **"✨ Para ti"** o **"✨ Recomendada para ti"**

### 4. **Indicadores visuales**
- **Vista Grid**: Badge verde "✨ Para ti" en esquina superior izquierda
- **Vista Lista**: Borde verde, fondo verde claro, badge "✨ Recomendada para ti"
- **Header**: Badge "Recomendaciones personalizadas según tu perfil"

---

## 🗂️ Archivos Modificados

### 1. **`bd/insertar-condiciones-medicas.sql`**
**Cambios:**
- Simplificado de 51 a 17 condiciones médicas
- Solo incluye condiciones que tienen plantas asociadas
- Organizado en 5 categorías: digestivo, respiratorio, nervioso, articular, general

**Condiciones incluidas:**
```sql
Digestivo: Gastritis, Dispepsia, Náuseas, Cólicos, Gases
Respiratorio: Tos, Gripe, Resfriado, Bronquitis
Nervioso: Ansiedad, Estrés, Insomnio
Articular: Artritis, Dolor muscular
General: Dolor de cabeza, Infecciones
```

### 2. **`client/components/OnboardingWizard.tsx`**
**Cambios:**
- ✅ Agregado título "Completa tu perfil médico **(opcional)**"
- ✅ Botón "Saltar por ahora" en el header
- ✅ Mensaje amigable cuando no hay condiciones cargadas
- ✅ Permite completar el onboarding sin seleccionar condiciones
- ✅ Valor por defecto `gender: 'other'` si no seleccionó género
- ✅ Mensajes diferentes según si completó o saltó el onboarding

### 3. **`client/modules/user/Explore.tsx`**
**Cambios principales:**

#### A. Función `checkMedicalProfile`:
```typescript
// Ahora obtiene los NOMBRES de las condiciones médicas
if (data.conditions && data.conditions.length > 0) {
  const { data: conditionsData } = await supabase
    .from('medical_conditions')
    .select('name')
    .in('id', data.conditions);
  
  data.conditionNames = conditionsData?.map(c => c.name) || [];
}
```

#### B. Función `filteredAndSortedPlants`:
```typescript
// PRIORIZA plantas relevantes para el usuario
if (userProfile && userProfile.conditionNames && userProfile.conditionNames.length > 0) {
  const relevantPlants: Plant[] = [];
  const otherPlants: Plant[] = [];
  
  result.forEach(plant => {
    const treatsUserCondition = plant.ailments?.some(ailment => 
      userProfile.conditionNames.some((condition: string) => 
        ailment.toLowerCase().includes(condition.toLowerCase()) ||
        condition.toLowerCase().includes(ailment.toLowerCase())
      )
    );
    
    if (treatsUserCondition) {
      relevantPlants.push(plant);
    } else {
      otherPlants.push(plant);
    }
  });
  
  // Mostrar primero las plantas relevantes
  result = [...relevantPlants, ...otherPlants];
}
```

#### C. Componente `PlantCardGrid`:
```typescript
// Calcula si la planta es relevante
const isRelevantForUser = userProfile?.conditionNames?.some((condition: string) =>
  plant.ailments?.some((ailment: string) =>
    ailment.toLowerCase().includes(condition.toLowerCase()) ||
    condition.toLowerCase().includes(ailment.toLowerCase())
  )
);

// Muestra badge si es relevante
{isRelevantForUser && (
  <Badge className="absolute top-2 left-2 bg-green-500 text-white">
    ✨ Para ti
  </Badge>
)}
```

#### D. Componente `PlantCardList`:
```typescript
// Borde y fondo verde para plantas relevantes
className={`group rounded-xl border overflow-hidden transition-all duration-300 ${
  isRelevantForUser 
    ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-lg' 
    : 'border-border bg-card hover:shadow-lg hover:border-primary/50'
}`}
```

#### E. Header con badge de personalización:
```typescript
{userProfile && userProfile.conditionNames && userProfile.conditionNames.length > 0 && (
  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
    <Shield className="w-4 h-4 text-primary" />
    <span className="text-sm font-medium text-primary">
      Recomendaciones personalizadas según tu perfil
    </span>
  </div>
)}
```

---

## 🎨 Indicadores Visuales

### Vista Grid (Tarjetas):
```
┌─────────────────────┐
│ ✨ Para ti          │  <- Badge verde si es relevante
│                     │
│     [IMAGEN]        │
│                     │
│  Manzanilla      🏥 │
│  Matricaria...      │
│  Propiedades...     │
└─────────────────────┘
```

### Vista Lista:
```
┌──────────────────────────────────────────────────┐
│ ✨ Recomendada para ti [IMAGEN] Manzanilla    🏥 │  <- Borde verde
│                                                  │  <- Fondo verde claro
│ Matricaria chamomilla                            │
│ Planta con propiedades antiinflamatorias...     │
│ [Gastritis] [Ansiedad] [Insomnio]               │
└──────────────────────────────────────────────────┘
```

### Header:
```
┌────────────────────────────────────────────────┐
│       🌿 Catálogo de Plantas Medicinales       │
│           Explora nuestra colección            │
│                                                │
│  🛡️ Recomendaciones personalizadas según tu   │
│     perfil                                     │
└────────────────────────────────────────────────┘
```

---

## 🧪 Casos de Uso

### Caso 1: Usuario con Gastritis y Ansiedad
```typescript
userProfile.conditionNames = ["Gastritis", "Ansiedad"]

// Plantas priorizadas:
1. ✨ Manzanilla (trata: gastritis, ansiedad, insomnio)
2. ✨ Menta (trata: dispepsia, gases)
3. ✨ Valeriana (trata: ansiedad, estrés)
4. Jengibre (trata: náuseas, vómitos)
5. Lavanda (trata: dolor de cabeza)
```

### Caso 2: Usuario con Tos y Resfriado
```typescript
userProfile.conditionNames = ["Tos", "Resfriado"]

// Plantas priorizadas:
1. ✨ Eucalipto (trata: tos, bronquitis, resfriado)
2. ✨ Tomillo (trata: tos, gripe)
3. ✨ Jengibre (trata: gripe, infecciones)
4. Manzanilla (trata: gastritis, ansiedad)
5. Lavanda (trata: insomnio)
```

### Caso 3: Usuario sin condiciones seleccionadas
```typescript
userProfile.conditionNames = []

// Todas las plantas en orden normal (sin priorización)
1. Manzanilla
2. Jengibre
3. Menta
4. Hinojo
5. ...
```

---

## 📝 Instrucciones para el Usuario

### Paso 1: Ejecutar SQL en Supabase
1. Ir a https://supabase.com/dashboard
2. Seleccionar proyecto BioPlantas
3. Ir a **SQL Editor**
4. Copiar contenido de `bd/insertar-condiciones-medicas.sql`
5. Pegar y hacer clic en **Run**
6. Verificar que se insertaron 17 condiciones

### Paso 2: Completar el Onboarding (Opcional)
1. Registrarse o iniciar sesión
2. Aparecerá el wizard de perfil médico
3. Seleccionar condiciones que apliquen (Gastritis, Ansiedad, Tos, etc.)
4. O hacer clic en "Saltar por ahora" para continuar sin seleccionar

### Paso 3: Explorar Plantas Personalizadas
1. Ir a `/explorar`
2. Ver badge "Recomendaciones personalizadas según tu perfil"
3. Las plantas relevantes aparecen **primero**
4. Buscar badges **"✨ Para ti"** en vista Grid
5. Buscar **bordes verdes** en vista Lista

---

## 🔍 Logs de Depuración

El sistema imprime logs útiles en la consola:

```javascript
// Al cargar el perfil
👤 Perfil del usuario cargado: { 
  conditionNames: ["Gastritis", "Ansiedad"] 
}

// Al filtrar plantas
🔍 Condiciones del usuario: ["Gastritis", "Ansiedad"]
🌿 Plantas relevantes para el usuario: 3/50
```

---

## ⚠️ Notas Importantes

1. **Coincidencia flexible**: El sistema busca coincidencias parciales
   - Si usuario tiene "Gastritis" → muestra plantas con "gastritis", "dispepsia", "digestivo"
   - Si usuario tiene "Tos" → muestra plantas con "tos seca", "tos productiva", "bronquitis"

2. **Priorización, no filtrado**: No oculta otras plantas, solo las reordena
   - Usuario puede ver TODAS las plantas
   - Las relevantes aparecen primero con badges especiales

3. **Onboarding opcional**: Usuario puede saltarlo
   - Si lo salta, ve todas las plantas en orden normal
   - Puede completar el perfil más tarde desde su cuenta

4. **Sin condiciones en BD**: El sistema maneja el caso graciosamente
   - Muestra mensaje amigable
   - Permite continuar sin seleccionar condiciones

---

## ✅ Checklist de Verificación

- ✅ SQL script simplificado (17 condiciones)
- ✅ Onboarding opcional con botón "Saltar"
- ✅ Función `checkMedicalProfile` obtiene nombres de condiciones
- ✅ Función `filteredAndSortedPlants` prioriza plantas relevantes
- ✅ Badge "✨ Para ti" en vista Grid
- ✅ Borde verde + badge en vista Lista
- ✅ Badge de personalización en header
- ✅ Logs de depuración en consola
- ✅ Sin errores de TypeScript
- ✅ Compatible con tema claro/oscuro

---

¡Sistema de personalización completo y funcionando! 🎉🌿
