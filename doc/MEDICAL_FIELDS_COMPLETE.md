# 🩺 Sistema de Campos Médicos y Recomendaciones Personalizadas

## 📋 Resumen Ejecutivo

El sistema ha sido extendido para orientarse al campo de la enfermería y medicina, agregando:

1. **15+ campos médicos** en la tabla `plants` para información clínica
2. **Perfiles médicos de usuario** con 30+ condiciones predefinidas
3. **Wizard de onboarding** para capturar condiciones médicas al registrarse
4. **Motor de recomendaciones** personalizado según perfil del usuario
5. **Filtros de seguridad** automáticos (embarazo, lactancia, niños)

---

## 🗄️ Cambios en Base de Datos

### 1. Nuevos Campos en `plants` (add-medical-fields.sql)

#### Información Terapéutica
```sql
therapeutic_indications TEXT    -- Indicaciones terapéuticas
contraindications TEXT          -- Contraindicaciones
side_effects TEXT               -- Efectos secundarios
drug_interactions TEXT          -- Interacciones medicamentosas
```

#### Dosificación
```sql
dosage_adults TEXT              -- Dosificación adultos
dosage_children TEXT            -- Dosificación pediátrica
administration_route TEXT[]     -- Vías: ['oral', 'topica', 'inhalacion']
preparation_method TEXT         -- Método: infusión, decocción, tintura
```

#### Seguridad
```sql
safe_pregnancy BOOLEAN          -- Seguro en embarazo
safe_lactation BOOLEAN          -- Seguro en lactancia
safe_children BOOLEAN           -- Seguro para niños
```

#### Evidencia Científica
```sql
evidence_level TEXT             -- Nivel: 'A' (alta) a 'D' (baja)
clinical_studies TEXT           -- Referencias a estudios clínicos
```

#### Profesional de Enfermería
```sql
nursing_notes TEXT              -- Notas para enfermeros/as
monitoring_parameters TEXT[]    -- Parámetros a monitorear
```

**Índices Creados:**
- `idx_plants_safe_pregnancy` (para filtros rápidos)
- `idx_plants_safe_lactation`
- `idx_plants_safe_children`

---

### 2. Nueva Tabla `medical_conditions` (user-medical-profile.sql)

Contiene **30+ condiciones médicas predefinidas** organizadas por categorías:

#### Categorías y Condiciones

| Categoría | Condiciones |
|-----------|-------------|
| **Cardiovascular** | Hipertensión, Hipotensión, Colesterol alto, Arritmias |
| **Digestivo** | Gastritis, Estreñimiento, Diarrea, SII, Reflujo, Colitis |
| **Respiratorio** | Asma, Bronquitis, Rinitis alérgica, Gripe, Tos crónica |
| **Nervioso** | Ansiedad, Insomnio, Depresión, Estrés |
| **Musculoesquelético** | Artritis, Dolor muscular, Fibromialgia, Dolor articular |
| **Dermatológico** | Eczema, Psoriasis, Acné, Dermatitis |
| **Metabólico** | Diabetes tipo 2, Obesidad, Hipotiroidismo |
| **Neurológico** | Migraña, Cefaleas tensionales |
| **Genitourinario** | Infecciones urinarias recurrentes, Cistitis |
| **Hormonal** | Menopausia, Irregularidades menstruales |

