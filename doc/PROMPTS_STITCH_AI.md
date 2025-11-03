# 🤖 PROMPTS PARA STITCH AI Y HERRAMIENTAS DE DISEÑO

## PROMPT 1: PARA STITCH AI (IMPLEMENTACIÓN FRONTEND)

```
Eres un desarrollador experto en React 18 + TypeScript + Tailwind CSS trabajando en BioPlantes, 
un sistema integrado de medicina natural y convencional.

CONTEXTO DEL PROYECTO:
- Stack: React 18.2, TypeScript 5.0, Vite, Tailwind CSS 3.3, Shadcn/ui, Framer Motion
- Backend: Supabase (PostgreSQL) con Row Level Security (RLS)
- Autenticación: Supabase Auth con JWT
- Estado: React hooks (useState, useEffect, useMemo)
- Rutas: React Router v6

ESTRUCTURA DE BASE DE DATOS YA CREADA:

1. medications (id, name, active_ingredient, therapeutic_class, indications[], 
   contraindications[], side_effects[], dosage_info, pregnancy_category, 
   lactation_safe, pediatric_use, elderly_considerations, mechanism_of_action, image_url)

2. medication_plant_interactions (id, medication_id, medication_name, plant_id, 
   plant_name, severity [GRAVE/MODERADA/LEVE], interaction_type, mechanism, 
   clinical_consequence, recommendation, evidence_level, scientific_references[])

3. user_medications (id, user_id, medication_id, medication_name, dosage, 
   frequency, start_date, notes)

4. profiles (ya existente, AGREGADO: treatment_preference [natural/conventional/integrative])

COMPONENTES YA IMPLEMENTADOS:
✅ OnboardingWizard (con Step 0 de preferencia de tratamiento)
✅ MedicationsPage (catálogo completo con búsqueda y filtros)
✅ MedicationDetailPage (vista detallada con tabs)
✅ InteractionChecker (detección automática de interacciones)
✅ Rutas /medications y /medications/:id
✅ Navegación actualizada (Navbar)

TAREA PENDIENTE - COMPONENTE UserMedicationsManager:

Necesito que implementes un componente completo para que los usuarios gestionen 
sus medicamentos actuales. Debe ser similar al gestor de favoritos pero para medicamentos.

REQUISITOS FUNCIONALES:

1. UBICACIÓN: client/components/UserMedicationsManager.tsx

2. VISTA PRINCIPAL:
   - Título: "Mis Medicamentos Actuales"
   - Botón: "Agregar Medicamento" (abre modal)
   - Lista de medicamentos del usuario con:
     * Nombre del medicamento
     * Dosis (ej: "500mg")
     * Frecuencia (ej: "Cada 8 horas", "Diario")
     * Fecha de inicio
     * Notas adicionales (opcional)
     * Botones: Editar, Eliminar

3. MODAL DE AGREGAR/EDITAR:
   - Campo 1: Selector de medicamento (búsqueda + dropdown desde tabla medications)
   - Campo 2: Dosis (input de texto, ej: "500mg", "1 tableta")
   - Campo 3: Frecuencia (select: Diario, Cada 8h, Cada 12h, Cada 24h, Según necesidad, Otro)
   - Campo 4: Frecuencia personalizada (input si selecciona "Otro")
   - Campo 5: Fecha de inicio (date picker)
   - Campo 6: Notas (textarea opcional, max 200 caracteres)
   - Botones: Guardar, Cancelar

4. FUNCIONALIDADES:
   - Listar medicamentos del usuario (SELECT * FROM user_medications WHERE user_id = auth.uid())
   - Agregar nuevo medicamento (INSERT INTO user_medications)
   - Editar medicamento existente (UPDATE user_medications)
   - Eliminar medicamento (DELETE FROM user_medications)
   - Validar que no se agreguen duplicados
   - Mostrar contador: "X medicamentos registrados"

5. INTEGRACIÓN CON DETECCIÓN DE INTERACCIONES:
   - Mostrar badge "⚠️ X interacciones" en cada medicamento que tenga interacciones
   - Al hacer click en badge, expandir tarjeta con lista de plantas que interactúan
   - Usar componente InteractionChecker existente

6. UI/UX:
   - Usar Shadcn/ui components: Dialog, Select, Input, Button, Badge, Card
   - Animaciones con Framer Motion (entrada/salida de tarjetas)
   - Responsive: Grid 1 columna móvil, 2 columnas tablet, 3 columnas desktop
   - Color scheme: Azul (medicamentos) vs Verde (plantas)
   - Empty state: "No tienes medicamentos registrados. Agrega uno para comenzar."

7. MANEJO DE ERRORES:
   - Toast de error si falla INSERT/UPDATE/DELETE
   - Toast de éxito cuando se completa acción
   - Validación de campos requeridos
   - Mensaje si usuario no autenticado

EJEMPLO DE ESTRUCTURA:

```typescript
import { useState, useEffect } from "react";
import { Pill, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface UserMedication {
  id: string;
  medication_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  notes: string;
}

export default function UserMedicationsManager() {
  const [medications, setMedications] = useState<UserMedication[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // ... implementar resto
}
```

CRITERIOS DE CALIDAD:
- TypeScript estricto (sin any, interfaces tipadas)
- Accesibilidad (ARIA labels, keyboard navigation)
- Performance (useMemo para filtros, lazy loading)
- Seguridad (RLS ya implementado en BD)
- Testing mental (considerar edge cases)

GENERA EL CÓDIGO COMPLETO DEL COMPONENTE UserMedicationsManager.tsx
```

---

## PROMPT 2: PARA HERRAMIENTAS DE DISEÑO (V0, FIGMA, ETC.)

```
Diseña mockups/wireframes para un sistema de medicina integrativa llamado BioPlantes.

CONTEXTO:
BioPlantes combina medicina natural (plantas medicinales) y medicina convencional 
(medicamentos farmacéuticos) con un sistema automático de detección de interacciones.

PALETA DE COLORES:
- Natural/Plantas: Verde (#10b981, #059669, #047857)
- Convencional/Medicamentos: Azul (#3b82f6, #2563eb, #1d4ed8)
- Integrativo: Púrpura (#8b5cf6, #7c3aed, #6d28d9)
- Alertas GRAVE: Rojo (#ef4444, #dc2626, #b91c1c)
- Alertas MODERADA: Ámbar (#f59e0b, #d97706, #b45309)
- Alertas LEVE: Amarillo (#eab308, #ca8a04, #a16207)
- Éxito: Verde (#22c55e, #16a34a, #15803d)
- Fondo: Blanco (#ffffff) / Gris claro (#f9fafb)
- Texto: Gris oscuro (#1f2937, #111827)

DISEÑOS REQUERIDOS:

### 1. SELECTOR DE PREFERENCIA DE TRATAMIENTO (Onboarding Step 0)

Pantalla de bienvenida con 3 opciones grandes:

**Opción 1: Medicina Natural 🌿**
- Icono: Hoja verde grande (80px)
- Título: "Medicina Natural"
- Descripción: "Solo plantas medicinales y remedios naturales. Ideal para quienes 
  prefieren tratamientos herbales tradicionales."
- Badges: "Plantas medicinales", "Remedios herbales"
- Color: Verde (#10b981)
- Estado seleccionado: Borde verde grueso, fondo verde claro, checkmark

**Opción 2: Medicina Convencional 💊**
- Icono: Píldora azul grande (80px)
- Título: "Medicina Convencional"
- Descripción: "Medicamentos farmacéuticos con evidencia clínica. Para quienes 
  confían en tratamientos científicamente probados."
- Badges: "Medicamentos", "Evidencia científica"
- Color: Azul (#3b82f6)

**Opción 3: Medicina Integrativa 🌿💊 [RECOMENDADO]**
- Icono: Hoja + Píldora juntas (80px)
- Título: "Medicina Integrativa"
- Badge especial: "Recomendado" (esquina superior derecha, púrpura)
- Descripción: "Lo mejor de ambos mundos. Combina plantas medicinales y 
  medicamentos con verificación automática de interacciones."
- Badges: "Plantas + Medicamentos", "Detección de interacciones", "Seguro y efectivo"
- Panel destacado: "⚠️ Sistema de Seguridad: Te alertaremos automáticamente 
  si una planta puede interactuar con tus medicamentos."
- Color: Púrpura (#8b5cf6)

Layout: 3 tarjetas verticales apiladas, responsive a grid horizontal en desktop
Botón inferior: "Siguiente" (grande, púrpura)

---

### 2. CATÁLOGO DE MEDICAMENTOS

**Header:**
- Icono de píldora + Título "Catálogo de Medicamentos"
- Subtítulo: "Información completa sobre medicamentos convencionales con 
  verificación de interacciones"
- Degradado de fondo: Azul claro a blanco

**Barra de Búsqueda:**
- Input grande con icono de lupa
- Placeholder: "Buscar por nombre, principio activo o clase terapéutica..."
- Botón "Filtros" con badge de contador

**Grid de Tarjetas (3 columnas desktop, 2 tablet, 1 móvil):**
Cada tarjeta muestra:
- Imagen superior (o icono de píldora si no hay imagen)
- Badge "⚠️ Interacción" (esquina superior izquierda si aplica)
- Botón corazón favorito (esquina superior derecha)
- Badges inferiores de imagen: "No lactancia", "No pediátrico" (si aplica)
- Nombre del medicamento (bold, 20px)
- Principio activo (gris, 14px)
- Badge de clase terapéutica (outline)
- Lista de 3 indicaciones principales con checkmarks verdes
- "+X más" si hay más de 3
- Pie de tarjeta: "Categoría embarazo: B" (pequeño)

Hover: Borde azul, sombra aumentada, cursor pointer

---

### 3. TARJETA DE MEDICAMENTO (Card Component)

Dimensiones: 320px x 450px aprox.

**Sección Superior (180px):**
- Fondo: Degradado azul-púrpura suave
- Imagen centrada o icono de píldora (120px)
- Badge "⚠️ Interacción" flotante (top-left)
- Botón corazón flotante (top-right)
- Badges de seguridad flotantes (bottom-left): "No lactancia", "No pediátrico"

**Sección Inferior:**
- Nombre: 20px bold, color primario
- Principio activo: 14px gris
- Badge clase terapéutica: outline, 12px
- Indicaciones (máximo 3):
  ```
  ✓ Dolor leve a moderado
  ✓ Fiebre
  ✓ Cefalea
  +2 más
  ```
- Icono info + "Categoría embarazo: B"

Estados:
- Normal: Borde gris claro
- Hover: Borde azul, sombra xl
- Con interacción: Borde ámbar pulsante

---

### 4. PÁGINA DE DETALLE DE MEDICAMENTO

**Layout 2 columnas:**

**Columna Izquierda (30%):**
- Imagen grande cuadrada 400x400px
- Fondo degradado azul-púrpura

**Columna Derecha (70%):**
- Nombre: 36px bold
- Principio activo: 18px gris
- Badges horizontales: Clase, Lactancia, Pediátrico, Embarazo
- Botón grande: "Agregar a mis medicamentos" (azul, con icono píldora)
  Estado activo: "✓ En mis medicamentos" (outline)

**Panel de Interacciones (ancho completo debajo):**
- Si no hay: Fondo verde claro, icono checkmark, mensaje positivo
- Si hay: Ver diseño #5

**Tabs (ancho completo):**
- Indicaciones | Dosificación | Contraindicaciones | Efectos Secundarios | Mecanismo
- Tab activo: Borde inferior azul grueso
- Contenido en cards con iconos:
  - Indicaciones: ✓ verde
  - Dosificación: ℹ️ azul
  - Contraindicaciones: ✗ rojo
  - Efectos: ⚠️ ámbar
  - Mecanismo: 🛡️ púrpura

---

### 5. ALERTA DE INTERACCIÓN (Card Expandible)

**Estado Colapsado:**
- Borde izquierdo grueso (4px) según severidad:
  * GRAVE: Rojo (#ef4444)
  * MODERADA: Ámbar (#f59e0b)
  * LEVE: Amarillo (#eab308)
- Fondo del mismo color pero muy claro (50 opacity)
- Header con:
  * Badge severidad: "GRAVE - EVITAR" (rojo), "MODERADA - MONITOREAR" (ámbar), 
    "LEVE - PRECAUCIÓN" (amarillo)
  * Badge tipo: "FARMACOCINÉTICA" o "FARMACODINÁMICA"
  * Título: "Hierba de San Juan + Warfarina"
  * Descripción corta: "Disminución del efecto anticoagulante..."
  * Icono ▼ (derecha)

**Estado Expandido:**
- Animación suave de apertura
- Borde superior separador
- Secciones con iconos:
  1. ℹ️ Mecanismo de Interacción
  2. ⚠️ Consecuencia Clínica
  3. ✓ Recomendación (destacado con fondo blanco/gris)
  4. Badge "Evidencia: ALTA/MODERADA/BAJA"
  5. Links a referencias científicas (icono ExternalLink)

Icono ▼ rota 180° cuando expande

---

### 6. DASHBOARD CON TABS DUALES

**Header del Dashboard:**
- Título: "Mi Panel de Tratamientos"
- Badge de preferencia actual: "🌿💊 Medicina Integrativa"

**Tabs Horizontales:**
```
[🌿 Mis Plantas (5)] [💊 Mis Medicamentos (3)] [⚠️ Alertas de Interacciones (2)]
```
- Tab activo: Fondo del color correspondiente (verde/azul/rojo)
- Badge con contador
- Animación de deslizamiento al cambiar tab

**Contenido Tab "Mis Plantas":**
- Grid de tarjetas verdes
- Cada planta con badge "⚠️" si tiene interacciones

**Contenido Tab "Mis Medicamentos":**
- Grid de tarjetas azules
- Cada medicamento con:
  * Nombre
  * Dosis: "500mg"
  * Frecuencia: "Cada 8 horas"
  * Fecha inicio: "Desde: 15/10/2025"
  * Badge "⚠️ 2 interacciones"
  * Botones: Editar, Eliminar

**Contenido Tab "Alertas":**
- Lista de todas las interacciones detectadas
- Agrupadas por severidad (GRAVE primero)
- Expandibles igual que diseño #5

---

### 7. GESTOR DE MEDICAMENTOS (Modal)

**Modal Grande (600px ancho):**

**Header:**
- Título: "Agregar Medicamento"
- Icono píldora
- Botón cerrar (X)

**Formulario:**
1. **Campo Medicamento:**
   - Label: "Medicamento *"
   - Select con búsqueda (Combobox)
   - Placeholder: "Buscar medicamento..."
   - Dropdown muestra: Nombre + Principio activo

2. **Campo Dosis:**
   - Label: "Dosis *"
   - Input texto
   - Placeholder: "Ej: 500mg, 1 tableta, 10ml"

3. **Campo Frecuencia:**
   - Label: "Frecuencia *"
   - Select:
     * Diario
     * Cada 8 horas
     * Cada 12 horas
     * Cada 24 horas
     * Según necesidad
     * Otro (abre input adicional)

4. **Campo Fecha Inicio:**
   - Label: "Fecha de inicio"
   - Date picker
   - Valor por defecto: Hoy

5. **Campo Notas:**
   - Label: "Notas adicionales (opcional)"
   - Textarea (3 líneas)
   - Placeholder: "Ej: Tomar con alimentos, evitar alcohol..."
   - Contador: "0/200"

**Footer:**
- Botón "Cancelar" (gris, outline)
- Botón "Guardar Medicamento" (azul, filled)

---

### 8. COMPARADOR DE TRATAMIENTOS (Futuro)

**Layout Split 50/50:**

**Lado Izquierdo (Verde):**
- Header: "🌿 Tratamiento Natural"
- Planta: Manzanilla
- Propiedades
- Dosis recomendada
- Evidencia científica
- Precio estimado

**Lado Derecho (Azul):**
- Header: "💊 Tratamiento Convencional"
- Medicamento: Omeprazol
- Indicaciones
- Dosis estándar
- Estudios clínicos
- Precio estimado

**Centro (Línea divisoria):**
- Icono "VS"
- Badges comparativos:
  * Efectividad
  * Seguridad
  * Costo
  * Tiempo de acción
  * Efectos secundarios

---

ESPECIFICACIONES GENERALES:
- Estilo: Moderno, limpio, profesional médico
- Tipografía: Inter o similar (sans-serif)
- Espaciado: Generoso (padding 16-24px en cards)
- Bordes: Redondeados (8-12px)
- Sombras: Sutiles (shadow-md en reposo, shadow-xl en hover)
- Iconos: Lucide React (outline style)
- Responsive: Mobile-first design
- Accesibilidad: Alto contraste, tamaños de fuente legibles (min 14px)

ELEMENTOS DE CONFIANZA:
- Mostrar "Basado en evidencia científica" en footer
- Incluir referencias a PubMed, FDA, Cochrane
- Disclaimer visible: "Consulta siempre con tu médico"
- Iconos de seguridad (escudo, candado)

GENERA MOCKUPS DE LAS 8 PANTALLAS CON ESTE NIVEL DE DETALLE.
```

---

## NOTAS DE USO

**Para Stitch AI:**
1. Copia el PROMPT 1
2. Pégalo en Stitch AI
3. Revisa el código generado
4. Ajusta según necesites
5. Integra en el proyecto

**Para Herramientas de Diseño:**
1. Copia el PROMPT 2
2. Úsalo en V0, Figma AI, o similar
3. Genera los mockups
4. Exporta imágenes o código
5. Úsalas como referencia visual

**Tips:**
- Puedes modificar los prompts para componentes específicos
- Agrega más detalles si necesitas funcionalidad específica
- Combina ambos prompts para workflow completo: Diseño → Código
