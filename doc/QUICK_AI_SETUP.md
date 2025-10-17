# 🚀 Guía Rápida - Activar Sistema de IA en 5 Minutos

## ✅ Paso 1: Dependencias Instaladas

Ya se ejecutó automáticamente:
```bash
✅ pnpm add @google/generative-ai react-markdown
```

## 🔑 Paso 2: Obtener API Key de Google Gemini

1. **Abre este link:** https://makersuite.google.com/app/apikey
2. **Inicia sesión** con tu cuenta de Google
3. **Click en** "Create API Key" o "Get API Key"
4. **Copia** la API key generada (empieza con `AIza...`)

## 🔐 Paso 3: Obtener Supabase Service Role Key

1. **Ve a:** Tu Supabase Dashboard
2. **Click en:** Settings (⚙️) → API
3. **Busca:** "service_role" key (la que dice "secret")
4. **Copia** esa key (¡NO la "anon" key!)

## 📝 Paso 4: Configurar .env

Abre tu archivo `.env` en la raíz del proyecto y añade estas líneas:

```env
# ============================================
# GOOGLE GEMINI AI
# ============================================
GEMINI_API_KEY=pega-tu-api-key-aquí

# ============================================
# SUPABASE SERVICE ROLE KEY (Backend)
# ============================================
SUPABASE_SERVICE_ROLE_KEY=pega-tu-service-role-key-aquí
```

**Ejemplo real:**
```env
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
```

## 💾 Paso 5: Ejecutar Script SQL

1. **Ve a:** Tu Supabase Dashboard
2. **Click en:** SQL Editor (en el menú lateral)
3. **Click en:** "New Query"
4. **Copia TODO el contenido** del archivo: `supabase-ai-chat-schema.sql`
5. **Pégalo** en el editor
6. **Click en:** "Run" (▶️)
7. **Verifica:** Que diga "Success. No rows returned" (esto es bueno!)

## 🔄 Paso 6: Reiniciar Servidor

En tu terminal:

```bash
# 1. Detener el servidor actual
Presiona: Ctrl + C

# 2. Reiniciar
pnpm dev
```

## 🎉 Paso 7: ¡Probarlo!

1. **Ve a tu aplicación** en el navegador
2. **Busca** el botón flotante verde en la esquina inferior derecha 🤖
3. **Click** en el botón
4. **Verás** el chat abrirse con mensaje de bienvenida
5. **Escribe:** "¿Qué plantas me recomiendas?"
6. **¡Listo!** Cosmos AI responderá

## 🧪 Pruebas Recomendadas

### Test 1: Chat Normal
```
Usuario: "¿Cómo cuido una suculenta?"
Cosmos AI: [Respuesta detallada sobre cuidados]
```

### Test 2: Identificación por Imagen
```
1. Click en botón de cámara 📷
2. Sube foto de una planta
3. Espera identificación automática
4. Ve resultados con plantas similares del catálogo
```

### Test 3: Recomendaciones
```
Usuario: "Necesito plantas para interiores con poca luz"
Cosmos AI: [Lista de plantas del catálogo con justificación]
```

## ✅ Verificación de que Todo Funciona

Checkea estos puntos:

- [ ] Botón flotante verde aparece en esquina inferior derecha
- [ ] Click en botón abre el chat drawer
- [ ] Mensaje de bienvenida de Cosmos AI aparece
- [ ] Puedes escribir y enviar mensajes
- [ ] Cosmos AI responde (puede tardar 2-5 segundos)
- [ ] Botón de cámara 📷 funciona
- [ ] Puedes subir imágenes
- [ ] Admin puede ver pestaña "IA Analytics" en Dashboard

## 🐛 Si Algo No Funciona

### Error: "API key no configurada"
❌ **Problema:** Falta la API key de Gemini
✅ **Solución:** 
   1. Verifica que `.env` tenga `GEMINI_API_KEY=...`
   2. Reinicia el servidor (Ctrl+C, luego `pnpm dev`)

### Error: "No se pudo procesar tu mensaje"
❌ **Problema:** API key inválida o límite alcanzado
✅ **Solución:**
   1. Verifica que la API key sea correcta (copiaste bien?)
   2. Ve a https://makersuite.google.com y verifica límites de uso

### Error: RLS Policy en Supabase
❌ **Problema:** No se ejecutó el script SQL
✅ **Solución:**
   1. Ve a Supabase Dashboard → SQL Editor
   2. Ejecuta el script `supabase-ai-chat-schema.sql` completo

### Botón flotante no aparece
❌ **Problema:** Error en el código o falta importación
✅ **Solución:**
   1. Abre consola del navegador (F12)
   2. Busca errores en rojo
   3. Verifica que `AIChatBot` esté en `App.tsx`

### Identificación de imágenes no funciona
❌ **Problema:** Imagen muy grande o formato no soportado
✅ **Solución:**
   1. Usa imágenes < 5MB
   2. Formatos: JPG, PNG, WebP
   3. Comprime la imagen si es necesario

## 📊 Panel de Admin

Como administrador, ahora tienes acceso a:

### Dashboard → IA Analytics
- Total de conversaciones
- Mensajes totales
- Identificaciones realizadas
- Usuarios activos (últimos 30 días)
- Promedio de mensajes por conversación
- Tokens usados
- Actividad reciente en tiempo real

## 💰 Costos

**Google Gemini Free Tier:**
- ✅ 60 requests por minuto
- ✅ 1,500 requests por día
- ✅ 100% GRATIS dentro de esos límites

**Rate Limiting Implementado:**
- ✅ 20 mensajes por hora por usuario
- ✅ Previene abuso automático
- ✅ Mensaje amigable si se excede

## 🎨 Personalización Opcional

Si quieres personalizar colores/textos:

**Cambiar nombre del bot:**
```typescript
// En: client/modules/ai/AIChatDrawer.tsx
// Línea 110: Cambiar "Cosmos AI" por tu nombre
```

**Cambiar mensaje de bienvenida:**
```typescript
// En: client/modules/ai/AIChatDrawer.tsx
// Líneas 55-64: Editar el mensaje inicial
```

**Cambiar colores del botón:**
```typescript
// En: client/modules/ai/AIChatBot.tsx
// Línea 57: Cambiar clases de Tailwind
```

## 📚 Documentación Completa

Para más información, revisa:
- `AI_IMPLEMENTATION_COMPLETE.md` - Documentación técnica completa
- `AI_GEMINI_SETUP.md` - Guía de configuración detallada

## 🎯 Resultado Final

Una vez completados todos los pasos:

✅ Sistema de IA 100% funcional
✅ Chat inteligente con contexto
✅ Identificación de plantas por imagen
✅ Recomendaciones personalizadas
✅ Historial persistente en base de datos
✅ Panel de analytics para admin
✅ Rate limiting activo
✅ Seguro y escalable

---

## 🚀 ¡Ya Está Listo!

Tu aplicación ahora tiene un asistente de IA completo y profesional.

**¿Tienes problemas?** Revisa la sección de troubleshooting arriba.

**¿Todo funciona?** ¡Felicidades! 🎉 Ahora tus usuarios pueden:
- Consultar sobre plantas 🌿
- Identificar plantas por foto 📸
- Recibir recomendaciones personalizadas 💡

---

**Powered by Google Gemini 1.5 Flash 🌟**
