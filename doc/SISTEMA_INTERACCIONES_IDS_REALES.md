# 🔗 SISTEMA DE INTERACCIONES CON IDs REALES
## BioPlantes - Integración Plantas-Medicamentos

**Fecha:** 3 de Noviembre, 2025  
**Estado:** ✅ Actualizado para usar IDs de base de datos real

---

## 🎯 CAMBIO IMPORTANTE

El sistema ahora usa **IDs reales** de las plantas y medicamentos que ya existen en tu base de datos, en lugar de nombres genéricos.

---

## 📊 CÓMO FUNCIONAN LAS INTERACCIONES

### 1. Estructura de la Tabla `medication_plant_interactions`

```sql
CREATE TABLE medication_plant_interactions (
  id UUID PRIMARY KEY,
  medication_id UUID REFERENCES medications(id),  -- ✅ FK a medicamentos
  medication_name TEXT,                            -- Para búsquedas rápidas
  plant_id UUID REFERENCES plants(id),             -- ✅ FK a plantas
  plant_name TEXT,                                  -- Para búsquedas rápidas
  severity TEXT (GRAVE/MODERADA/LEVE),
  ...
);
```

**Ventajas de usar IDs:**
- ✅ Integridad referencial (Foreign Keys)
- ✅ Si cambias nombre de planta, interacciones se mantienen
- ✅ Queries más eficientes con índices
- ✅ Relaciones CASCADE (si borras planta, se borran sus interacciones)

---

## 🌿 PLANTAS DISPONIBLES EN TU BD

Según `50-plantas-completas.sql`, tienes estas plantas (las más usadas en interacciones):

| # | Nombre | Nombre Científico | Uso Principal |
|---|--------|-------------------|---------------|
| 1 | Manzanilla | Matricaria chamomilla | Gastritis, ansiedad |
| 2 | Jengibre | Zingiber officinale | Náuseas, inflamación |
| 9 | Cúrcuma | Curcuma longa | Inflamación crónica |
| 10 | Regaliz | Glycyrrhiza glabra | Úlcera, gastritis |
| 12 | Valeriana | Valeriana officinalis | Insomnio, ansiedad |
| 17 | Ajo | Allium sativum | Colesterol, hipertensión |

---

## 💊 INTERACCIONES IMPLEMENTADAS

### Interacciones GRAVES (EVITAR)

**1. Losartán + Regaliz**
```sql
severity: GRAVE
mechanism: "Regaliz causa retención de sodio e hipertensión, 
           antagoniza completamente el antihipertensivo"
clinical_consequence: "Pérdida total del control de PA, 
                       hipertensión rebote, hipopotasemia"
recommendation: "EVITAR completamente en hipertensos"
```

**2. Digoxina + Regaliz**
```sql
severity: GRAVE
mechanism: "Regaliz causa hipopotasemia. Digoxina + K bajo = 
           toxicidad digitálica y arritmias letales"
clinical_consequence: "Arritmias ventriculares mortales, 
                       toxicidad digitálica severa"
recommendation: "CONTRAINDICACIÓN ABSOLUTA"
```

---

### Interacciones MODERADAS (MONITOREAR)

**3. Warfarina + Ajo**
```sql
severity: MODERADA
mechanism: "Ajo antiagregante + Warfarina anticoagulante = 
           riesgo sangrado aumentado"
clinical_consequence: "Sangrado espontáneo, hematomas, hemorragia GI"
recommendation: "Monitorear INR frecuentemente. Ajo <2g/día"
```

**4. Ibuprofeno + Jengibre**
```sql
severity: MODERADA
mechanism: "Ambos antiagregantes, sinergia aumenta sangrado GI"
clinical_consequence: "Úlcera péptica, hemorragia digestiva"
recommendation: "Monitorear signos sangrado. Jengibre <4g/día"
```

**5. Warfarina + Manzanilla**
```sql
severity: MODERADA
mechanism: "Manzanilla contiene cumarina (anticoagulante leve)"
clinical_consequence: "INR puede elevarse ligeramente"
recommendation: "Monitorear INR si >3 tazas/día"
```

**6. Fluoxetina + Valeriana**
```sql
severity: MODERADA
mechanism: "Valeriana sedante + ISRS = sedación excesiva"
clinical_consequence: "Somnolencia extrema, dificultad concentración"
recommendation: "Valeriana solo por la noche. No conducir"
```

---

### Interacciones LEVES (PRECAUCIÓN)

**7. Paracetamol + Cúrcuma**
```sql
severity: LEVE
mechanism: "Cúrcuma afecta levemente CYP450 hepático"
clinical_consequence: "Riesgo teórico hepatotoxicidad con dosis altas"
recommendation: "Paracetamol <3g/día si consume cúrcuma regularmente"
```

