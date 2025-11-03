# 🏥 SISTEMA DE CATEGORÍAS UNIFICADAS
## BioPlantes - Plantas Y Medicamentos en las MISMAS categorías

**Fecha:** 3 de Noviembre, 2025  
**Estado:** 🔧 PLAN DE CORRECCIÓN

---

## 🚨 PROBLEMA ACTUAL

### Categorías DIFERENTES (INCORRECTO):

**Plantas:**
```sql
- "Trastornos Gastrointestinales"
- "Síndrome del Intestino Irritable"
- "Cólicos y Flatulencia"
- "Trastornos del Sueño"
- "Trastornos Respiratorios"
- "Sistema Inmunológico"
```

**Medicamentos:**
```sql
❌ "Analgésico / Antipirético"
❌ "Antiinflamatorio no esteroideo (AINE)"
❌ "Antihipertensivo (ARA II)"
❌ "Antidiabético oral (Biguanida)"
```

**Resultado:** ¡NO se pueden relacionar! ❌

---

## ✅ CATEGORÍAS UNIFICADAS (CORRECTO)

### Sistema de categorización por SISTEMA CORPORAL + CONDICIÓN:

```sql
-- CATEGORÍAS PRINCIPALES (usadas por PLANTAS y MEDICAMENTOS)
1. "Sistema Digestivo"
   Subcategorías: Gastritis, Dispepsia, SII, Estreñimiento, Diarrea

2. "Sistema Nervioso"
   Subcategorías: Ansiedad, Insomnio, Depresión, Migraña, Estrés

3. "Sistema Respiratorio"
   Subcategorías: Gripe, Bronquitis, Asma, Tos, Sinusitis

4. "Sistema Cardiovascular"
   Subcategorías: Hipertensión, Colesterol, Insuficiencia cardíaca

5. "Sistema Musculoesquelético"
   Subcategorías: Artritis, Dolor muscular, Inflamación

6. "Sistema Inmunológico"
   Subcategorías: Infecciones, Inmunidad baja, Alergias

7. "Sistema Endocrino"
   Subcategorías: Diabetes, Tiroides, Menopausia

8. "Dolor y Fiebre"
   Subcategorías: Dolor agudo, Dolor crónico, Fiebre
```

---

## 📊 MIGRACIÓN DE DATOS

### Paso 1: Modificar tabla medications

```sql
-- Agregar columna 'category' igual que en plants
ALTER TABLE public.medications 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Agregar columna 'subcategory' para ambas tablas
ALTER TABLE public.medications 
ADD COLUMN IF NOT EXISTS subcategory TEXT[];

ALTER TABLE public.plants 
ADD COLUMN IF NOT EXISTS subcategory TEXT[];
```

### Paso 2: Actualizar medicamentos existentes

```sql
-- Paracetamol: Analgésico → Dolor y Fiebre
UPDATE public.medications 
SET category = 'Dolor y Fiebre',
    subcategory = ARRAY['Dolor leve-moderado', 'Fiebre', 'Cefalea']
WHERE name = 'Paracetamol';

-- Ibuprofeno: AINE → Sistema Musculoesquelético + Dolor y Fiebre
UPDATE public.medications 
SET category = 'Sistema Musculoesquelético',
    subcategory = ARRAY['Inflamación', 'Dolor articular', 'Artritis', 'Fiebre']
WHERE name = 'Ibuprofeno';

-- Losartán: Antihipertensivo → Sistema Cardiovascular
UPDATE public.medications 
SET category = 'Sistema Cardiovascular',
    subcategory = ARRAY['Hipertensión arterial', 'Protección renal']
WHERE name = 'Losartán';

-- Metformina: Antidiabético → Sistema Endocrino
UPDATE public.medications 
SET category = 'Sistema Endocrino',
    subcategory = ARRAY['Diabetes tipo 2', 'Resistencia insulina']
WHERE name = 'Metformina';

-- Amoxicilina: Antibiótico → Sistema Inmunológico
UPDATE public.medications 
SET category = 'Sistema Inmunológico',
    subcategory = ARRAY['Infecciones bacterianas', 'Otitis', 'Faringitis']
WHERE name = 'Amoxicilina';

-- Warfarina: Anticoagulante → Sistema Cardiovascular
UPDATE public.medications 
SET category = 'Sistema Cardiovascular',
    subcategory = ARRAY['Prevención trombosis', 'Fibrilación auricular']
WHERE name = 'Warfarina';

-- Fluoxetina: Antidepresivo → Sistema Nervioso
UPDATE public.medications 
SET category = 'Sistema Nervioso',
    subcategory = ARRAY['Depresión mayor', 'Ansiedad', 'TOC']
WHERE name = 'Fluoxetina';

-- Digoxina: Cardíaco → Sistema Cardiovascular
UPDATE public.medications 
SET category = 'Sistema Cardiovascular',
    subcategory = ARRAY['Insuficiencia cardíaca', 'Fibrilación auricular']
WHERE name = 'Digoxina';
```

