# 🌿 Plan de Funcionalidades para Usuario - BioPlantas

## 📋 Resumen
Este documento detalla todas las funcionalidades que deben implementarse para la experiencia del usuario final en BioPlantas.

---

## 🎯 Funcionalidades Principales

### 1. 🏠 Página de Inicio Mejorada
**Estado:** ⏳ Pendiente  
**Prioridad:** 🔴 Alta

**Características:**
- [ ] Hero section con búsqueda destacada
- [ ] Plantas destacadas / más populares (carrusel)
- [ ] Categorías principales con iconos
- [ ] Estadísticas del sitio (total plantas, usuarios activos, etc.)
- [ ] Testimonios o casos de uso
- [ ] Call-to-action para registro

**Componentes necesarios:**
- `client/pages/Index.tsx` (actualizar)
- `client/components/HeroSection.tsx` (nuevo)
- `client/components/FeaturedPlants.tsx` (nuevo)
- `client/components/CategoryGrid.tsx` (nuevo)

---

### 2. 🔍 Sistema de Búsqueda y Filtros Avanzados
**Estado:** ⏳ Pendiente  
**Prioridad:** 🔴 Alta

**Características:**
- [ ] Búsqueda por nombre común
- [ ] Búsqueda por nombre científico
- [ ] Filtro por categoría (Hierbas, Árboles, etc.)
- [ ] Filtro por propiedades medicinales
- [ ] Filtro por tags/etiquetas
- [ ] Filtro por dolencias/ailments
- [ ] Orden por: nombre, popularidad, fecha añadida
- [ ] Resultados con paginación o scroll infinito
- [ ] Búsqueda predictiva (autocomplete)

**Componentes necesarios:**
- `client/modules/plants/PlantSearch.tsx` (nuevo)
- `client/modules/plants/PlantFilters.tsx` (nuevo)
- `client/modules/plants/SearchResults.tsx` (nuevo)

---

### 3. 📄 Página de Detalle de Planta
**Estado:** ⏳ Pendiente  
**Prioridad:** 🔴 Alta

**Características:**
- [ ] Imagen principal grande con galería
- [ ] Nombre común y científico
- [ ] Descripción completa
- [ ] Categoría y tags
- [ ] Propiedades medicinales (lista visual)
- [ ] Dolencias que trata
- [ ] **Botón de artículo científico** 🔬 (con link externo)
- [ ] Botón de favorito (❤️)
- [ ] Contador de favoritos
- [ ] Sección de comentarios
- [ ] Plantas relacionadas/similares
- [ ] Botón para compartir en redes sociales
- [ ] Información de precauciones/contraindicaciones

**Componentes necesarios:**
- `client/pages/PlantDetail.tsx` (nuevo)
- `client/modules/plants/PlantInfo.tsx` (nuevo)
- `client/modules/plants/PlantProperties.tsx` (nuevo)
- `client/modules/plants/PlantComments.tsx` (nuevo)
- `client/modules/plants/RelatedPlants.tsx` (nuevo)

---

### 4. 💬 Sistema de Comentarios
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟡 Media

**Características:**
- [ ] Ver todos los comentarios de una planta
- [ ] Agregar comentario (solo usuarios autenticados)
- [ ] Editar propio comentario
- [ ] Eliminar propio comentario
- [ ] Respuestas a comentarios (threading)
- [ ] Reacciones/likes a comentarios
- [ ] Orden por: recientes, más votados
- [ ] Paginación de comentarios
- [ ] Notificación cuando alguien responde tu comentario
- [ ] Reportar comentarios inapropiados

**Componentes necesarios:**
- `client/modules/comments/CommentList.tsx` (nuevo)
- `client/modules/comments/CommentForm.tsx` (nuevo)
- `client/modules/comments/CommentItem.tsx` (nuevo)

---

### 5. ❤️ Sistema de Favoritos
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟡 Media

