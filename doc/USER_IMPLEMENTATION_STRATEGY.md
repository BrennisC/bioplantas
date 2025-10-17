# 🎯 Estrategia de Implementación - Funcionalidades de Usuario

**Fecha:** 12 de Octubre, 2025  
**Objetivo:** Definir el orden de implementación para las funcionalidades de usuario en BioPlantas

---

## 📊 Estado Actual

### ✅ Ya Implementado
- Sistema de autenticación (Login/Register)
- Navbar con toggle de tema
- Footer
- PlantCard básico
- Explorador básico (Explore.tsx)
- Página de inicio (Home.tsx)

### 🔧 Panel Admin Completo (Listo)
- Dashboard con analytics
- Gestión de plantas (CRUD completo con categorías, tags, ailments dinámicos)
- Gestión de usuarios
- Gestión de comentarios
- Gestión de favoritos
- Gestión de categorías (pendiente actualizar para tablas dinámicas)
- Sistema de notificaciones
- Gestor de medios
- Configuración del sitio

---

## 🎯 FASE 1: CORE BÁSICO - Exploración y Visualización
**Duración estimada:** 2-3 días  
**Prioridad:** 🔴 CRÍTICA

### 1.1 Catálogo de Plantas Mejorado (Explore.tsx) ⭐
**Por qué primero:** Es la página principal donde los usuarios verán las plantas

**Funcionalidades:**
- ✅ Grid de plantas (ya existe básico)
- 🔨 Filtros dinámicos por categoría (cargar desde `plant_categories`)
- 🔨 Filtros por tags (cargar desde `plant_tags`)
- 🔨 Filtros por ailments (cargar desde `plant_ailments`)
- 🔨 Búsqueda en tiempo real (nombre común + científico)
- 🔨 Vistas: Grid / Lista
- 🔨 Ordenar por: Nombre, Fecha, Popularidad
- 🔨 Paginación o scroll infinito
- 🔨 Contador de resultados
- 🔨 Loading states

**Componentes a crear:**
```
client/modules/plants/
├── PlantFilters.tsx          (Sidebar con filtros dinámicos)
├── PlantSearchBar.tsx        (Barra de búsqueda con autocomplete)
├── PlantSortDropdown.tsx     (Dropdown para ordenar)
├── ViewToggle.tsx            (Toggle Grid/Lista)
└── PlantGridView.tsx         (Grid optimizado)
```

**Base de datos:**
- ✅ Tabla `plants` (ya existe)
- ✅ Tabla `plant_categories` (schema creado, falta ejecutar)
- ✅ Tabla `plant_tags` (schema creado, falta ejecutar)
- ✅ Tabla `plant_ailments` (schema creado, falta ejecutar)

---

### 1.2 Página de Detalle de Planta ⭐⭐⭐
**Por qué segundo:** Los usuarios necesitan ver información completa de cada planta

**Funcionalidades:**
- 🔨 Imagen grande con fallback
- 🔨 Nombre común y científico
- 🔨 Descripción completa
- 🔨 Categoría con badge
- 🔨 Tags con badges (cargados dinámicamente)
- 🔨 Ailments que trata (cargados dinámicamente)
- 🔨 Propiedades medicinales (lista formateada)
- 🔨 **Botón de artículo científico** 🔬 (si existe)
- 🔨 Botón de favorito ❤️ (agregar/quitar)
- 🔨 Contador de favoritos
- 🔨 Breadcrumbs (Home > Explorar > [Categoría] > [Planta])
- 🔨 Botones de compartir (redes sociales)
- 🔨 Plantas relacionadas (misma categoría/tags similares)

**Componentes a crear:**
```
client/pages/
└── PlantDetail.tsx           (Página principal)

client/modules/plants/
├── PlantHeader.tsx           (Hero con imagen + nombre)
├── PlantInfo.tsx             (Información principal)
├── PlantProperties.tsx       (Propiedades en cards)
├── PlantAilments.tsx         (Dolencias en grid)
├── FavoriteButton.tsx        (Botón de favorito)
├── ShareButtons.tsx          (Botones de compartir)
└── RelatedPlants.tsx         (Carrusel de plantas similares)
```

**Ruta:**
- `/plantas/:id` o `/planta/:slug`

**Base de datos:**
- ✅ Tabla `plants` (ya tiene todos los campos necesarios)
- ✅ Tabla `favorites` (ya existe)