### Paso 3: Actualizar plantas existentes (ejemplos)

```sql
-- Manzanilla ya tiene category, agregar subcategory
UPDATE public.plants 
SET category = 'Sistema Digestivo',
    subcategory = ARRAY['Gastritis', 'Dispepsia', 'Ansiedad leve', 'Insomnio']
WHERE name = 'Manzanilla';

-- Jengibre
UPDATE public.plants 
SET category = 'Sistema Digestivo',
    subcategory = ARRAY['Náuseas', 'Vómitos', 'Dispepsia', 'Artritis']
WHERE name = 'Jengibre';

-- Valeriana
UPDATE public.plants 
SET category = 'Sistema Nervioso',
    subcategory = ARRAY['Insomnio', 'Ansiedad', 'Estrés']
WHERE name = 'Valeriana';

-- Equinácea
UPDATE public.plants 
SET category = 'Sistema Inmunológico',
    subcategory = ARRAY['Resfriado común', 'Gripe', 'Infecciones respiratorias']
WHERE name = 'Equinácea';

-- Ajo
UPDATE public.plants 
SET category = 'Sistema Cardiovascular',
    subcategory = ARRAY['Colesterol alto', 'Hipertensión', 'Antimicrobiano']
WHERE name = 'Ajo';
```

---

## 🌿💊 NUEVOS MEDICAMENTOS (50-100 totales)

### Sistema Digestivo

```sql
-- Omeprazol (Inhibidor bomba protones)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Omeprazol',
  'Omeprazol magnésico',
  'Sistema Digestivo',
  ARRAY['Gastritis', 'Reflujo gastroesofágico', 'Úlcera péptica'],
  'Inhibidor de bomba de protones',
  ARRAY['Reflujo gastroesofágico', 'Úlcera gástrica', 'Úlcera duodenal', 'Síndrome Zollinger-Ellison'],
  ARRAY['Hipersensibilidad a omeprazol', 'Uso concomitante con nelfinavir'],
  ARRAY['Cefalea', 'Diarrea', 'Náuseas', 'Dolor abdominal'],
  '20mg una vez al día en ayunas, 30 minutos antes del desayuno',
  'C',
  false,
  true
);

-- Ranitidina (H2 antagonista)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Ranitidina',
  'Ranitidina clorhidrato',
  'Sistema Digestivo',
  ARRAY['Gastritis', 'Úlcera péptica', 'Reflujo'],
  'Antagonista H2',
  ARRAY['Úlcera péptica', 'Reflujo gastroesofágico', 'Síndrome Zollinger-Ellison'],
  ARRAY['Hipersensibilidad a ranitidina', 'Porfiria aguda'],
  ARRAY['Cefalea', 'Mareos', 'Estreñimiento', 'Diarrea'],
  '150mg dos veces al día o 300mg antes de dormir',
  'B',
  true,
  true
);

-- Loperamida (Antidiarreico)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Loperamida',
  'Loperamida clorhidrato',
  'Sistema Digestivo',
  ARRAY['Diarrea aguda', 'Diarrea crónica'],
  'Antidiarreico',
  ARRAY['Diarrea aguda', 'Diarrea crónica', 'Diarrea del viajero'],
  ARRAY['Diarrea con sangre', 'Colitis ulcerosa aguda', 'Megacolon tóxico'],
  ARRAY['Estreñimiento', 'Mareos', 'Náuseas', 'Dolor abdominal'],
  'Inicial: 4mg, luego 2mg después de cada evacuación suelta (máx 16mg/día)',
  'C',
  false,
  false
);
```

### Sistema Nervioso

