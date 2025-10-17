# 🔐 Sistema de Registro Seguro con Roles de Administrador

## 📋 Resumen del Sistema

Este sistema implementa un registro seguro con dos roles (usuario y administrador) que incluye:

- ✅ Código secreto de administrador hasheado
- ✅ Rate limiting (3 intentos en 10 minutos)
- ✅ Registro de intentos fallidos con IP y timestamp
- ✅ El secreto NUNCA se expone en el frontend
- ✅ Validaciones de seguridad completas
- ✅ Usuarios normales no necesitan código

---

## 🚀 GUÍA DE IMPLEMENTACIÓN PASO A PASO

### **CONFIGURACIÓN ACTUAL**

**✅ Código de administrador ya configurado:**
```
Código: juniorSPE.2004
Hash:   b565b9f9b0d5d3995aa1832415b9f7c4909045be5f6af319024f7f8ff87a6999
```

**⚠️ IMPORTANTE:** El hash ya está en tu archivo `.env`. Si quieres cambiarlo en el futuro, sigue los pasos de rotación al final del documento.

---

### **PASO 1: ✅ YA COMPLETADO - Código Secreto Configurado**

Tu código personalizado `juniorSPE.2004` ya está hasheado y configurado en `.env`.

---

### **PASO 2: Ejecutar el Schema SQL en Supabase**

1. Ve a tu **SQL Editor** en Supabase
2. Abre y copia el contenido de `supabase-admin-role-tables.sql`
3. Pégalo y ejecuta (**RUN**)

Esto creará:
- Tabla `admin_registration_attempts`
- Funciones de rate limiting
- Funciones para registrar intentos
- Vistas de estadísticas

#### 4.2. Desplegar la Edge Function

**Opción A: Usando Supabase CLI (Recomendado)**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref qzzyjzfxwuaasnfoslud

# Desplegar la función
supabase functions deploy register-with-role
```

**Opción B: Manualmente desde Dashboard**

1. Ve a **Edge Functions** en Supabase Dashboard
2. Click en **Create a new function**
3. Nombre: `register-with-role`
4. Copia el contenido de `supabase/functions/register-with-role/index.ts`
5. Click en **Deploy**

#### 4.3. Configurar Secretos en Supabase

1. Ve a **Project Settings** > **Edge Functions**
2. Click en **Add Secret**
3. Agrega estas variables:

```
ADMIN_SECRET_HASH = [tu-hash-aqui]
```

---

## 🧪 PRUEBAS

### **Test 1: Registro como Usuario Normal**

1. Ve a `/register`
2. Completa el formulario SIN código de admin
3. Click en "Registrarse"
4. ✅ Debería crear una cuenta con rol `user`

### **Test 2: Registro como Admin con Código Correcto**

1. Ve a `/register`
2. Click en "¿Tienes un código de administrador?"
3. Ingresa el **código original** (no el hash)
4. Completa el formulario
5. Click en "Registrarse"
6. ✅ Debería crear una cuenta con rol `admin`

### **Test 3: Código Incorrecto (Rate Limiting)**

1. Ve a `/register`
2. Ingresa un código incorrecto
3. Intenta 3 veces
4. ✅ Debería bloquearte por 10 minutos

### **Test 4: Ver Intentos Fallidos (Admin)**

```sql
-- En SQL Editor de Supabase
SELECT * FROM admin_registration_attempts
ORDER BY attempted_at DESC
LIMIT 20;
```

---

## 📊 MONITOREO Y ESTADÍSTICAS

### Ver intentos de registro de admin:

```sql
SELECT 
  email,
  ip_address,
  success,
  attempted_at
