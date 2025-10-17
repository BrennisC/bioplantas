# 🤖 Sistema de IA con Google Gemini - Guía de Configuración

## 📋 Funcionalidades Implementadas

1. **💬 Chatbot de Consultas sobre Plantas**
   - Responde preguntas sobre cuidados de plantas
   - Consulta el catálogo de plantas en tiempo real
   - Historial de conversaciones

2. **📸 Identificación de Plantas por Imagen**
   - Usuario sube foto
   - Gemini identifica la planta
   - Busca coincidencias en el catálogo
   - Sugiere plantas similares

3. **🎯 Recomendador Inteligente**
   - Analiza necesidades del usuario
   - Recomienda plantas del catálogo
   - Considera clima, espacio, experiencia

## 🔑 Paso 1: Obtener API Key de Google Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Click en "Get API Key" o "Create API Key"
4. Copia la API key generada

## 📦 Paso 2: Instalar Dependencias

Ejecuta en tu terminal:

```bash
pnpm add @google/generative-ai
pnpm add -D @types/node
```

## 🔐 Paso 3: Configurar Variables de Entorno

Abre tu archivo `.env` y añade:

```env
GEMINI_API_KEY=tu-api-key-aquí
```

## 📊 Paso 4: Ejecutar Script SQL

Ejecuta el archivo `supabase-ai-chat-schema.sql` en tu Supabase Dashboard para crear:
- Tabla `ai_conversations` (historial de chats)
- Tabla `ai_plant_identifications` (historial de identificaciones)
- RLS policies para seguridad

## 🚀 Cómo Usar el Sistema

### Para Usuarios:
1. **Chat**: Click en el botón flotante de IA (esquina inferior derecha)
2. **Identificar**: En el chat, usa el botón de cámara para subir imagen
3. **Recomendaciones**: Pregunta "¿Qué planta me recomiendas para..."

### Para Desarrolladores:
- Backend: `/api/ai/chat` - Endpoint de chat
- Backend: `/api/ai/identify-plant` - Identificación por imagen
- Backend: `/api/ai/recommend` - Recomendaciones personalizadas

## 💰 Límites y Costos

**Google Gemini Free Tier:**
- 60 requests por minuto
- 1,500 requests por día
- GRATIS hasta ese límite

El sistema incluye:
- Rate limiting automático
- Caché de respuestas comunes
- Manejo de errores

## 🎨 UI Implementada

- Botón flotante con icono de IA
- Chat drawer elegante (lateral)
- Input con botón de cámara
- Preview de imágenes
- Typing indicators
- Markdown support en respuestas

## 📝 Ejemplos de Uso

**Preguntas al Chat:**
- "¿Cómo cuido una suculenta?"
- "¿Qué plantas son buenas para interiores?"
- "Mi planta tiene hojas amarillas, ¿qué hago?"

**Identificación:**
- Sube foto → Gemini identifica → Muestra plantas del catálogo

**Recomendaciones:**
- "Busco plantas para clima tropical, poco riego"
- "Necesito plantas de sombra para principiantes"

---

✅ **Archivos creados:**
- `supabase-ai-chat-schema.sql` - Base de datos
- `server/routes/ai-chat.ts` - Endpoint de chat
- `server/routes/ai-identify.ts` - Identificación de plantas
- `server/routes/ai-recommend.ts` - Recomendaciones
- `client/modules/ai/AIChatBot.tsx` - Componente principal
- `client/modules/ai/AIChatDrawer.tsx` - UI del chat
- `client/modules/ai/PlantIdentifier.tsx` - Identificador de imágenes

🔜 **Próximos pasos:** Ver `AI_IMPLEMENTATION_COMPLETE.md` cuando todo esté listo.