```sql
-- Diazepam (Benzodiacepina)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Diazepam',
  'Diazepam',
  'Sistema Nervioso',
  ARRAY['Ansiedad', 'Insomnio', 'Espasmos musculares'],
  'Benzodiacepina ansiolítica',
  ARRAY['Trastornos de ansiedad', 'Insomnio', 'Espasticidad muscular', 'Convulsiones'],
  ARRAY['Miastenia gravis', 'Insuficiencia respiratoria severa', 'Apnea del sueño'],
  ARRAY['Somnolencia', 'Ataxia', 'Confusión', 'Amnesia anterógrada', 'Dependencia'],
  '2-10mg 2-4 veces al día según necesidad',
  'D',
  false,
  false
);

-- Sertralina (ISRS)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Sertralina',
  'Sertralina clorhidrato',
  'Sistema Nervioso',
  ARRAY['Depresión mayor', 'Ansiedad', 'TOC', 'Pánico'],
  'Antidepresivo ISRS',
  ARRAY['Depresión mayor', 'Trastorno obsesivo-compulsivo', 'Trastorno pánico', 'Ansiedad social'],
  ARRAY['Uso de IMAOs (14 días)', 'Pimozida', 'Hipersensibilidad'],
  ARRAY['Náuseas', 'Diarrea', 'Insomnio', 'Disfunción sexual', 'Sudoración'],
  'Iniciar 50mg/día, incrementar hasta 200mg/día según respuesta',
  'C',
  false,
  false
);

-- Amitriptilina (Tricíclico)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Amitriptilina',
  'Amitriptilina clorhidrato',
  'Sistema Nervioso',
  ARRAY['Depresión', 'Dolor neuropático', 'Migraña profilaxis'],
  'Antidepresivo tricíclico',
  ARRAY['Depresión mayor', 'Dolor neuropático', 'Profilaxis migraña', 'Fibromialgia'],
  ARRAY['IAM reciente', 'Uso de IMAOs', 'Glaucoma ángulo cerrado', 'Retención urinaria'],
  ARRAY['Sequedad boca', 'Estreñimiento', 'Sedación', 'Aumento peso', 'Arritmias'],
  'Depresión: 75-150mg/día. Dolor: 10-75mg/noche',
  'C',
  false,
  false
);
```

### Sistema Cardiovascular

```sql
-- Enalapril (IECA)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Enalapril',
  'Enalapril maleato',
  'Sistema Cardiovascular',
  ARRAY['Hipertensión arterial', 'Insuficiencia cardíaca'],
  'Inhibidor ECA',
  ARRAY['Hipertensión arterial', 'Insuficiencia cardíaca', 'Prevención eventos cardiovasculares'],
  ARRAY['Embarazo', 'Lactancia', 'Angioedema previo', 'Estenosis arterial renal bilateral'],
  ARRAY['Tos seca persistente', 'Mareos', 'Hipotensión', 'Hiperpotasemia'],
  '5-20mg una vez al día, ajustar según PA',
  'D',
  false,
  false
);

-- Atorvastatina (Estatina)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Atorvastatina',
  'Atorvastatina cálcica',
  'Sistema Cardiovascular',
  ARRAY['Colesterol alto', 'Hipercolesterolemia', 'Prevención cardiovascular'],
  'Estatina (inhibidor HMG-CoA reductasa)',
  ARRAY['Hipercolesterolemia', 'Prevención enfermedad cardiovascular', 'Dislipidemia'],
  ARRAY['Enfermedad hepática activa', 'Embarazo', 'Lactancia'],
  ARRAY['Mialgia', 'Elevación transaminasas', 'Cefalea', 'Dispepsia'],
  '10-80mg una vez al día en la noche',
  'X',
  false,
  false
);

-- Aspirina (Antiagregante)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Aspirina',
  'Ácido acetilsalicílico',
  'Sistema Cardiovascular',
  ARRAY['Prevención cardiovascular', 'Antiagregante'],
  'Antiagregante plaquetario / AINE',
  ARRAY['Prevención IAM', 'Prevención ACV', 'Angina inestable', 'Post-stent coronario'],
  ARRAY['Úlcera péptica activa', 'Hemofilia', 'Niños con varicela/gripe (Síndrome Reye)'],
  ARRAY['Sangrado GI', 'Úlcera péptica', 'Acidez', 'Náuseas'],
  'Prevención cardiovascular: 75-100mg/día. Antiinflamatorio: 300-600mg cada 4-6h',
  'D (tercer trimestre)',
  false,
  false
);
```

