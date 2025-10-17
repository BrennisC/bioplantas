# 🩺 Sistema Médico - Guía Rápida

## ✅ Lo que ya está creado

### Archivos SQL (en carpeta `bd/`)
1. **`add-medical-fields.sql`** - Agrega 15+ campos médicos a tabla `plants`
2. **`user-medical-profile.sql`** - Crea perfiles de usuario con 30+ condiciones médicas

### Componentes UI (en `client/components/`)
1. **`OnboardingWizard.tsx`** - Wizard de 4 pasos para capturar perfil médico
2. **`RecommendedPlants.tsx`** - Muestra plantas personalizadas según perfil

### Integraciones
- ✅ `Explore.tsx` actualizado - muestra OnboardingWizard y RecommendedPlants
- ✅ Detección automática de perfil incompleto

---

## ⚠️ EJECUTAR PRIMERO (En Supabase SQL Editor)

```sql
-- 1. Agregar campos médicos a plants
\i bd/add-medical-fields.sql

-- 2. Crear sistema de perfiles de usuario
\i bd/user-medical-profile.sql

-- 3. Verificar
SELECT COUNT(*) FROM medical_conditions; -- debe retornar ~30
```

---

## 🧪 Probar el Sistema

### Como Usuario Nuevo
1. Registrarse en `/register`
2. Iniciar sesión
3. Ir a `/explorar`
4. **Wizard aparece automáticamente** ✨
5. Completar 4 pasos:
   - Paso 1: Seleccionar condiciones médicas
   - Paso 2: Marcar estados especiales (embarazo, lactancia, niños)
   - Paso 3: Ingresar medicamentos y alergias (opcional)
   - Paso 4: Revisar y confirmar
6. Wizard se cierra → **Sección "Recomendadas para ti" aparece**

### Como Admin
1. Ir a `/dashboard` → Gestión de Plantas
2. Editar una planta
3. **Temporalmente** agregar datos médicos directo en Supabase:
```sql
UPDATE plants 
SET 
  therapeutic_indications = 'Trata ansiedad, insomnio, dolor de estómago',
  contraindications = 'Evitar en caso de alergia a la familia de las margaritas',
  side_effects = 'Puede causar somnolencia en dosis altas',
  dosage_adults = '1-2 tazas de té al día',
  dosage_children = '1/2 taza al día (mayores de 6 años)',
  safe_pregnancy = true,
  safe_lactation = true,
  safe_children = true,
  evidence_level = 'B'
WHERE id = 1;
```

---

## 📊 Campos Médicos Agregados a `plants`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `therapeutic_indications` | TEXT | Para qué sirve la planta |
| `contraindications` | TEXT | Cuándo NO usarla |
| `side_effects` | TEXT | Efectos secundarios |
| `drug_interactions` | TEXT | Interacciones con medicamentos |
| `dosage_adults` | TEXT | Dosis para adultos |
| `dosage_children` | TEXT | Dosis pediátrica |
| `administration_route` | TEXT[] | oral, topica, inhalacion |
| `preparation_method` | TEXT | infusión, decocción, tintura |
| `safe_pregnancy` | BOOLEAN | ✅ Seguro en embarazo |
| `safe_lactation` | BOOLEAN | ✅ Seguro en lactancia |
| `safe_children` | BOOLEAN | ✅ Seguro para niños |
| `evidence_level` | TEXT | A, B, C, D (nivel de evidencia) |
| `clinical_studies` | TEXT | Referencias científicas |
| `nursing_notes` | TEXT | Notas para enfermeros/as |
| `monitoring_parameters` | TEXT[] | Qué monitorear en el paciente |

---

## 🎯 Cómo Funciona el Motor de Recomendaciones

### Algoritmo de Scoring
```
Puntuación = 0
+ (10 puntos × cada match de seguridad)
+ (20 puntos × cada match de condición médica)
```

### Ejemplo
**Usuario embarazada con ansiedad:**
- Planta "Manzanilla":
  - `safe_pregnancy = true` → **+10 pts**
  - Trata "ansiedad" en `therapeutic_indications` → **+20 pts**
  - **Total: 30 puntos** (muy recomendada)