---

### 1.3 Sistema de Favoritos ⭐
**Por qué tercero:** Permite a los usuarios guardar plantas de interés

**Funcionalidades:**
- 🔨 Botón de favorito en PlantCard
- 🔨 Botón de favorito en PlantDetail
- 🔨 Indicador visual de "ya es favorito"
- 🔨 Agregar/quitar favorito (toggle)
- 🔨 Solo usuarios autenticados
- 🔨 Toast de confirmación
- 🔨 Actualización del contador en tiempo real

**Componentes a crear:**
```
client/modules/user/
└── FavoriteButton.tsx        (Botón reutilizable)
```

**Base de datos:**
- ✅ Tabla `favorites` (ya existe)
- ✅ RLS configurado

**Queries necesarios:**
```typescript
// Agregar favorito
await supabase.from('favorites').insert({ user_id, plant_id });

// Quitar favorito
await supabase.from('favorites').delete().match({ user_id, plant_id });

// Verificar si es favorito
const { data } = await supabase
  .from('favorites')
  .select('id')
  .match({ user_id, plant_id })
  .single();

// Contar favoritos de una planta
const { count } = await supabase
  .from('favorites')
  .select('*', { count: 'exact', head: true })
  .eq('plant_id', plantId);
```

---

## 🎯 FASE 2: INTERACCIÓN - Comentarios y Perfil
**Duración estimada:** 3-4 días  
**Prioridad:** 🟡 ALTA

### 2.1 Sistema de Comentarios ⭐⭐
**Por qué:** Permite interacción entre usuarios y feedback sobre plantas

**Funcionalidades:**
- 🔨 Ver comentarios en PlantDetail
- 🔨 Agregar comentario (solo autenticados)
- 🔨 Editar propio comentario
- 🔨 Eliminar propio comentario
- 🔨 Respuestas a comentarios (threading - opcional)
- 🔨 Orden por: Recientes, Más antiguos
- 🔨 Paginación (cargar más)
- 🔨 Contador de comentarios
- 🔨 Avatar del usuario
- 🔨 Timestamp (hace 2 horas, etc.)

**Componentes a crear:**
```
client/modules/comments/
├── CommentSection.tsx        (Contenedor principal)
├── CommentList.tsx           (Lista de comentarios)
├── CommentItem.tsx           (Un comentario individual)
├── CommentForm.tsx           (Formulario para agregar/editar)
└── CommentActions.tsx        (Botones editar/eliminar)
```

**Base de datos:**
- ✅ Tabla `comments` (ya existe)
- ✅ RLS configurado

**Campos de `comments`:**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Para respuestas
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.2 Perfil de Usuario ⭐
**Por qué:** Los usuarios necesitan gestionar su cuenta y ver su actividad

**Funcionalidades:**
- 🔨 Ver información del perfil
- 🔨 Editar nombre y avatar
- 🔨 Cambiar contraseña
- 🔨 **Ver plantas favoritas** (lista con filtros)
- 🔨 Ver comentarios realizados
- 🔨 Estadísticas personales (favoritos, comentarios)
- 🔨 Configuración de notificaciones (on/off)
- 🔨 Eliminar cuenta (con confirmación)

**Componentes a crear:**
```
client/pages/
└── Profile.tsx               (Página con tabs)

client/modules/user/
├── ProfileHeader.tsx         (Avatar + nombre + stats)
├── ProfileEditor.tsx         (Formulario de edición)
├── FavoritesList.tsx         (Grid de favoritos)
├── UserComments.tsx          (Lista de comentarios del usuario)
├── AccountSettings.tsx       (Configuración de cuenta)
└── UserStats.tsx             (Cards con estadísticas)
```

**Ruta:**
- `/perfil` o `/mi-perfil`

**Base de datos:**
- ✅ Tabla `users` (ya existe)
- Agregar campos opcionales:
  - `avatar_url` (URL de imagen)
  - `bio` (texto corto)
  - `preferences` (JSON con configuraciones)

---

## 🎯 FASE 3: MEJORAS DE UX - Home y Búsqueda Avanzada
**Duración estimada:** 2-3 días  
**Prioridad:** 🟢 MEDIA

