# 🔐 INFORMACIÓN DEL CÓDIGO DE ADMINISTRADOR

## ⚡ RESUMEN RÁPIDO

### **Código de Administrador**
```
juniorSPE.2004
```

### **Hash SHA-256 (ya configurado en .env)**
```
b565b9f9b0d5d3995aa1832415b9f7c4909045be5f6af319024f7f8ff87a6999
```

---

## 📝 CÓMO FUNCIONA

### **Para registrarse como ADMINISTRADOR:**

1. Ve a la página de registro `/register`
2. Click en **"¿Tienes un código de administrador?"** (botón con escudo 🛡️)
3. Se mostrará el campo para ingresar el código
4. Ingresa: `juniorSPE.2004`
5. Completa los demás campos (nombre, email, contraseña)
6. Click en **"Registrarse"**
7. ✅ Tu cuenta se creará con rol **admin**

### **Para registrarse como USUARIO NORMAL:**

1. Ve a la página de registro `/register`
2. NO hagas click en el botón de código de admin
3. Completa los campos (nombre, email, contraseña)
4. Click en **"Registrarse"**
5. ✅ Tu cuenta se creará con rol **user**

---

## 🔒 SEGURIDAD

### **¿Qué pasa si alguien intenta adivinar el código?**

- **Máximo 3 intentos** fallidos cada 10 minutos
- Después de 3 intentos, se **bloquea por 10 minutos**
- Se registra: email, IP, timestamp del intento
- Solo los administradores pueden ver los logs

### **¿Dónde está guardado el código?**

- **El código original** (`juniorSPE.2004`): Solo lo conoces tú y los admins autorizados
- **El hash**: Está en `.env` (servidor) y en Supabase Edge Function
- **NUNCA se expone**: El frontend nunca ve ni el código ni el hash

### **¿Es seguro?**

✅ **SÍ**, porque:
- Se usa **SHA-256** (hash irreversible)
- Hay **rate limiting** (3 intentos/10min)
- Se **registran todos los intentos** fallidos
- El código **nunca viaja al navegador**
- Todo se valida en el **servidor** (Edge Function)

---

## 🎯 PRÓXIMOS PASOS

### ✅ Ya completado:
- [x] Código elegido: `juniorSPE.2004`
- [x] Hash generado
- [x] Hash agregado a `.env`

### 📋 Pendiente:
- [ ] **Ejecutar SQL en Supabase** (crear tabla `admin_registration_attempts`)
- [ ] **Desplegar Edge Function** a Supabase
- [ ] **Configurar hash en Supabase** (secretos de Edge Function)
- [ ] **Probar registro** como usuario normal
- [ ] **Probar registro** como admin con código
- [ ] **Probar rate limiting** (intentar 3 veces con código malo)

---

## 📊 MONITOREO

### Ver intentos de registro de admin:

```sql
-- En SQL Editor de Supabase
SELECT 
  email,
  ip_address,
  success,
  attempted_at
FROM admin_registration_attempts
ORDER BY attempted_at DESC
LIMIT 20;
```

### Ver estadísticas:

```sql
SELECT * FROM admin_attempt_stats
ORDER BY date DESC;
```

---

## 🔄 CÓMO CAMBIAR EL CÓDIGO EN EL FUTURO

Si quieres cambiar `juniorSPE.2004` por otro código:

### 1. Hashear el nuevo código:
```bash
node scripts/hash-admin-secret.js "TU_NUEVO_CODIGO"
```

### 2. Actualizar `.env`:
```env
ADMIN_SECRET_HASH=nuevo_hash_aqui
```

### 3. Actualizar en Supabase:
- Ve a **Project Settings** > **Edge Functions**
- Actualiza el secreto `ADMIN_SECRET_HASH`

### 4. Reiniciar:
```bash
# Detener servidor (Ctrl+C)
pnpm dev
```

---

## ⚠️ SEGURIDAD CRÍTICA

### **NUNCA:**
- ❌ Subas este archivo a GitHub público
- ❌ Compartas el código en chats públicos
- ❌ Escribas el código en código fuente
- ❌ Lo envíes por email sin encriptar

### **SÍ:**
- ✅ Guárdalo en un gestor de contraseñas
- ✅ Compártelo en persona o por canal seguro
- ✅ Usa este código para crear tu primera cuenta admin
- ✅ Luego puedes cambiar el código si quieres

---

## 🎓 PREGUNTAS FRECUENTES

### **¿Puedo tener múltiples códigos de admin?**
No con este sistema. Solo hay un código compartido por todos los admins. Si quieres múltiples códigos, necesitarías una tabla de códigos válidos.

### **¿El código expira?**
No, el código es permanente hasta que lo cambies manualmente.

### **¿Puedo ver quién intentó registrarse como admin?**
Sí, revisa la tabla `admin_registration_attempts` en Supabase.

### **¿Qué pasa si olvido el código?**
Tienes este archivo `ADMIN_CODE_INFO.md` y también está en tu gestor de contraseñas (espero 😉).

### **¿Puedo tener un código más corto?**
Sí, pero el sistema requiere mínimo 12 caracteres por seguridad. `juniorSPE.2004` tiene 15 caracteres, perfecto.

---

✅ **Tu código `juniorSPE.2004` está listo para usar!**

**Siguiente paso:** Ejecutar el SQL en Supabase y desplegar la Edge Function.