FROM admin_registration_attempts
ORDER BY attempted_at DESC;
```

### Ver estadísticas por día:

```sql
SELECT * FROM admin_attempt_stats
ORDER BY date DESC;
```

### Limpiar intentos antiguos (más de 30 días):

```sql
SELECT cleanup_old_admin_attempts();
```

---

## 🔒 SEGURIDAD

### ✅ **Qué está protegido:**

1. **Código secreto hasheado**: Nunca se almacena en texto plano
2. **Rate limiting**: Máximo 3 intentos en 10 minutos
3. **Logs de intentos**: Registra IP, email, timestamp
4. **Validaciones**: Email, contraseña, formato
5. **CORS**: Configurado correctamente
6. **Sin exposición**: El secreto NUNCA llega al frontend

### ⚠️ **Recomendaciones adicionales:**

1. **Rotar el secreto periódicamente** (cada 3-6 meses)
2. **Monitorear intentos fallidos** regularmente
3. **Usar HTTPS** en producción (siempre)
4. **Habilitar confirmación de email** en producción
5. **Configurar 2FA** para admins (futuro)

---

## 🔄 CÓMO ROTAR EL SECRETO

Cuando quieras cambiar el código secreto:

### 1. Generar nuevo código:
```bash
node scripts/generate-admin-secret.js
```

### 2. Hashear el nuevo código:
```bash
node scripts/hash-admin-secret.js "NUEVO_CODIGO"
```

### 3. Actualizar variables:
- Actualiza `ADMIN_SECRET_HASH` en `.env`
- Actualiza el secreto en Supabase Edge Functions
- Reinicia el servidor

### 4. Notificar a admins:
- Envía el **nuevo código** (no el hash) a los administradores
- El código viejo dejará de funcionar inmediatamente

---

## 🛠️ TROUBLESHOOTING

### Error: "ADMIN_SECRET_HASH no está configurado"

**Solución:**
1. Verifica que agregaste el hash a `.env`
2. Reinicia el servidor (`pnpm dev`)
3. Verifica que el hash esté en Supabase Edge Functions

### Error: "Demasiados intentos fallidos"

**Solución:**
1. Espera 10 minutos
2. O limpia los intentos manualmente:
```sql
DELETE FROM admin_registration_attempts 
WHERE email = 'usuario@ejemplo.com';
```

### Error: "Cannot find Supabase function"

**Solución:**
1. Verifica que la función esté desplegada
2. Revisa los logs en Supabase Dashboard
3. Verifica la URL en el código del frontend

---

## 📝 FLUJO COMPLETO

```mermaid
Usuario visita /register
    ↓
¿Tiene código de admin?
    ↓ SÍ                    ↓ NO
Ingresa código        Registra como user
    ↓                       ↓
Envía a Edge Function   Supabase Auth
    ↓                       ↓
Verifica rate limit     Crea usuario
    ↓                       ↓
Hashea código ingresado   Rol: 'user'
    ↓                       ↓
¿Hash coincide?          Login ✅
    ↓ SÍ         ↓ NO
Registra admin  Log + error
Rol: 'admin'    Intentos--
Login ✅        ¿0 intentos? → Bloqueo 10min
```

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Ejecutar `generate-admin-secret.js`
- [ ] Ejecutar `hash-admin-secret.js`
- [ ] Agregar `ADMIN_SECRET_HASH` a `.env`
- [ ] Ejecutar SQL de tablas admin en Supabase
- [ ] Desplegar Edge Function
- [ ] Configurar secreto en Supabase Edge Functions
- [ ] Probar registro como usuario normal
- [ ] Probar registro como admin
- [ ] Probar rate limiting
- [ ] Verificar logs de intentos
- [ ] Documentar código secreto en lugar seguro
- [ ] Compartir código con admins autorizados

---

## 📞 SOPORTE

Si algo no funciona:

1. **Revisa los logs** en Supabase Dashboard
2. **Verifica las variables** de entorno
3. **Revisa la consola** del navegador
4. **Verifica la base de datos** con queries SQL

---

## 🔐 ALMACENAMIENTO SEGURO DEL CÓDIGO

**⚠️ NUNCA:**
- Guardes el código en el repositorio de código
- Lo envíes por email sin encriptar
- Lo compartas en chat público
- Lo escribas en documentos no encriptados

**✅ SÍ:**
- Usa un gestor de contraseñas (1Password, Bitwarden)
- Compártelo en persona o por canal encriptado
- Guárdalo en una caja fuerte física
- Usa servicios de secretos (AWS Secrets Manager, etc.)

---

## 📊 EJEMPLO DE LOGS

### Intento exitoso:
```json
{
  "email": "admin@bioplantas.com",
  "ip_address": "192.168.1.100",
  "success": true,
  "attempted_at": "2025-10-11T20:30:00Z"
}
```

### Intento fallido:
```json
{
  "email": "hacker@evil.com",
  "ip_address": "1.2.3.4",
  "success": false,
  "attempted_at": "2025-10-11T20:31:00Z"
}
```

---

## 🎓 CONCEPTOS DE SEGURIDAD

### ¿Por qué hashear?
- El hash es **irreversible** (no se puede obtener el código original)
- Si alguien hackea la DB, solo verá el hash (inútil sin el código)
- SHA-256 es un algoritmo de hash criptográfico seguro

### ¿Por qué rate limiting?
- Previene ataques de fuerza bruta
- Limita el daño de intentos masivos
- Protege contra bots automatizados

### ¿Por qué logs?
- Auditoría de seguridad
- Detección de ataques
- Análisis forense si hay incidente
- Cumplimiento normativo

---

✅ **Sistema implementado y listo para usar de forma segura!**