### 3.1 Página de Inicio Mejorada
**Funcionalidades:**
- 🔨 Hero section con búsqueda destacada
- 🔨 Plantas destacadas (carrusel de más favoritas)
- 🔨 Categorías principales (grid con iconos)
- 🔨 Estadísticas del sitio (total plantas, usuarios)
- 🔨 Call-to-action para registro
- 🔨 Sección "Cómo funciona"

**Componentes a crear:**
```
client/components/
├── HeroSection.tsx           (Hero con búsqueda)
├── FeaturedPlants.tsx        (Carrusel de destacadas)
├── CategoryGrid.tsx          (Grid de categorías)
├── SiteStats.tsx             (Estadísticas)
└── CTASection.tsx            (Llamado a la acción)
```

---

### 3.2 Búsqueda Avanzada y Autocompletado
**Funcionalidades:**
- 🔨 Búsqueda predictiva (autocomplete)
- 🔨 Búsqueda por nombre común
- 🔨 Búsqueda por nombre científico
- 🔨 Búsqueda por propiedades
- 🔨 Historial de búsquedas (opcional)
- 🔨 Sugerencias de búsqueda

**Componentes a actualizar:**
```
client/modules/plants/
└── PlantSearchBar.tsx        (Mejorar con autocomplete)
```

---

## 🎯 FASE 4: NOTIFICACIONES Y RESPONSIVE
**Duración estimada:** 2-3 días  
**Prioridad:** 🟢 BAJA

### 4.1 Sistema de Notificaciones In-App
**Funcionalidades:**
- 🔨 Centro de notificaciones (dropdown en navbar)
- 🔨 Badge con contador de no leídas
- 🔨 Notificación cuando admin envía anuncio
- 🔨 Notificación cuando responden tu comentario
- 🔨 Marcar como leído
- 🔨 Eliminar notificación
- 🔨 Configuración de notificaciones en perfil

**Componentes a crear:**
```
client/modules/notifications/
├── NotificationCenter.tsx    (Dropdown con lista)
├── NotificationItem.tsx      (Item individual)
├── NotificationBadge.tsx     (Badge con contador)
└── NotificationSettings.tsx  (Configuración)
```

**Base de datos:**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'announcement', 'comment_reply', 'new_plant'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(255), -- URL a donde redirigir
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 4.2 Optimización Mobile y PWA
**Funcionalidades:**
- 🔨 Diseño responsive completo
- 🔨 Navegación móvil (hamburger menu)
- 🔨 PWA: manifest.json
- 🔨 Service Worker (cache offline)
- 🔨 Instalable como app
- 🔨 Touch gestures optimizados

**Archivos a crear:**
```
public/
├── manifest.json
└── icons/ (varios tamaños)

client/
└── service-worker.ts
```

---

## 🎯 FASE 5: CONTENIDO Y SEO
**Duración estimada:** 1-2 días  
**Prioridad:** 🟢 BAJA

### 5.1 Páginas Informativas
**Funcionalidades:**
- 🔨 Página "Acerca de"
- 🔨 Página "FAQ"
- 🔨 Página "Contacto"
- 🔨 Página "Términos y Condiciones"
- 🔨 Página "Política de Privacidad"

**Componentes a crear:**
```
client/pages/
├── About.tsx
├── FAQ.tsx
├── Contact.tsx
├── Terms.tsx
└── Privacy.tsx
```

---

## 📋 Checklist de Implementación por Fase

### FASE 1: Core Básico
```
[ ] 1.1.1 - Ejecutar SQL schema en Supabase (categorías, tags, ailments)
[ ] 1.1.2 - Crear PlantFilters.tsx con filtros dinámicos
[ ] 1.1.3 - Crear PlantSearchBar.tsx con búsqueda en tiempo real
[ ] 1.1.4 - Agregar ViewToggle (Grid/Lista) a Explore.tsx
[ ] 1.1.5 - Agregar PlantSortDropdown (ordenar resultados)
[ ] 1.1.6 - Implementar paginación o infinite scroll
[ ] 1.1.7 - Agregar loading states y skeletons
[ ] 1.2.1 - Crear página PlantDetail.tsx con ruta /plantas/:id
[ ] 1.2.2 - Crear PlantHeader.tsx (hero con imagen)
[ ] 1.2.3 - Crear PlantInfo.tsx (información principal)
[ ] 1.2.4 - Crear PlantProperties.tsx (propiedades en cards)
[ ] 1.2.5 - Crear PlantAilments.tsx (dolencias en grid)
[ ] 1.2.6 - Agregar breadcrumbs de navegación
[ ] 1.2.7 - Crear ShareButtons.tsx (compartir en redes)
[ ] 1.2.8 - Crear RelatedPlants.tsx (plantas similares)
[ ] 1.3.1 - Crear FavoriteButton.tsx reutilizable
[ ] 1.3.2 - Integrar FavoriteButton en PlantCard
[ ] 1.3.3 - Integrar FavoriteButton en PlantDetail
[ ] 1.3.4 - Implementar queries de favoritos (add/remove/check)
[ ] 1.3.5 - Agregar contador de favoritos en PlantDetail
[ ] 1.3.6 - Agregar toasts de confirmación
```