### Filtros Automáticos
- Si usuario está embarazada → **excluye** plantas con `safe_pregnancy = false`
- Si está lactando → **excluye** plantas con `safe_lactation = false`
- Si tiene niños → **excluye** plantas con `safe_children = false`

---

## 🛠️ Pendiente de Implementar

### Alta Prioridad
- [ ] **Actualizar `PlantsManager.tsx`** (admin puede editar campos médicos)
  - Agregar acordeón con secciones: Médica, Dosificación, Seguridad, Evidencia, Enfermería
  - Actualizar queries INSERT/UPDATE para incluir nuevos campos

- [ ] **Actualizar `PlantDetail.tsx`** (usuarios ven info médica)
  - Agregar sección "Información Médica"
  - Mostrar badges de seguridad
  - Mostrar dosificación adultos/niños
  - Disclaimer legal

- [ ] **Crear `MedicalProfileSettings.tsx`** (editar perfil desde `/perfil`)
  - Mostrar condiciones actuales
  - Botón "Actualizar" que abre OnboardingWizard con datos precargados

### Media Prioridad
- [ ] **InteractionChecker component** (advertir interacciones)
  - Comparar medicamentos del usuario con `drug_interactions` de la planta
  - Mostrar alert antes de agregar a favoritos

### Baja Prioridad
- [ ] Exportar recomendaciones a PDF
- [ ] Estadísticas para admins (condiciones más comunes)
- [ ] API pública para profesionales de salud

---

## 🔍 Queries Útiles

### Ver perfiles de usuario
```sql
SELECT 
  u.email,
  ump.onboarding_completed,
  ump.is_pregnant,
  ump.is_lactating,
  ump.has_children,
  array_length(ump.conditions, 1) as condition_count
FROM user_medical_profile ump
JOIN auth.users u ON u.id = ump.user_id;
```

### Condiciones más comunes
```sql
SELECT mc.name, mc.category, COUNT(*) as users
FROM medical_conditions mc
JOIN user_medical_profile ump ON mc.id = ANY(ump.conditions)
GROUP BY mc.id
ORDER BY users DESC;
```

### Probar recomendaciones para un usuario
```sql
-- Reemplazar 'user-uuid-here' con ID real
SELECT * FROM get_recommended_plants_for_user('user-uuid-here');
```

---

## 📁 Estructura de Archivos Nuevos

```
cosmos-haven/
├── bd/
│   ├── add-medical-fields.sql           ✅ Nuevo
│   └── user-medical-profile.sql         ✅ Nuevo
├── client/
│   └── components/
│       ├── OnboardingWizard.tsx         ✅ Nuevo
│       └── RecommendedPlants.tsx        ✅ Nuevo
├── client/modules/user/
│   └── Explore.tsx                      ✏️ Actualizado
└── doc/
    ├── MEDICAL_FIELDS_COMPLETE.md       ✅ Nuevo (documentación completa)
    └── MEDICAL_QUICK_START.md           ✅ Nuevo (esta guía)
```

---

## 🚀 Siguiente Sesión de Trabajo

### 1. Usuario ejecuta SQL
```bash
# En Supabase SQL Editor:
bd/add-medical-fields.sql
bd/user-medical-profile.sql
```

### 2. Actualizar PlantsManager
```bash
# Agregar secciones de edición de campos médicos
# Ver ejemplo completo en MEDICAL_FIELDS_COMPLETE.md
```

### 3. Actualizar PlantDetail
```bash
# Mostrar información médica
# Ver ejemplo completo en MEDICAL_FIELDS_COMPLETE.md
```

### 4. Testing
1. Registrar usuario de prueba
2. Completar onboarding wizard
3. Ver plantas recomendadas
4. Editar planta como admin (agregar datos médicos)
5. Verificar que aparece en recomendaciones

---

## 📞 Contacto / Dudas

Para más detalles ver: **`doc/MEDICAL_FIELDS_COMPLETE.md`** (documentación completa con ejemplos de código)

**Estado actual:**
- ✅ Base de datos diseñada
- ✅ Componentes UI creados
- ✅ Integración en Explore
- ⚠️ Pendiente: Ejecutar SQL
- ⚠️ Pendiente: Actualizar admin panel
- ⚠️ Pendiente: Actualizar página de detalle