### Sistema Respiratorio

```sql
-- Salbutamol (Broncodilatador)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Salbutamol',
  'Salbutamol sulfato',
  'Sistema Respiratorio',
  ARRAY['Asma', 'Broncoespasmo', 'EPOC'],
  'Broncodilatador beta-2 agonista',
  ARRAY['Asma bronquial', 'EPOC', 'Broncoespasmo reversible'],
  ARRAY['Hipersensibilidad a salbutamol', 'Taquiarritmias'],
  ARRAY['Temblor', 'Taquicardia', 'Palpitaciones', 'Cefalea', 'Nerviosismo'],
  'Inhalador: 1-2 puff cada 4-6h según necesidad',
  'C',
  true,
  true
);

-- Loratadina (Antihistamínico)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Loratadina',
  'Loratadina',
  'Sistema Respiratorio',
  ARRAY['Rinitis alérgica', 'Urticaria', 'Alergias'],
  'Antihistamínico H1 no sedante',
  ARRAY['Rinitis alérgica', 'Urticaria', 'Conjuntivitis alérgica'],
  ARRAY['Hipersensibilidad a loratadina'],
  ARRAY['Cefalea', 'Somnolencia leve', 'Sequedad boca', 'Fatiga'],
  '10mg una vez al día',
  'B',
  true,
  true
);
```

### Sistema Inmunológico

```sql
-- Azitromicina (Antibiótico)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Azitromicina',
  'Azitromicina dihidrato',
  'Sistema Inmunológico',
  ARRAY['Infecciones bacterianas', 'Neumonía', 'Faringitis'],
  'Antibiótico macrólido',
  ARRAY['Neumonía', 'Faringitis', 'Otitis media', 'Sinusitis', 'Bronquitis', 'Infecciones piel'],
  ARRAY['Alergia a macrólidos', 'Insuficiencia hepática severa'],
  ARRAY['Diarrea', 'Náuseas', 'Dolor abdominal', 'Prolongación QT'],
  'Dosis única diaria: 500mg día 1, luego 250mg días 2-5',
  'B',
  false,
  true
);

-- Prednisona (Corticoide)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Prednisona',
  'Prednisona',
  'Sistema Inmunológico',
  ARRAY['Inflamación', 'Autoinmune', 'Alergias severas'],
  'Corticoide sistémico',
  ARRAY['Artritis reumatoide', 'Lupus', 'Asma severa', 'Alergias graves', 'Enfermedades autoinmunes'],
  ARRAY['Infecciones fúngicas sistémicas', 'Vacunas vivas (uso crónico)'],
  ARRAY['Hiperglucemia', 'Aumento peso', 'Osteoporosis', 'Inmunodepresión', 'Insomnio'],
  '5-60mg/día según condición. Reducir gradualmente',
  'C',
  false,
  true
);
```

### Sistema Endocrino

```sql
-- Levotiroxina (Tiroides)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Levotiroxina',
  'Levotiroxina sódica',
  'Sistema Endocrino',
  ARRAY['Hipotiroidismo', 'Tiroides'],
  'Hormona tiroidea',
  ARRAY['Hipotiroidismo', 'Bocio', 'Post-tiroidectomía', 'Cáncer tiroides'],
  ARRAY['Tirotoxicosis no tratada', 'IAM reciente', 'Insuficiencia adrenal no corregida'],
  ARRAY['Taquicardia', 'Palpitaciones', 'Insomnio', 'Temblor', 'Pérdida peso'],
  '25-200mcg una vez al día en ayunas',
  'A',
  true,
  true
);

-- Glibenclamida (Antidiabético)
INSERT INTO public.medications (name, active_ingredient, category, subcategory, therapeutic_class, indications, contraindications, side_effects, dosage_info, pregnancy_category, lactation_safe, pediatric_use)
VALUES (
  'Glibenclamida',
  'Glibenclamida',
  'Sistema Endocrino',
  ARRAY['Diabetes tipo 2'],
  'Sulfonilurea antidiabética',
  ARRAY['Diabetes mellitus tipo 2'],
  ARRAY['Diabetes tipo 1', 'Cetoacidosis diabética', 'Insuficiencia renal/hepática severa'],
  ARRAY['Hipoglucemia', 'Aumento peso', 'Náuseas', 'Erupciones cutáneas'],
  '2.5-20mg/día con desayuno o dividido en 2 dosis',
  'C',
  false,
  false
);
```