**8. Metformina + Ginseng** *(Pendiente agregar Ginseng a BD)*
```sql
severity: LEVE
mechanism: "Ginseng hipoglucemiante + Metformina = sinergia"
clinical_consequence: "Posible hipoglucemia"
recommendation: "Monitorear glucemia diariamente al inicio"
```

---

## 🔍 CÓMO DETECTA EL SISTEMA LAS INTERACCIONES

### Escenario 1: Usuario ve detalle de MEDICAMENTO

```typescript
// En MedicationDetailPage.tsx
<InteractionChecker 
  medicationId={medication.id} 
  medicationName={medication.name} 
/>

// El componente busca:
1. Obtener plantas favoritas del usuario
2. Buscar interacciones donde:
   - medication_id = este medicamento
   - plant_id IN (plantas favoritas del usuario)
3. Mostrar alertas según severidad
```

**Ejemplo:**
```
Usuario tiene Warfarina en "Mis Medicamentos"
Usuario tiene Ajo en "Favoritos"

Query ejecutada:
SELECT * FROM medication_plant_interactions
WHERE medication_id = {warfarina_id}
AND plant_id IN (SELECT plant_id FROM favorites WHERE user_id = {user_id})

Resultado: ⚠️ MODERADA - Warfarina + Ajo
"Monitorear INR. Ajo <2g/día"
```

---

### Escenario 2: Usuario ve detalle de PLANTA

```typescript
// En PlantDetailPage.tsx (FUTURO)
<InteractionChecker 
  plantId={plant.id} 
  plantName={plant.name} 
/>

// El componente busca:
1. Obtener medicamentos del usuario
2. Buscar interacciones donde:
   - plant_id = esta planta
   - medication_name IN (medicamentos del usuario)
3. Mostrar alertas según severidad
```

**Ejemplo:**
```
Usuario tiene Losartán en "Mis Medicamentos"
Usuario ve detalle de Regaliz

Query ejecutada:
SELECT * FROM medication_plant_interactions
WHERE plant_id = {regaliz_id}
AND medication_name IN (SELECT medication_name FROM user_medications 
                        WHERE user_id = {user_id})

Resultado: 🚨 GRAVE - Losartán + Regaliz
"EVITAR completamente en hipertensos"
```

---

## 📝 CÓMO AGREGAR MÁS INTERACCIONES

### Paso 1: Verificar que planta existe en BD

```sql
SELECT id, name FROM plants WHERE name = 'Nombre Planta';
```

### Paso 2: Insertar interacción usando IDs

```sql
INSERT INTO medication_plant_interactions 
  (medication_id, medication_name, plant_id, plant_name, 
   severity, interaction_type, mechanism, clinical_consequence, 
   recommendation, evidence_level, scientific_references)
SELECT 
  m.id,                    -- ID del medicamento
  'Nombre Medicamento',
  p.id,                    -- ID de la planta
  'Nombre Planta',
  'GRAVE',                 -- o 'MODERADA' o 'LEVE'
  'FARMACODINÁMICA',       -- o 'FARMACOCINÉTICA' o 'MIXTA'
  'Descripción del mecanismo bioquímico...',
  'Qué le puede pasar al paciente...',
  'Qué hacer: EVITAR / MONITOREAR / PRECAUCIÓN...',
  'ALTA',                  -- o 'MODERADA' o 'BAJA'
  ARRAY[
    'https://pubmed.ncbi.nlm.nih.gov/12345678/',
    'Libro de referencia, página X'
  ]
FROM medications m, plants p
WHERE m.name = 'Nombre Medicamento' 
AND p.name = 'Nombre Planta';
```

### Paso 3: Verificar inserción

```sql
SELECT 
  mp.plant_name,
  mp.medication_name,
  mp.severity,
  mp.recommendation
FROM medication_plant_interactions mp
WHERE mp.plant_name = 'Nombre Planta';
```

---

## 🎨 VISUALIZACIÓN DE INTERACCIONES EN UI

### Estados Visuales por Severidad

**GRAVE:**
```
🚨 Borde rojo grueso (4px #ef4444)
🚨 Fondo rojo muy claro (#fef2f2)
🚨 Badge: "GRAVE - EVITAR" (rojo)
🚨 Icono: ShieldAlert
```

**MODERADA:**
```
⚠️ Borde ámbar grueso (4px #f59e0b)
⚠️ Fondo ámbar muy claro (#fffbeb)
⚠️ Badge: "MODERADA - MONITOREAR" (ámbar)
⚠️ Icono: AlertTriangle
```