**Características:**
- [ ] Agregar/quitar plantas de favoritos
- [ ] Ver lista de plantas favoritas en perfil
- [ ] Contador de favoritos por planta
- [ ] Indicador visual de "Ya es favorito"
- [ ] Acceso rápido a favoritos desde navbar
- [ ] Filtrar favoritos por categoría
- [ ] Exportar lista de favoritos (PDF/imagen)
- [ ] Compartir plantas favoritas

**Componentes necesarios:**
- `client/modules/user/FavoritesList.tsx` (nuevo)
- `client/modules/user/FavoriteButton.tsx` (nuevo)

---

### 6. 👤 Perfil de Usuario
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟡 Media

**Características:**
- [ ] Ver información del perfil
- [ ] Editar información básica (nombre, avatar)
- [ ] Cambiar contraseña
- [ ] Ver plantas favoritas
- [ ] Ver historial de comentarios
- [ ] Estadísticas personales (plantas guardadas, comentarios, etc.)
- [ ] Configuración de notificaciones
- [ ] Preferencias de privacidad
- [ ] Eliminar cuenta

**Componentes necesarios:**
- `client/pages/Profile.tsx` (nuevo)
- `client/modules/user/ProfileEditor.tsx` (nuevo)
- `client/modules/user/UserStats.tsx` (nuevo)
- `client/modules/user/AccountSettings.tsx` (nuevo)

---

### 7. 📚 Explorador de Plantas (Catálogo)
**Estado:** ⏳ Pendiente  
**Prioridad:** 🔴 Alta

**Características:**
- [ ] Grid/Lista de todas las plantas
- [ ] Vistas: Grid, Lista, Tarjetas
- [ ] Filtros laterales colapsables
- [ ] Quick view (modal rápido con info básica)
- [ ] Paginación o infinite scroll
- [ ] Contador de resultados
- [ ] Breadcrumbs de navegación
- [ ] Guardar búsquedas/filtros favoritos

**Componentes necesarios:**
- `client/pages/Explore.tsx` (nuevo)
- `client/modules/plants/PlantGrid.tsx` (nuevo)
- `client/modules/plants/PlantList.tsx` (nuevo)
- `client/modules/plants/QuickView.tsx` (nuevo)

---

### 8. 🏷️ Páginas por Categoría
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟢 Baja

**Características:**
- [ ] Página dedicada para cada categoría
- [ ] Descripción de la categoría
- [ ] Plantas de esa categoría
- [ ] Filtros específicos de la categoría
- [ ] Plantas destacadas de la categoría

**Componentes necesarios:**
- `client/pages/Category.tsx` (nuevo)
- `client/modules/plants/CategoryHeader.tsx` (nuevo)

---

### 9. 🔔 Sistema de Notificaciones In-App
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟢 Baja

**Características:**
- [ ] Centro de notificaciones (dropdown)
- [ ] Notificación cuando admin envía anuncio
- [ ] Notificación cuando alguien responde tu comentario
- [ ] Notificación de nuevas plantas en categorías favoritas
- [ ] Marcar como leído/no leído
- [ ] Eliminar notificaciones
- [ ] Badge con contador en navbar
- [ ] Configuración de qué notificaciones recibir

**Componentes necesarios:**
- `client/modules/notifications/NotificationCenter.tsx` (nuevo)
- `client/modules/notifications/NotificationItem.tsx` (nuevo)
- `client/modules/notifications/NotificationBadge.tsx` (nuevo)

---

### 10. 📱 Modo Responsive y PWA
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟡 Media

**Características:**
- [ ] Diseño totalmente responsive (mobile, tablet, desktop)
- [ ] Navegación móvil optimizada (hamburger menu)
- [ ] PWA: Instalable como app
- [ ] Service Worker para cache offline
- [ ] Manifest.json configurado
- [ ] Touch gestures para móvil
- [ ] Imágenes optimizadas para móvil

**Archivos necesarios:**
- `public/manifest.json` (nuevo)
- `client/service-worker.ts` (nuevo)
- Actualizar estilos para mobile-first

---

### 11. 🌓 Tema Oscuro/Claro (Ya existe)
**Estado:** ✅ Completado  
**Prioridad:** ✅ Hecho