---

## 🔗 INTERACCIONES ADICIONALES (40-90 totales)

### Sistema Digestivo

```sql
-- Omeprazol + Manzanilla (LEVE)
INSERT INTO public.medication_plant_interactions 
  (medication_id, medication_name, plant_id, plant_name, severity, interaction_type, mechanism, clinical_consequence, recommendation, evidence_level, scientific_references)
SELECT 
  m.id, 'Omeprazol', p.id, 'Manzanilla',
  'LEVE',
  'FARMACOCINÉTICA',
  'Omeprazol inhibe CYP2C19. Manzanilla tiene interacción mínima pero teóricamente podría afectar metabolismo.',
  'Generalmente seguro. Sin interacciones clínicamente significativas reportadas.',
  'SEGURO de usar juntos. Manzanilla puede ayudar con gastritis complementando omeprazol.',
  'BAJA',
  ARRAY['Uso tradicional conjunto sin problemas reportados']
FROM public.medications m, public.plants p
WHERE m.name = 'Omeprazol' AND p.name = 'Manzanilla';

-- Loperamida + Jengibre (MODERADA)
INSERT INTO public.medication_plant_interactions 
  (medication_id, medication_name, plant_id, plant_name, severity, interaction_type, mechanism, clinical_consequence, recommendation, evidence_level, scientific_references)
SELECT 
  m.id, 'Loperamida', p.id, 'Jengibre',
  'MODERADA',
  'FARMACODINÁMICA',
  'Jengibre tiene efecto antidiarreico leve. Combinado con loperamida podría causar estreñimiento excesivo.',
  'Riesgo de estreñimiento severo, distensión abdominal, íleo paralítico en casos extremos.',
  'USAR con precaución. Jengibre en dosis bajas (<2g/día) es aceptable. Monitorear evacuaciones.',
  'MODERADA',
  ARRAY['https://pubmed.ncbi.nlm.nih.gov/24642205/']
FROM public.medications m, public.plants p
WHERE m.name = 'Loperamida' AND p.name = 'Jengibre';
```

### Sistema Nervioso

```sql
-- Diazepam + Valeriana (MODERADA)
INSERT INTO public.medication_plant_interactions 
  (medication_id, medication_name, plant_id, plant_name, severity, interaction_type, mechanism, clinical_consequence, recommendation, evidence_level, scientific_references)
SELECT 
  m.id, 'Diazepam', p.id, 'Valeriana',
  'MODERADA',
  'FARMACODINÁMICA',
  'Ambos actúan sobre receptores GABA-A causando sedación. Efecto sinérgico potencialmente peligroso.',
  'Sedación excesiva, somnolencia profunda, ataxia, riesgo de caídas, depresión respiratoria en casos severos.',
  'EVITAR combinación. Si se usa, reducir dosis de diazepam 50%. Monitorear sedación. No conducir.',
  'ALTA',
  ARRAY['https://pubmed.ncbi.nlm.nih.gov/11346373/']
FROM public.medications m, public.plants p
WHERE m.name = 'Diazepam' AND p.name = 'Valeriana';

-- Fluoxetina + Valeriana (ya existe, confirmar)
-- Sertralina + Valeriana
INSERT INTO public.medication_plant_interactions 
  (medication_id, medication_name, plant_id, plant_name, severity, interaction_type, mechanism, clinical_consequence, recommendation, evidence_level, scientific_references)
SELECT 
  m.id, 'Sertralina', p.id, 'Valeriana',
  'MODERADA',
  'FARMACODINÁMICA',
  'Valeriana sedante + ISRS puede potenciar sedación. Riesgo teórico bajo de síndrome serotoninérgico.',
  'Somnolencia diurna, fatiga, dificultad concentración. Raramente síntomas serotoninérgicos.',
  'MONITOREAR sedación. Tomar valeriana solo por la noche. Informar a psiquiatra. No conducir al inicio.',
  'MODERADA',
  ARRAY['https://pubmed.ncbi.nlm.nih.gov/11346373/']
FROM public.medications m, public.plants p
WHERE m.name = 'Sertralina' AND p.name = 'Valeriana';

-- Diazepam + Manzanilla (LEVE)
INSERT INTO public.medication_plant_interactions 
  (medication_id, medication_name, plant_id, plant_name, severity, interaction_type, mechanism, clinical_consequence, recommendation, evidence_level, scientific_references)
SELECT 
  m.id, 'Diazepam', p.id, 'Manzanilla',
  'LEVE',
  'FARMACODINÁMICA',
  'Manzanilla tiene leve efecto sedante. Puede potenciar mínimamente el efecto de diazepam.',
  'Ligero aumento de sedación. Generalmente bien tolerado.',
  'PRECAUCIÓN. Manzanilla 1-2 tazas/día es seguro. Evitar dosis altas. Monitorear somnolencia.',
  'BAJA',
  ARRAY['Stockley Herbal Medicines Interactions']
FROM public.medications m, public.plants p
WHERE m.name = 'Diazepam' AND p.name = 'Manzanilla';
```