**LEVE:**
```
ℹ️ Borde amarillo grueso (4px #eab308)
ℹ️ Fondo amarillo muy claro (#fefce8)
ℹ️ Badge: "LEVE - PRECAUCIÓN" (amarillo)
ℹ️ Icono: Info
```

---

## 🔧 QUERIES ÚTILES PARA MANTENIMIENTO

### Ver todas las interacciones de un medicamento

```sql
SELECT 
  p.name as planta,
  mp.severity,
  mp.clinical_consequence,
  mp.recommendation
FROM medication_plant_interactions mp
JOIN plants p ON p.id = mp.plant_id
WHERE mp.medication_name = 'Warfarina'
ORDER BY 
  CASE mp.severity 
    WHEN 'GRAVE' THEN 1
    WHEN 'MODERADA' THEN 2
    WHEN 'LEVE' THEN 3
  END;
```

### Ver todas las interacciones de una planta

```sql
SELECT 
  mp.medication_name as medicamento,
  mp.severity,
  mp.clinical_consequence,
  mp.recommendation
FROM medication_plant_interactions mp
WHERE mp.plant_name = 'Ajo'
ORDER BY mp.severity;
```

### Estadísticas de interacciones

```sql
SELECT 
  severity,
  COUNT(*) as total
FROM medication_plant_interactions
GROUP BY severity
ORDER BY 
  CASE severity 
    WHEN 'GRAVE' THEN 1
    WHEN 'MODERADA' THEN 2
    WHEN 'LEVE' THEN 3
  END;
```

---

## 📚 FUENTES DE INFORMACIÓN PARA INTERACCIONES

### Bases de Datos Científicas

1. **Natural Medicines Database** (Subscription)
   - URL: https://naturalmedicines.therapeuticresearch.com
   - Más completa para interacciones herbales
   - Actualización continua

2. **Stockley's Herbal Medicines Interactions** (Libro)
   - Pharmaceutical Press, 2nd Edition
   - Referencia estándar en farmacología

3. **PubMed/MEDLINE** (Gratuito)
   - URL: https://pubmed.ncbi.nlm.nih.gov
   - Buscar: "[plant name] AND [drug name] AND interaction"

4. **Cochrane Library** (Gratuito para revisiones)
   - URL: https://www.cochranelibrary.com
   - Revisiones sistemáticas de alta calidad

5. **FDA MedWatch** (Gratuito)
   - URL: https://www.fda.gov/medwatch
   - Alertas de seguridad oficiales

---

## ⚠️ CRITERIOS DE CLASIFICACIÓN DE SEVERIDAD

### GRAVE (Rojo)
- Riesgo de muerte o daño permanente
- Requiere intervención médica inmediata
- Contraindicación absoluta
- Ejemplos: Arritmias letales, sangrado severo, crisis hipertensiva

### MODERADA (Ámbar)
- Requiere monitoreo médico frecuente
- Puede causar síntomas significativos
- Ajuste de dosis necesario
- Ejemplos: Sangrado leve, hipoglucemia, hipertensión leve

### LEVE (Amarillo)
- Monitoreo básico recomendado
- Síntomas mínimos o raros
- No requiere ajuste de dosis usualmente
- Ejemplos: Molestias GI leves, leve alteración de enzimas

---

## 🚀 PRÓXIMOS PASOS

### Interacciones Prioritarias a Agregar

1. **Anticoagulantes** (Warfarina) con:
   - Equinácea (planta #16)
   - Jengibre (planta #2)
   - Saúco (planta #18)

2. **Antihipertensivos** (Losartán) con:
   - Ajo (planta #17)
   - Equinácea (planta #16)

3. **Antidiabéticos** (Metformina) con:
   - Cúrcuma (planta #9)
   - Jengibre (planta #2)

4. **AINEs** (Ibuprofeno) con:
   - Cúrcuma (planta #9)
   - Ajo (planta #17)

5. **Sedantes** (Fluoxetina) con:
   - Manzanilla (planta #1)
   - Lavanda (planta #11)
   - Pasiflora (planta #13)

---

## ✅ VALIDACIÓN FARMACÉUTICA

**Recomendación:** Antes de lanzar a producción, solicitar revisión de:
- Farmacéutico clínico
- Médico con experiencia en fitoterapia
- Toxicólogo

**Aspectos a validar:**
- Exactitud de mecanismos
- Clasificación de severidad apropiada
- Recomendaciones clínicas seguras
- Referencias científicas actualizadas

---

**Documento actualizado para reflejar el uso de IDs reales de base de datos en lugar de nombres genéricos.** 🎉