**Características:**
- [x] Toggle de tema
- [x] Persistencia de preferencia
- [x] Colores optimizados
- [x] Transiciones suaves

---

### 12. 🎨 Página "Acerca de"
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟢 Baja

**Características:**
- [ ] Historia del proyecto
- [ ] Misión y visión
- [ ] Equipo (si aplica)
- [ ] Contacto
- [ ] FAQ
- [ ] Términos y condiciones
- [ ] Política de privacidad

**Componentes necesarios:**
- `client/pages/About.tsx` (nuevo)
- `client/pages/FAQ.tsx` (nuevo)
- `client/pages/Contact.tsx` (nuevo)

---

### 13. 🔐 Mejoras de Autenticación
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟡 Media

**Características:**
- [ ] Recuperación de contraseña
- [ ] Confirmación de email
- [ ] Login con Google/Facebook (OAuth)
- [ ] Verificación de cuenta
- [ ] Re-envío de email de verificación
- [ ] Bloqueo de cuenta tras intentos fallidos

**Componentes necesarios:**
- `client/modules/auth/ForgotPassword.tsx` (nuevo)
- `client/modules/auth/ResetPassword.tsx` (nuevo)
- `client/modules/auth/VerifyEmail.tsx` (nuevo)

---

### 14. 🎯 Sistema de Recomendaciones
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟢 Baja

**Características:**
- [ ] "Plantas que te pueden gustar" (basado en favoritos)
- [ ] "Usuarios también vieron..."
- [ ] Plantas según dolencias del usuario
- [ ] Algoritmo de similitud entre plantas
- [ ] Personalización basada en historial

**Componentes necesarios:**
- `client/modules/plants/Recommendations.tsx` (nuevo)
- Lógica de ML básica o reglas simples

---

### 15. 📊 Estadísticas Públicas
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟢 Baja

**Características:**
- [ ] Plantas más populares (público)
- [ ] Categorías más vistas
- [ ] Tendencias del mes
- [ ] Nube de tags
- [ ] Gráficos públicos

**Componentes necesarios:**
- `client/pages/Stats.tsx` (nuevo)
- `client/modules/stats/PublicCharts.tsx` (nuevo)

---

### 16. 🌍 Internacionalización (i18n)
**Estado:** ⏳ Pendiente  
**Prioridad:** 🟢 Baja (Futuro)

**Características:**
- [ ] Soporte multi-idioma (ES, EN, PT)
- [ ] Selector de idioma
- [ ] Contenido traducido
- [ ] Detección automática de idioma del navegador

**Librerías sugeridas:**
- `react-i18next`
- `i18next`

---

## 🗂️ Estructura de Carpetas Sugerida