### Sistema Cardiovascular

```sql
-- Enalapril + Ajo (LEVE)
INSERT INTO public.medication_plant_interactions 
  (medication_id, medication_name, plant_id, plant_name, severity, interaction_type, mechanism, clinical_consequence, recommendation, evidence_level, scientific_references)
SELECT 
  m.id, 'Enalapril', p.id, 'Ajo',
  'LEVE',
  'FARMACODINÁMICA',
  'Ajo tiene leve efecto hipotensor. Combinado con IECA puede potenciar reducción de PA.',
  'Hipotensión leve, mareos al levantarse. Generalmente beneficioso para hipertensos.',
  'GENERALMENTE SEGURO. Puede ser beneficioso. Monitorear PA al inicio. Ajo <2g/día.',
  'MODERADA',
  ARRAY['https://pubmed.ncbi.nlm.nih.gov/23590705/']
FROM public.medications m, public.plants p
WHERE m.name = 'Enalapril' AND p.name = 'Ajo';

-- Atorvastatina + Ajo (LEVE)
INSERT INTO public.medication_plant_interactions 
  (medication_id, medication_name, plant_id, plant_name, severity, interaction_type, mechanism, clinical_consequence, recommendation, evidence_level, scientific_references)
SELECT 
  m.id, 'Atorvastatina', p.id, 'Ajo',
  'LEVE',
  'FARMACODINÁMICA',
  'Ajo reduce colesterol por mecanismo diferente a estatinas. Efecto sinérgico potencialmente beneficioso.',
  'Puede mejorar perfil lipídico. Riesgo teórico mínimo de miopatía aumentada.',
  'GENERALMENTE SEGURO y potencialmente beneficioso. Monitorear transaminasas. Ajo <2g/día.',
  'MODERADA',
  ARRAY['https://pubmed.ncbi.nlm.nih.gov/23590705/']
FROM public.medications m, public.plants p
WHERE m.name = 'Atorvastatina' AND p.name = 'Ajo';

-- Aspirina + Jengibre (MODERADA)
INSERT INTO public.medication_plant_interactions 
  (medication_id, medication_name, plant_id, plant_name, severity, interaction_type, mechanism, clinical_consequence, recommendation, evidence_level, scientific_references)
SELECT 
  m.id, 'Aspirina', p.id, 'Jengibre',
  'MODERADA',
  'FARMACODINÁMICA',
  'Aspirina antiagregante + Jengibre antiagregante = sinergia aumenta riesgo sangrado.',
  'Mayor riesgo hematomas, epistaxis, sangrado GI, hemorragias.',
  'MONITOREAR signos sangrado. Jengibre <2g/día. Evitar altas dosis. Suspender jengibre si sangrado.',
  'MODERADA',
  ARRAY['https://pubmed.ncbi.nlm.nih.gov/15929508/']
FROM public.medications m, public.plants p
WHERE m.name = 'Aspirina' AND p.name = 'Jengibre';
```

### Sistema Respiratorio

```sql
-- Salbutamol + Equinácea (LEVE - si tienes Equinácea)
-- Loratadina + Manzanilla (SEGURO)
INSERT INTO public.medication_plant_interactions 
  (medication_id, medication_name, plant_id, plant_name, severity, interaction_type, mechanism, clinical_consequence, recommendation, evidence_level, scientific_references)
SELECT 
  m.id, 'Loratadina', p.id, 'Manzanilla',
  'LEVE',
  'SIN INTERACCIÓN',
  'No hay interacción conocida entre loratadina y manzanilla. Mecanismos diferentes.',
  'Seguro de usar juntos. Pueden complementarse para alergias.',
  'SEGURO. Manzanilla puede ayudar con síntomas alérgicos complementando loratadina.',
  'BAJA',
  ARRAY['Uso tradicional conjunto sin problemas']
FROM public.medications m, public.plants p
WHERE m.name = 'Loratadina' AND p.name = 'Manzanilla';
```

