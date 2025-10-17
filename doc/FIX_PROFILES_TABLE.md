# 🔧 SOLUCIÓN: Error "Could not find first_name column"

## 📋 El Problema

Tu tabla `profiles` todavía tiene la columna `name` pero necesita `first_name` y `last_name`.

## ✅ La Solución (5 minutos)

### **Paso 1: Ir a Supabase Dashboard**

1. Abre tu proyecto en: https://supabase.com/dashboard
2. Ve a la sección **SQL Editor** (icono de </> en el menú lateral)

### **Paso 2: Ejecutar el Script de Migración**

1. Haz clic en **"New Query"** (botón +)
2. Copia **TODO** el contenido del archivo `migrate-users-table.sql`
3. Pégalo en el editor SQL
4. Haz clic en **"Run"** (▶️ botón verde)

### **Paso 3: Verificar**

Deberías ver un mensaje como:
```
Success. No rows returned
```

O posiblemente:
```
NOTICE: Datos migrados exitosamente de "name" a "first_name" y "last_name"
```

### **Paso 4: Confirmar los Cambios**

Ejecuta esta query para verificar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

Deberías ver estas columnas:
- ✅ `id` (uuid)
- ✅ `first_name` (text) ← **NUEVA**
- ✅ `last_name` (text) ← **NUEVA**
- ✅ `email` (text)
- ✅ `avatar_url` (text)
- ✅ `bio` (text)
- ✅ `phone` (text)
- ✅ `created_at` (timestamp)
- ✅ `updated_at` (timestamp)

### **Paso 5: Probar el Perfil**

1. Vuelve a tu aplicación
2. Ve a **/perfil**
3. Intenta editar tu nombre
4. Haz clic en **Guardar**
5. ✅ Debería funcionar sin errores

---

## 🛡️ ¿Es Seguro?

**SÍ, 100% SEGURO:**

- ✅ No borra ningún dato existente
- ✅ Usa `IF NOT EXISTS` para evitar errores
- ✅ Migra automáticamente datos de `name` a `first_name`/`last_name`
- ✅ Puedes ejecutarlo múltiples veces sin problemas
- ✅ Si algo falla, no afecta tus datos actuales

---

## 🚨 Si Algo Sale Mal

Si por alguna razón el script falla:

1. Copia el error completo que aparece
2. No te preocupes, tus datos están seguros
3. Puedes ejecutar solo las líneas que faltan

---

## ✅ Después de la Migración

Tu perfil debería funcionar perfectamente:

- ✅ Editar nombre (first_name)
- ✅ Editar apellido (last_name)
- ✅ Editar biografía
- ✅ Editar teléfono
- ✅ Ver estadísticas (favoritos, comentarios)
- ✅ Toggle de modo oscuro

---

## 📝 Resumen del Script

El script hace esto:

1. **Agrega** columnas `first_name` y `last_name` (si no existen)
2. **Migra** datos existentes de `name` → `first_name` + `last_name`
3. **Asegura** que todos los usuarios tengan al menos `first_name` (usa email si falta)
4. **Crea** índices para mejor rendimiento
5. **No toca** ninguna otra columna o tabla

---

## 🎯 ¡Listo!

Una vez ejecutado el script, tu perfil funcionará perfectamente. 

**¿Necesitas ayuda?** Solo avísame si tienes algún error al ejecutar el script.