### FASE 2: Interacción
```
[ ] 2.1.1 - Crear CommentSection.tsx
[ ] 2.1.2 - Crear CommentList.tsx con paginación
[ ] 2.1.3 - Crear CommentItem.tsx (avatar, timestamp, contenido)
[ ] 2.1.4 - Crear CommentForm.tsx (agregar/editar)
[ ] 2.1.5 - Crear CommentActions.tsx (editar/eliminar)
[ ] 2.1.6 - Integrar CommentSection en PlantDetail
[ ] 2.1.7 - Implementar queries de comentarios (CRUD)
[ ] 2.1.8 - Agregar contador de comentarios
[ ] 2.2.1 - Crear página Profile.tsx con tabs
[ ] 2.2.2 - Crear ProfileHeader.tsx (avatar + stats)
[ ] 2.2.3 - Crear ProfileEditor.tsx (editar info)
[ ] 2.2.4 - Crear FavoritesList.tsx (grid de favoritos del usuario)
[ ] 2.2.5 - Crear UserComments.tsx (comentarios del usuario)
[ ] 2.2.6 - Crear AccountSettings.tsx (cambiar contraseña, eliminar cuenta)
[ ] 2.2.7 - Agregar campos avatar_url y bio a tabla users
[ ] 2.2.8 - Agregar ruta /perfil en App.tsx
```

### FASE 3: Mejoras UX
```
[ ] 3.1.1 - Crear HeroSection.tsx con búsqueda
[ ] 3.1.2 - Crear FeaturedPlants.tsx (carrusel)
[ ] 3.1.3 - Crear CategoryGrid.tsx (categorías principales)
[ ] 3.1.4 - Crear SiteStats.tsx (estadísticas)
[ ] 3.1.5 - Actualizar Index.tsx con nuevos componentes
[ ] 3.2.1 - Agregar autocomplete a PlantSearchBar
[ ] 3.2.2 - Implementar búsqueda por propiedades
[ ] 3.2.3 - Agregar sugerencias de búsqueda
```

### FASE 4: Notificaciones y Mobile
```
[ ] 4.1.1 - Crear tabla notifications en Supabase
[ ] 4.1.2 - Crear NotificationCenter.tsx
[ ] 4.1.3 - Crear NotificationItem.tsx
[ ] 4.1.4 - Crear NotificationBadge.tsx
[ ] 4.1.5 - Integrar NotificationCenter en Navbar
[ ] 4.1.6 - Implementar queries de notificaciones
[ ] 4.1.7 - Conectar notificaciones con NotificationsManager (admin)
[ ] 4.2.1 - Crear manifest.json para PWA
[ ] 4.2.2 - Crear service-worker.ts
[ ] 4.2.3 - Optimizar diseño responsive
[ ] 4.2.4 - Implementar hamburger menu para móvil
```

### FASE 5: Contenido
```
[ ] 5.1.1 - Crear About.tsx
[ ] 5.1.2 - Crear FAQ.tsx con acordeones
[ ] 5.1.3 - Crear Contact.tsx con formulario
[ ] 5.1.4 - Crear Terms.tsx
[ ] 5.1.5 - Crear Privacy.tsx
[ ] 5.1.6 - Agregar enlaces en Footer
[ ] 5.1.7 - Agregar meta tags para SEO
```

---

## 🗄️ Estructura de Datos Completa