### Sistema Inmunológico

```sql
-- Azitromicina + Equinácea (si la tienes - LEVE)
-- Prednisona + Equinácea (MODERADA - contradictorio)
```

---

## 🎨 NUEVA VISTA UNIFICADA

### Concepto: ExplorePage con TOGGLE

```tsx
// client/pages/ExplorePage.tsx (MODIFICADO)

export default function ExplorePage() {
  const { preference } = useTreatmentPreference();
  const [viewMode, setViewMode] = useState<'plants' | 'medications' | 'both'>('both');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Categorías unificadas
  const categories = [
    { id: 'digestivo', name: 'Sistema Digestivo', icon: '🫃', color: 'green' },
    { id: 'nervioso', name: 'Sistema Nervioso', icon: '🧠', color: 'purple' },
    { id: 'respiratorio', name: 'Sistema Respiratorio', icon: '🫁', color: 'blue' },
    { id: 'cardiovascular', name: 'Sistema Cardiovascular', icon: '❤️', color: 'red' },
    { id: 'musculoesqueletico', name: 'Sistema Musculoesquelético', icon: '🦴', color: 'orange' },
    { id: 'inmunologico', name: 'Sistema Inmunológico', icon: '🛡️', color: 'cyan' },
    { id: 'endocrino', name: 'Sistema Endocrino', icon: '⚗️', color: 'pink' },
    { id: 'dolor-fiebre', name: 'Dolor y Fiebre', icon: '🌡️', color: 'amber' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con Toggle */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Explorar Tratamientos</h1>
        
        {preference === 'integrative' && (
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="plants">🌿 Solo Plantas</TabsTrigger>
              <TabsTrigger value="both">🌿💊 Ambos</TabsTrigger>
              <TabsTrigger value="medications">💊 Solo Medicamentos</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {categories.map(cat => (
          <Card 
            key={cat.id}
            className={`cursor-pointer hover:shadow-lg transition ${
              selectedCategory === cat.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <CardHeader>
              <div className="text-4xl mb-2">{cat.icon}</div>
              <CardTitle className="text-lg">{cat.name}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Resultados Filtrados */}
      {selectedCategory && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {categories.find(c => c.id === selectedCategory)?.name}
          </h2>

          {/* PLANTAS (si viewMode permite) */}
          {(viewMode === 'plants' || viewMode === 'both') && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🌿 Plantas Medicinales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PlantCards filtradas por categoría */}
              </div>
            </div>
          )}

          {/* MEDICAMENTOS (si viewMode permite) */}
          {(viewMode === 'medications' || viewMode === 'both') && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                💊 Medicamentos Convencionales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* MedicationCards filtradas por categoría */}
              </div>
            </div>
          )}

          {/* TABLA COMPARATIVA (solo integrative) */}
          {preference === 'integrative' && viewMode === 'both' && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">
                📊 Comparación Directa
              </h3>
              <ComparisonTable 
                plants={plantsInCategory}
                medications={medicationsInCategory}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Migración de Datos (CRÍTICO)
1. ✅ Agregar columnas `category` y `subcategory` a medications
2. ✅ Actualizar 8 medicamentos existentes con categorías correctas
3. ✅ Actualizar 50 plantas existentes con categorías unificadas
4. ✅ Agregar 40-50 medicamentos nuevos por categoría
5. ✅ Agregar 40-90 interacciones nuevas

### Fase 2: UI Unificada
1. ✅ Crear ExplorePage con toggle plantas/medicamentos/ambos
2. ✅ Grid de categorías con iconos
3. ✅ Filtrado dinámico por categoría
4. ✅ Vista comparativa para usuarios integrativos

### Fase 3: Interacciones Mejoradas
1. ✅ InteractionChecker detecta por categoría también
2. ✅ Sugerencias: "Si tomas X, considera Y de la misma categoría"

---

**¿EMPEZAMOS CON LA MIGRACIÓN DE DATOS?** 🚀
