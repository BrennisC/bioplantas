# 🔑 Cómo Obtener tu Supabase Service Role Key

## ⚠️ IMPORTANTE: El sistema de IA NO funcionará sin esta key

## 📍 Pasos (2 minutos):

### 1. Ve a tu Supabase Dashboard
```
https://supabase.com/dashboard
```

### 2. Selecciona tu proyecto
- Click en tu proyecto: **qzzyjzfxwuaasnfoslud**

### 3. Ve a Settings
- En el menú lateral izquierdo
- Click en el icono ⚙️ **Settings**

### 4. Ve a API
- En el submenú de Settings
- Click en **API**

### 5. Encuentra "service_role"
Verás una tabla con varias keys:

```
┌─────────────────────────────────────────────────────┐
│ Project API keys                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ anon / public                                       │
│ [una key que empieza con eyJhbGci...]             │
│ ⚠️  Esta NO es la que necesitas                     │
│                                                     │
│ service_role (secret) ← 👈 ESTA ES LA QUE NECESITAS│
│ [otra key que también empieza con eyJhbGci...]    │
│ 🚨 Esta key tiene TODOS los permisos               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 6. Copia la key "service_role"
- Busca la que dice **"service_role"** con la etiqueta **(secret)**
- Click en el botón **"Copy"** o en el icono 📋
- La key debería verse así:
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
  (muy larga, ~300+ caracteres)
  ```

### 7. Pégala en tu archivo .env
Abre: `cosmos-haven/.env`

Reemplaza esta línea:
```env
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

Con:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6enlqemZ4d3VhYXNuZm9zbHVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE4OTUwNywiZXhwIjoyMDc1NzY1NTA3fQ...
```
(pega TU key completa aquí)

### 8. Guarda el archivo .env

### 9. Reinicia el servidor
```bash
# En tu terminal:
Ctrl + C  (para detener el servidor)
pnpm dev  (para reiniciar)
```

## ✅ Verificación

El servidor debería mostrar al iniciar:
```
✅ Sistema de IA configurado correctamente
```

Si en cambio ves:
```
⚠️  SUPABASE_SERVICE_ROLE_KEY no configurada
```
Significa que algo salió mal. Verifica los pasos de nuevo.

## 🔒 Seguridad

**¡NUNCA compartas esta key!**
- Tiene acceso total a tu base de datos
- Solo se usa en el servidor (backend)
- NUNCA la pongas en código del frontend
- NUNCA la subas a GitHub (el archivo .env ya está en .gitignore)

## 🆘 ¿Problemas?

### La key no aparece en Supabase
✅ Verifica que estás en la sección correcta: Settings → API
✅ Busca específicamente "service_role" (no "anon")

### El servidor sigue mostrando warning
✅ Verifica que guardaste el archivo .env
✅ Verifica que no hay espacios extras
✅ Reinicia el servidor (Ctrl+C y pnpm dev)

### "Error: Invalid API key"
✅ Copiaste la key completa (es MUY larga)
✅ No hay saltos de línea en medio de la key
✅ Pegaste en la línea correcta (SUPABASE_SERVICE_ROLE_KEY=...)

---

## 🎯 Resultado Final

Una vez configurada correctamente:
- ✅ El servidor inicia sin warnings
- ✅ El botón flotante de IA aparece
- ✅ El chat funciona correctamente
- ✅ Puedes identificar plantas por imagen
- ✅ Recibes recomendaciones personalizadas

---

**¿Sigues teniendo problemas?** Ejecuta:
```bash
node scripts/test-ai-config.js
```

Este script te mostrará exactamente qué está mal configurado.