### Tablas Existentes
```sql
✅ users (id, email, full_name, role, created_at)
✅ plants (id, name, scientific_name, description, category, properties, image, tags, ailments, scientific_article_url, created_at, updated_at)
✅ favorites (id, user_id, plant_id, created_at)
✅ comments (id, plant_id, user_id, content, created_at, updated_at)
✅ plant_categories (schema creado, falta ejecutar)
✅ plant_tags (schema creado, falta ejecutar)
✅ plant_ailments (schema creado, falta ejecutar)
```

### Tablas Nuevas Necesarias
```sql
⏳ notifications (id, user_id, type, title, message, link, read, created_at)
⏳ user_preferences (id, user_id, notifications_enabled, theme, language)
⏳ plant_views (id, plant_id, user_id, created_at) -- Opcional para analytics
```

---

## 🎨 Componentes UI Reutilizables

Ya disponibles en `client/components/ui/`:
- ✅ Button, Input, Textarea
- ✅ Card, Badge, Avatar
- ✅ Select, Checkbox, Switch
- ✅ Dialog, Sheet, Popover
- ✅ Tabs, Accordion
- ✅ Toast (notificaciones)
- ✅ Skeleton (loading)
- ✅ Carousel (para carruseles)

---

## 🚀 Orden de Implementación Recomendado

### Semana 1: Core Básico (FASE 1)
**Día 1-2:**
1. Ejecutar SQL schema en Supabase ⚡
2. Mejorar Explore.tsx con filtros dinámicos
3. Crear PlantSearchBar con búsqueda en tiempo real

**Día 3-4:**
4. Crear PlantDetail.tsx completo
5. Integrar todos los componentes de PlantDetail
6. Agregar breadcrumbs y botones de compartir

**Día 5:**
7. Implementar sistema de favoritos completo
8. Testing de FASE 1

### Semana 2: Interacción (FASE 2)
**Día 1-2:**
1. Sistema de comentarios completo
2. Integrar en PlantDetail

**Día 3-4:**
3. Página de perfil con todos los tabs
4. Edición de perfil y configuración

**Día 5:**
5. Testing de FASE 2
6. Optimizaciones

### Semana 3: UX y Notificaciones (FASE 3-4)
**Día 1-2:**
1. Mejorar página de inicio
2. Búsqueda avanzada

**Día 3-4:**
3. Sistema de notificaciones
4. Optimización mobile

**Día 5:**
5. PWA setup
6. Testing general

---

## 💡 Consejos de Implementación

### 1. Siempre Dinámico
```typescript
// ❌ NO hacer esto
const categories = ["Hierbas", "Árboles", "Flores"];

// ✅ Hacer esto
const [categories, setCategories] = useState<string[]>([]);
useEffect(() => {
  const fetchCategories = async () => {
    const { data } = await supabase.from('plant_categories').select('name');
    setCategories(data?.map(c => c.name) || []);
  };
  fetchCategories();
}, []);
```

### 2. Loading States
```typescript
// Siempre mostrar skeleton mientras carga
{loading ? (
  <Skeleton className="h-20 w-full" />
) : (
  <PlantCard plant={plant} />
)}
```

### 3. Error Handling
```typescript
// Manejar errores con toasts
try {
  const { error } = await supabase.from('favorites').insert({ ... });
  if (error) throw error;
  toast({ title: "¡Agregado a favoritos!" });
} catch (error) {
  toast({ title: "Error", description: error.message, variant: "destructive" });
}
```

### 4. Mobile First
```tsx
// Diseñar primero para móvil
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

### 5. Accesibilidad
```tsx
// Siempre agregar ARIA labels
<button aria-label="Agregar a favoritos">
  <Heart />
</button>
```

---

## 📝 Próximos Pasos Inmediatos

### 🎯 ACCIÓN 1: Ejecutar SQL Schema
```bash
# Ir a Supabase Dashboard > SQL Editor
# Ejecutar: supabase-categories-tags-schema.sql
```

### 🎯 ACCIÓN 2: Actualizar CategoriesManager
- Permitir CRUD de categorías, tags y ailments
- Usar las nuevas tablas

### 🎯 ACCIÓN 3: Empezar FASE 1
- Mejorar Explore.tsx con filtros dinámicos
- Crear PlantDetail.tsx
- Implementar favoritos

---

**¿Estás listo para empezar con la FASE 1?** 🚀

Podemos comenzar con:
1. Ejecutar el SQL schema en Supabase
2. Mejorar el Explore.tsx con filtros dinámicos
3. Crear la página de detalle de planta

¿Por cuál prefieres empezar?