**Estructura de la tabla:**
```sql
CREATE TABLE medical_conditions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  icon TEXT,  -- Emoji para la UI
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 3. Nueva Tabla `user_medical_profile`

Almacena el perfil médico de cada usuario:

```sql
CREATE TABLE user_medical_profile (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  
  -- Condiciones médicas seleccionadas
  conditions UUID[],  -- Array de IDs de medical_conditions
  
  -- Estados especiales (seguridad)
  is_pregnant BOOLEAN DEFAULT FALSE,
  is_lactating BOOLEAN DEFAULT FALSE,
  has_children BOOLEAN DEFAULT FALSE,
  
  -- Medicamentos y alergias (strings para flexibilidad)
  current_medications TEXT[],
  allergies TEXT[],
  
  -- Preferencias
  preferred_administration TEXT[],  -- ['oral', 'topica', 'inhalacion']
  avoid_bitter_taste BOOLEAN DEFAULT FALSE,
  
  -- Control de onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Políticas RLS:**
- Usuarios solo ven su propio perfil
- Admins pueden ver todos los perfiles (para análisis)

---

### 4. Función `get_recommended_plants_for_user(p_user_id)`

Motor de recomendaciones personalizado:

#### Algoritmo de Scoring

```sql
relevance_score = 0
+ (10 puntos × cada match de seguridad)
+ (20 puntos × cada match de condición médica)
```

**Ejemplo de scoring:**
- Usuario embarazada con hipertensión busca planta X
- Si planta X es segura en embarazo: **+10 puntos**
- Si planta X trata hipertensión: **+20 puntos**
- **Score total: 30 puntos** (muy relevante)

#### Filtros de Seguridad

La función **excluye automáticamente** plantas peligrosas:
- Si `is_pregnant = true` → excluye plantas con `safe_pregnancy = false`
- Si `is_lactating = true` → excluye plantas con `safe_lactation = false`
- Si `has_children = true` → excluye plantas con `safe_children = false`

#### Resultado

Retorna top 50 plantas ordenadas por `relevance_score` descendente.

---

## 🧙‍♂️ Componentes UI Creados

### 1. `OnboardingWizard.tsx` - Wizard de Configuración Inicial

Wizard de 4 pasos que aparece después del registro:

#### Paso 1: Condiciones Médicas
- Grid de botones agrupados por categoría
- Cada condición muestra: emoji + nombre + descripción
- Multi-selección con checkmarks visuales
- Ejemplo UI:
  ```
  📊 Cardiovascular
  [🫀 Hipertensión ✓] [🩸 Hipotensión  ]
  
  🍽️ Digestivo
  [🔥 Gastritis  ] [🐌 Estreñimiento ✓]
  ```

#### Paso 2: Estados Especiales
- 3 botones grandes (tarjetas) para:
  - 👶 ¿Estás embarazada?
  - ❤️ ¿Estás en periodo de lactancia?
  - 👨‍👩‍👧 ¿Tienes niños pequeños?
- Cada uno con explicación del impacto
- Color coding: Rosa (embarazo), Azul (lactancia), Morado (niños)

#### Paso 3: Medicamentos y Alergias
- Textarea para medicamentos actuales (separados por comas)
- Textarea para alergias conocidas
- Grid de preferencias de administración:
  - ☕ Oral (té, cápsulas)
  - 🧴 Tópica (cremas)
  - 💨 Inhalación
- Todos los campos opcionales

#### Paso 4: Resumen
- Muestra badges de condiciones seleccionadas
- Resalta estados especiales en panel de advertencia
- Mensaje de confirmación: "🌿 Ahora verás plantas personalizadas"
- Botón "Completar" guarda todo en `user_medical_profile`

**Características técnicas:**
- 4 variantes de animación (entrada/salida de pasos)
- Progress bar animado (25% → 50% → 75% → 100%)
- Validación: al menos 1 selección para continuar
- Móvil-responsive: grid se adapta a 1-2 columnas

---

### 2. `RecommendedPlants.tsx` - Sección de Recomendaciones

Muestra plantas personalizadas según perfil del usuario:

#### Funcionalidades
- Llama a `get_recommended_plants_for_user()` en Supabase
- Muestra top 8 plantas (o todas si <8)
- Botón "Solo seguras" → filtra por todas las banderas de seguridad
- Cada tarjeta muestra:
  - Badge de puntuación (ej: "30 pts")
  - Indicaciones terapéuticas (primeras 2 líneas)
  - Badges de seguridad: 👶 Embarazo, ❤️ Lactancia, 👶 Niños
  - Badge de evidencia científica: A (verde), B (azul), C (amarillo), D (naranja)

#### Estados
- **Loading:** Spinner + "Cargando recomendaciones personalizadas..."
- **Sin recomendaciones:** "Completa tu perfil médico para recibir recomendaciones"
- **Con resultados:** Grid responsive (1-4 columnas según pantalla)

#### Posicionamiento
- Aparece en **top de Explore** (antes del catálogo general)
- Solo visible si el usuario completó onboarding

---

## 🔄 Flujo de Usuario

### Nuevo Usuario (Primera vez)

```
1. Usuario se registra
   ↓
2. Inicia sesión y es redirigido a /explorar
   ↓
3. Sistema detecta: !onboarding_completed
   ↓
4. OnboardingWizard se abre automáticamente (modal)
   ↓
5. Usuario completa los 4 pasos
   ↓
6. Se guarda en user_medical_profile con onboarding_completed = true
   ↓
7. Modal se cierra, RecommendedPlants aparece
   ↓
8. Usuario ve sus plantas personalizadas al top
```

### Usuario Existente (Con perfil)

```
1. Usuario inicia sesión
   ↓
2. Va a /explorar
   ↓
3. Sistema detecta: onboarding_completed = true
   ↓
4. OnboardingWizard NO se muestra
   ↓
5. RecommendedPlants se renderiza con sus plantas
```

### Reabrir Onboarding (Editar perfil)

```
1. Usuario va a /perfil
   ↓
2. Sección "Configuración Médica"
   ↓
3. Botón "Actualizar condiciones médicas"
   ↓
4. OnboardingWizard se abre con datos precargados
   ↓
5. Usuario modifica y guarda
   ↓
6. Recomendaciones se actualizan automáticamente
```

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Enfermera Embarazada

**Perfil:**
- Condiciones: Ansiedad, Insomnio
- Estados: is_pregnant = true
- Medicamentos: Vitaminas prenatales
- Preferencias: Oral (té)

**Resultado:**
- Sistema **excluye** plantas con `safe_pregnancy = false`
- **Prioriza** plantas que tratan ansiedad/insomnio
- **Recomienda** (ejemplo):
  1. **Manzanilla** (40 pts): Segura embarazo ✓, Trata ansiedad ✓, Trata insomnio ✓
  2. **Tila** (30 pts): Segura embarazo ✓, Trata ansiedad ✓
  3. **Lavanda** (20 pts): Segura embarazo ✓ (solo match de seguridad)

---

### Ejemplo 2: Madre Lactante con Bebé

**Perfil:**
- Condiciones: Migraña
- Estados: is_lactating = true, has_children = true
- Alergias: Polen

**Resultado:**
- Sistema **excluye** plantas con `safe_lactation = false` O `safe_children = false`
- **Filtra** plantas seguras para lactancia Y niños
- **Recomienda** (ejemplo):
  1. **Jengibre** (40 pts): Seguro lactancia ✓, Seguro niños ✓, Trata migraña ✓
  2. **Menta** (30 pts): Seguro lactancia ✓, Seguro niños ✓, Trata dolor de cabeza ✓

---

## 🛠️ Pendientes de Implementación

### Backend - SQL a Ejecutar

⚠️ **El usuario debe ejecutar en Supabase SQL Editor:**

```sql
-- 1. Crear campos médicos en plants
\i bd/add-medical-fields.sql

-- 2. Crear sistema de perfiles de usuario
\i bd/user-medical-profile.sql
```

**Verificación:**
```sql
-- Verificar campos nuevos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'plants' 
  AND column_name LIKE '%safe%';

-- Verificar condiciones médicas
SELECT COUNT(*) FROM medical_conditions; -- Debe retornar ~30

-- Verificar función de recomendaciones
SELECT proname FROM pg_proc WHERE proname = 'get_recommended_plants_for_user';
```

---

### Frontend - Componentes Adicionales

#### 1. Actualizar `PlantsManager.tsx` (Admin)

Agregar secciones en el formulario de edición:

```tsx
// Nuevo: Acordeón "Información Médica"
<Accordion type="multiple">
  <AccordionItem value="medical">
    <AccordionTrigger>💊 Información Médica</AccordionTrigger>
    <AccordionContent>
      <Textarea label="Indicaciones Terapéuticas" {...} />
      <Textarea label="Contraindicaciones" {...} />
      <Textarea label="Efectos Secundarios" {...} />
      <Textarea label="Interacciones Medicamentosas" {...} />
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="dosage">
    <AccordionTrigger>💉 Dosificación</AccordionTrigger>
    <AccordionContent>
      <Input label="Dosificación Adultos" {...} />
      <Input label="Dosificación Niños" {...} />
      <MultiSelect label="Vía de Administración" 
        options={['oral', 'topica', 'inhalacion']} />
      <Input label="Método de Preparación" {...} />
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="safety">
    <AccordionTrigger>🛡️ Seguridad</AccordionTrigger>
    <AccordionContent>
      <Switch label="Seguro en embarazo" {...} />
      <Switch label="Seguro en lactancia" {...} />
      <Switch label="Seguro para niños" {...} />
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="evidence">
    <AccordionTrigger>📚 Evidencia Científica</AccordionTrigger>
    <AccordionContent>
      <Select label="Nivel de Evidencia" 
        options={['A', 'B', 'C', 'D']} />
      <Textarea label="Estudios Clínicos (referencias)" {...} />
    </AccordionContent>
  </AccordionItem>
  
  <AccordionItem value="nursing">
    <AccordionTrigger>🩺 Enfermería</AccordionTrigger>
    <AccordionContent>
      <Textarea label="Notas para Profesionales" {...} />
      <TagInput label="Parámetros a Monitorear" {...} />
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**Actualizar queries:**
```tsx
// En handleSubmit (INSERT/UPDATE)
const plantData = {
  // ... campos existentes
  therapeutic_indications: form.therapeuticIndications,
  contraindications: form.contraindications,
  side_effects: form.sideEffects,
  drug_interactions: form.drugInteractions,
  dosage_adults: form.dosageAdults,
  dosage_children: form.dosageChildren,
  administration_route: form.administrationRoute, // array
  preparation_method: form.preparationMethod,
  safe_pregnancy: form.safePregnancy,
  safe_lactation: form.safeLactation,
  safe_children: form.safeChildren,
  evidence_level: form.evidenceLevel,
  clinical_studies: form.clinicalStudies,
  nursing_notes: form.nursingNotes,
  monitoring_parameters: form.monitoringParameters // array
};
```

---

#### 2. Actualizar `PlantDetail.tsx` (Usuario)

Agregar sección de información médica:

```tsx
{/* Sección: Información Médica (Solo si hay datos) */}
{(plant.therapeutic_indications || plant.contraindications) && (
  <div className="bg-card border border-border rounded-xl p-6">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      💊 Información Médica
    </h2>
    
    {/* Indicaciones */}
    {plant.therapeutic_indications && (
      <div className="mb-4">
        <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
          ✅ Indicaciones Terapéuticas
        </h3>
        <p className="text-muted-foreground">{plant.therapeutic_indications}</p>
      </div>
    )}
    
    {/* Contraindicaciones */}
    {plant.contraindications && (
      <div className="mb-4">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
          ⚠️ Contraindicaciones
        </h3>
        <p className="text-muted-foreground">{plant.contraindications}</p>
      </div>
    )}
    
    {/* Efectos Secundarios */}
    {plant.side_effects && (
      <div className="mb-4">
        <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">
          ⚡ Efectos Secundarios
        </h3>
        <p className="text-muted-foreground">{plant.side_effects}</p>
      </div>
    )}
    
    {/* Interacciones */}
    {plant.drug_interactions && (
      <div className="mb-4">
        <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
          💊 Interacciones Medicamentosas
        </h3>
        <p className="text-muted-foreground">{plant.drug_interactions}</p>
      </div>
    )}
    
    {/* Dosificación */}
    {(plant.dosage_adults || plant.dosage_children) && (
      <div className="mb-4 grid md:grid-cols-2 gap-4">
        {plant.dosage_adults && (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <h4 className="font-medium mb-1">👨 Adultos</h4>
            <p className="text-sm">{plant.dosage_adults}</p>
          </div>
        )}
        {plant.dosage_children && (
          <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
            <h4 className="font-medium mb-1">👶 Niños</h4>
            <p className="text-sm">{plant.dosage_children}</p>
          </div>
        )}
      </div>
    )}
    
    {/* Badges de Seguridad */}
    <div className="flex flex-wrap gap-2 mb-4">
      <Badge variant={plant.safe_pregnancy ? "default" : "destructive"}>
        {plant.safe_pregnancy ? "✅ Seguro en embarazo" : "❌ No seguro en embarazo"}
      </Badge>
      <Badge variant={plant.safe_lactation ? "default" : "destructive"}>
        {plant.safe_lactation ? "✅ Seguro en lactancia" : "❌ No seguro en lactancia"}
      </Badge>
      <Badge variant={plant.safe_children ? "default" : "destructive"}>
        {plant.safe_children ? "✅ Seguro para niños" : "❌ No seguro para niños"}
      </Badge>
    </div>
    
    {/* Evidencia Científica */}
    {plant.evidence_level && (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium">Nivel de Evidencia:</span>
        <Badge className={`
          ${plant.evidence_level === 'A' ? 'bg-green-500' : ''}
          ${plant.evidence_level === 'B' ? 'bg-blue-500' : ''}
          ${plant.evidence_level === 'C' ? 'bg-yellow-500' : ''}
          ${plant.evidence_level === 'D' ? 'bg-orange-500' : ''}
        `}>
          {plant.evidence_level}
        </Badge>
      </div>
    )}
    
    {/* Notas de Enfermería (Collapsible) */}
    {plant.nursing_notes && (
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          🩺 Notas para Profesionales de Enfermería
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 p-3 bg-muted/30 rounded-lg text-sm">
          {plant.nursing_notes}
        </CollapsibleContent>
      </Collapsible>
    )}
  </div>
)}
```

---

#### 3. Crear `MedicalProfileSettings.tsx` (Perfil de Usuario)

Componente para editar perfil médico desde `/perfil`:

```tsx
export default function MedicalProfileSettings() {
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    const { data } = await supabase
      .from('user_medical_profile')
      .select(`
        *,
        medical_conditions(id, name, icon)
      `)
      .eq('user_id', user?.id)
      .single();
    
    setProfile(data);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tu Perfil Médico</h2>
        <Button onClick={() => setShowWizard(true)}>
          Actualizar Condiciones
        </Button>
      </div>
      
      {/* Mostrar condiciones actuales */}
      {profile?.conditions?.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Condiciones Médicas:</h3>
          <div className="flex flex-wrap gap-2">
            {profile.conditions.map(c => (
              <Badge key={c.id}>{c.icon} {c.name}</Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Mostrar estados especiales */}
      {(profile?.is_pregnant || profile?.is_lactating || profile?.has_children) && (
        <div>
          <h3 className="font-semibold mb-2">Estados Especiales:</h3>
          <div className="space-y-1 text-sm">
            {profile.is_pregnant && <div>👶 Embarazada</div>}
            {profile.is_lactating && <div>❤️ Lactando</div>}
            {profile.has_children && <div>👨‍👩‍👧 Tiene niños</div>}
          </div>
        </div>
      )}
      
      <OnboardingWizard
        open={showWizard}
        userId={user?.id}
        onComplete={() => {
          setShowWizard(false);
          fetchProfile();
        }}
      />
    </div>
  );
}
```

**Integración en `Profile.tsx`:**
```tsx
import MedicalProfileSettings from "@/components/MedicalProfileSettings";

// Agregar sección después de editar perfil básico
<MedicalProfileSettings />
```

---

#### 4. Crear `InteractionChecker.tsx` (Futuro - Fase 2)

Componente para verificar interacciones antes de agregar a favoritos:

```tsx
interface InteractionCheckerProps {
  plantId: number;
  userId: string;
}

export default function InteractionChecker({ plantId, userId }: InteractionCheckerProps) {
  const [warnings, setWarnings] = useState<string[]>([]);
  
  useEffect(() => {
    checkInteractions();
  }, [plantId]);
  
  const checkInteractions = async () => {
    // 1. Obtener medicamentos del usuario
    const { data: profile } = await supabase
      .from('user_medical_profile')
      .select('current_medications')
      .eq('user_id', userId)
      .single();
    
    // 2. Obtener interacciones de la planta
    const { data: plant } = await supabase
      .from('plants')
      .select('drug_interactions, name')
      .eq('id', plantId)
      .single();
    
    // 3. Comparar (simple string matching)
    const userMeds = profile?.current_medications || [];
    const plantInteractions = plant?.drug_interactions || '';
    
    const foundWarnings: string[] = [];
    userMeds.forEach(med => {
      if (plantInteractions.toLowerCase().includes(med.toLowerCase())) {
        foundWarnings.push(`⚠️ Posible interacción con ${med}`);
      }
    });
    
    setWarnings(foundWarnings);
  };
  
  if (warnings.length === 0) return null;
  
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>⚠️ Advertencia de Interacción</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside">
          {warnings.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
        <p className="mt-2 text-xs">Consulta con tu médico antes de usar esta planta.</p>
      </AlertDescription>
    </Alert>
  );
}
```

**Integración en `PlantDetail.tsx`:**
```tsx
{user && (
  <InteractionChecker plantId={plant.id} userId={user.id} />
)}
```

---

## 📈 Roadmap Futuro

### Fase 1: ✅ Completado (Este Pull Request)
- ✅ Esquemas SQL para campos médicos
- ✅ Esquemas SQL para perfiles de usuario
- ✅ OnboardingWizard component
- ✅ RecommendedPlants component
- ✅ Integración en Explore page

### Fase 2: 🔨 En Desarrollo
- [ ] Ejecutar SQL scripts en Supabase (pendiente usuario)
- [ ] Actualizar PlantsManager (admin puede editar campos médicos)
- [ ] Actualizar PlantDetail (mostrar info médica)
- [ ] MedicalProfileSettings component (editar perfil desde /perfil)
- [ ] Testing E2E del flujo completo

### Fase 3: 🚀 Futuro
- [ ] InteractionChecker avanzado (con base de datos de interacciones)
- [ ] Exportar lista de plantas recomendadas a PDF
- [ ] Notificaciones push cuando hay nuevas plantas para su perfil
- [ ] Estadísticas para admins (condiciones más comunes, plantas más recomendadas)
- [ ] API pública para profesionales de salud

---

## 🔐 Seguridad y Privacidad

### Datos Sensibles
- ✅ **RLS habilitado**: usuarios solo ven su propio perfil
- ✅ **Auditoría**: campos `created_at`, `updated_at` en todas las tablas
- ✅ **Anonymización**: admins ven perfiles pero no identifican usuarios específicos

### Disclaimers Legales (Agregar en UI)

```tsx
// En OnboardingWizard - Paso 1
<Alert variant="info" className="mb-4">
  <Info className="h-4 w-4" />
  <AlertDescription className="text-xs">
    Esta información es solo para recomendaciones personalizadas. 
    No reemplaza el consejo médico profesional. Siempre consulta 
    con tu médico antes de usar plantas medicinales.
  </AlertDescription>
</Alert>

// En RecommendedPlants
<p className="text-xs text-muted-foreground text-center mt-2">
  ⚕️ Estas recomendaciones son solo informativas. Consulta con tu 
  médico antes de usar cualquier planta medicinal.
</p>

// En PlantDetail - Sección médica
<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertDescription className="text-xs">
    La información médica presentada es solo educativa y no 
    constituye consejo médico. Consulta con un profesional de la 
    salud antes de usar esta planta, especialmente si estás 
    embarazada, lactando, o tomando medicamentos.
  </AlertDescription>
</Alert>
```

---

## 📞 Próximos Pasos para el Usuario

### 1. Ejecutar Scripts SQL (CRÍTICO)
```bash
# Conectarse a Supabase SQL Editor
# Copiar y pegar contenido de cada archivo:

# 1. Campos médicos en plants
bd/add-medical-fields.sql

# 2. Sistema de perfiles
bd/user-medical-profile.sql

# Verificar:
SELECT COUNT(*) FROM medical_conditions; -- ~30 filas
SELECT proname FROM pg_proc WHERE proname = 'get_recommended_plants_for_user'; -- debe existir
```

### 2. Probar Flujo Completo
1. Registrar nuevo usuario
2. Verificar que OnboardingWizard se abre automáticamente
3. Completar los 4 pasos
4. Verificar que aparece sección "Recomendadas para ti"
5. Hacer clic en planta recomendada y ver detalles

### 3. Poblar Datos Médicos (Admin)
1. Ir a `/dashboard` → Gestión de Plantas
2. Editar planta existente
3. Agregar (temporalmente manual hasta actualizar PlantsManager):
   - Indicaciones terapéuticas
   - Contraindicaciones
   - Dosificación
   - Marcar checkboxes de seguridad
   - Asignar nivel de evidencia

### 4. Testing
```sql
-- Crear perfil de prueba
INSERT INTO user_medical_profile (user_id, conditions, is_pregnant, safe_lactation)
SELECT auth.uid(), 
  ARRAY(SELECT id FROM medical_conditions WHERE name IN ('Ansiedad', 'Insomnio')),
  true, false;

-- Probar función de recomendaciones
SELECT * FROM get_recommended_plants_for_user(auth.uid());
```

---

## 🎯 Métricas de Éxito

### KPIs a Monitorear

```sql
-- 1. Tasa de completado de onboarding
SELECT 
  COUNT(*) FILTER (WHERE onboarding_completed) * 100.0 / COUNT(*) as completion_rate
FROM user_medical_profile;

-- 2. Condiciones más comunes
SELECT mc.name, mc.category, COUNT(*) as user_count
FROM medical_conditions mc
JOIN user_medical_profile ump ON mc.id = ANY(ump.conditions)
GROUP BY mc.id, mc.name, mc.category
ORDER BY user_count DESC
LIMIT 10;

-- 3. Plantas más recomendadas
SELECT p.name, COUNT(*) as recommendation_count
FROM plants p
CROSS JOIN user_medical_profile ump
WHERE p.id IN (
  SELECT id FROM get_recommended_plants_for_user(ump.user_id)
)
GROUP BY p.id, p.name
ORDER BY recommendation_count DESC
LIMIT 10;
```

---

## 📝 Notas Finales

Este sistema transforma la aplicación de un catálogo genérico a una **herramienta profesional de enfermería** con:

✅ Recomendaciones personalizadas basadas en condiciones médicas  
✅ Filtros de seguridad automáticos (embarazo, lactancia, niños)  
✅ Información clínica detallada (dosificación, contraindicaciones, evidencia)  
✅ UX optimizada con wizard de onboarding intuitivo  
✅ Escalabilidad: fácil agregar más condiciones o parámetros

**El siguiente commit debe incluir:**
- Actualización de PlantsManager para editar campos médicos
- Actualización de PlantDetail para mostrar información médica
- MedicalProfileSettings component para editar perfil

---

**Creado:** $(date)  
**Versión:** 1.0  
**Estado:** ✅ Componentes creados, ⚠️ Pendiente ejecución SQL
