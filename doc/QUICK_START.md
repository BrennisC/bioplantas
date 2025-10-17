# 🚀 GUÍA RÁPIDA - Registro con Código Admin

## ✅ PROBLEMA RESUELTO

El error de conexión está solucionado. Ahora el código **`juniorSPE.2004`** funciona correctamente.

---

## 📱 CÓMO REGISTRARTE COMO ADMIN

### **Paso 1:** Ve a la página de registro
```
http://localhost:8080/register
```

### **Paso 2:** Click en el botón con escudo 🛡️
```
"¿Tienes un código de administrador?"
```

### **Paso 3:** Ingresa el código
```
juniorSPE.2004
```

### **Paso 4:** Completa el formulario
- **Nombre:** Tu nombre completo
- **Email:** admin@bioplantas.com (o el que quieras)
- **Contraseña:** Mínimo 6 caracteres
- **Confirmar contraseña:** La misma

### **Paso 5:** Click en "Registrarse"

✅ **¡Listo!** Tu cuenta de administrador está creada.

---

## 🔐 TU CÓDIGO

```
juniorSPE.2004
```

**IMPORTANTE:**
- ✅ Guárdalo en un lugar seguro
- ❌ No lo compartas públicamente
- ✅ Úsalo para crear cuentas admin

---

## 🧪 PRUEBA RÁPIDA

### **Test 1: Usuario Normal**
1. Ve a `/register`
2. NO hagas click en "¿Tienes código de admin?"
3. Completa y registra
4. ✅ Rol: `user`

### **Test 2: Administrador**
1. Ve a `/register`
2. Click en "¿Tienes código de admin?"
3. Ingresa `juniorSPE.2004`
4. Completa y registra
5. ✅ Rol: `admin`

---

## 📊 DIFERENCIAS

| Usuario Normal | Administrador |
|----------------|---------------|
| Sin código | Con código `juniorSPE.2004` |
| Rol: `user` | Rol: `admin` |
| Solo explorar | Panel admin + CRUD plantas |

---

## ⚠️ NOTAS IMPORTANTES

### **Seguridad Actual:**
- ✅ Funciona correctamente
- ⚠️ Validación en frontend (menos seguro)
- ⚠️ Sin rate limiting por ahora

### **Para Producción:**
Cuando quieras máxima seguridad, migra a Edge Function (ver `ADMIN_ROLE_SETUP.md`)

---

## 🐛 SI ALGO NO FUNCIONA

### **"El código no funciona"**
- Verifica que sea exactamente: `juniorSPE.2004` (mayúsculas/minúsculas importan)
- Asegúrate de hacer click en el botón del escudo primero

### **"No veo el campo de código"**
- Click en "¿Tienes un código de administrador?"
- El campo aparecerá abajo

### **"La cuenta se creó pero no soy admin"**
- Cierra sesión
- Elimina la cuenta en Supabase
- Intenta de nuevo con el código

---

✅ **¡Todo listo! Ahora puedes probar tu código admin.**

**Siguiente paso:** Registra tu primera cuenta admin y accede al panel de administración.