```
client/
├── pages/
│   ├── Index.tsx (Home - actualizar)
│   ├── Explore.tsx (Catálogo - NUEVO)
│   ├── PlantDetail.tsx (Detalle - NUEVO)
│   ├── Profile.tsx (Perfil - NUEVO)
│   ├── Category.tsx (Por categoría - NUEVO)
│   ├── About.tsx (Acerca de - NUEVO)
│   ├── FAQ.tsx (Preguntas - NUEVO)
│   ├── Contact.tsx (Contacto - NUEVO)
│   └── NotFound.tsx (Ya existe)
│
├── modules/
│   ├── plants/
│   │   ├── PlantCard.tsx (Ya existe)
│   │   ├── PlantGrid.tsx (NUEVO)
│   │   ├── PlantList.tsx (NUEVO)
│   │   ├── PlantSearch.tsx (NUEVO)
│   │   ├── PlantFilters.tsx (NUEVO)
│   │   ├── PlantInfo.tsx (NUEVO)
│   │   ├── PlantProperties.tsx (NUEVO)
│   │   ├── RelatedPlants.tsx (NUEVO)
│   │   ├── QuickView.tsx (NUEVO)
│   │   └── Recommendations.tsx (NUEVO)
│   │
│   ├── user/
│   │   ├── FavoritesList.tsx (NUEVO)
│   │   ├── FavoriteButton.tsx (NUEVO)
│   │   ├── ProfileEditor.tsx (NUEVO)
│   │   ├── UserStats.tsx (NUEVO)
│   │   └── AccountSettings.tsx (NUEVO)
│   │
│   ├── comments/
│   │   ├── CommentList.tsx (NUEVO)
│   │   ├── CommentForm.tsx (NUEVO)
│   │   └── CommentItem.tsx (NUEVO)
│   │
│   ├── notifications/
│   │   ├── NotificationCenter.tsx (NUEVO)
│   │   ├── NotificationItem.tsx (NUEVO)
│   │   └── NotificationBadge.tsx (NUEVO)
│   │
│   └── auth/
│       ├── Login.tsx (Ya existe)
│       ├── Register.tsx (Ya existe)
│       ├── ForgotPassword.tsx (NUEVO)
│       ├── ResetPassword.tsx (NUEVO)
│       └── VerifyEmail.tsx (NUEVO)
│
└── components/
    ├── HeroSection.tsx (NUEVO)
    ├── FeaturedPlants.tsx (NUEVO)
    ├── CategoryGrid.tsx (NUEVO)
    └── ShareButtons.tsx (NUEVO)
```

---

## 🎯 Roadmap Sugerido (Fases)

### 📍 Fase 1: Core Básico (Sprint 1-2)
1. Explorador de plantas con búsqueda básica
2. Página de detalle de planta
3. Sistema de favoritos
4. Perfil de usuario básico

### 📍 Fase 2: Interacción (Sprint 3-4)
1. Sistema de comentarios completo
2. Filtros avanzados
3. Notificaciones in-app
4. Mejoras de responsive

### 📍 Fase 3: Experiencia (Sprint 5-6)
1. Recomendaciones
2. Páginas informativas (About, FAQ)
3. PWA configuration
4. Estadísticas públicas

### 📍 Fase 4: Avanzado (Futuro)
1. OAuth (Google/Facebook)
2. Internacionalización
3. Sistema de reputación
4. API pública

---

## 💡 Consideraciones Técnicas

### Base de Datos (Supabase)
Tablas actuales:
- ✅ `users`
- ✅ `plants`
- ✅ `favorites`
- ✅ `comments`

Tablas nuevas necesarias:
- ⏳ `notifications` - Notificaciones in-app
- ⏳ `user_preferences` - Preferencias del usuario
- ⏳ `search_history` - Historial de búsquedas
- ⏳ `plant_views` - Tracking de vistas de plantas

### Políticas RLS (Row Level Security)
- ✅ Configurar permisos por rol
- ✅ Usuarios solo pueden editar sus datos
- ✅ Comentarios pueden ser editados por su autor o admin

### Performance
- 🎯 Lazy loading de imágenes
- 🎯 Code splitting por rutas
- 🎯 Cache de búsquedas frecuentes
- 🎯 Optimización de queries con índices

---

## 📝 Notas Importantes

1. **Todo debe ser dinámico**: Cargar datos desde Supabase, no hardcodear
2. **Mobile-first**: Diseñar primero para móvil, luego desktop
3. **Accesibilidad**: ARIA labels, navegación por teclado, contraste adecuado
4. **SEO**: Meta tags, Open Graph, sitemap.xml
5. **Testing**: Tests unitarios para componentes críticos
6. **Documentación**: Comentarios en código complejo

---

## ✅ Checklist de Implementación

Al implementar cada funcionalidad, verificar:
- [ ] Funciona en mobile y desktop
- [ ] Maneja errores correctamente
- [ ] Tiene loading states
- [ ] Datos vienen de Supabase
- [ ] RLS configurado
- [ ] Diseño consistente con el resto
- [ ] Accesible (keyboard, screen readers)
- [ ] Performance optimizada

---

**Última actualización:** 12 de Octubre, 2025  
**Estado general:** 10% completado (Admin panel listo, usuario pendiente)
