# 🏥 INSTRUCCIONES: Agregar Condiciones Médicas al Onboarding

## Problema
El onboarding médico no muestra condiciones porque la tabla `medical_conditions` está vacía en Supabase.

## Solución

### Paso 1: Abrir Supabase
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto **BioPlantas**
3. En el menú lateral, haz clic en **SQL Editor**

### Paso 2: Ejecutar el Script
1. Haz clic en **+ New query**
2. Copia todo el contenido del archivo: `bd/insertar-condiciones-medicas.sql`
3. Pégalo en el editor SQL
4. Haz clic en **Run** (botón verde abajo a la derecha)

### Paso 3: Verificar
Deberías ver un resultado mostrando la cantidad de condiciones por categoría:

```
category            | cantidad
--------------------|----------
cardiovascular      | 5
dermatológico       | 7
gastrointestinal    | 7
genitourinario      | 3
hormonal            | 4
inmunológico        | 3
metabólico          | 3
musculoesquelético  | 5
nervioso            | 6
respiratorio        | 8
```

**Total: ~51 condiciones médicas**

### Paso 4: Probar en la App
1. Cierra sesión en BioPlantas
2. Crea una cuenta nueva o borra tu perfil médico actual
3. Al iniciar sesión, deberías ver el wizard con todas las condiciones médicas organizadas por categoría

---

## ✅ Cambios Realizados en el Código

### 1. **Login.tsx** - Botón de ojo para mostrar/ocultar contraseña
- ✅ Agregado icono Eye/EyeOff
- ✅ Toggle para mostrar contraseña

### 2. **Register.tsx** - Botones de ojo en ambos campos de contraseña
- ✅ Campo "Contraseña" con icono Eye/EyeOff
- ✅ Campo "Confirmar contraseña" con su propio icono Eye/EyeOff

### 3. **PlantFilters.tsx** - Filtros más visibles cuando están seleccionados
- ✅ Borde verde para dolencias seleccionadas
- ✅ Borde azul para propiedades seleccionadas
- ✅ Borde primary para categorías seleccionadas
- ✅ Texto en negrita y coloreado cuando está seleccionado
- ✅ Sombra para destacar selección
- ✅ Solo muestra categorías/tags que tienen plantas

### 4. **OnboardingWizard.tsx** - Mensaje de error si no hay condiciones
- ✅ Muestra mensaje amigable si la tabla está vacía
- ✅ Guía al usuario para contactar al administrador

---

## 📋 Archivo SQL a Ejecutar

**Ubicación:** `bd/insertar-condiciones-medicas.sql`

Este archivo contiene:
- Creación de la tabla `medical_conditions` (por si no existe)
- 51 condiciones médicas organizadas en 10 categorías
- Verificación de datos insertados

---

## 🎨 Mejoras Visuales en Filtros

### Antes:
- Borde sutil al seleccionar
- Difícil de ver qué estaba seleccionado

### Ahora:
- **Dolencias**: Fondo verde, borde verde, texto verde en negrita
- **Propiedades**: Fondo azul, borde azul, texto azul en negrita
- **Categorías**: Fondo primary, borde primary, texto primary en negrita
- Sombra para destacar
- Transiciones suaves

---

## 📝 Notas Importantes

1. **Orden de categorías en onboarding:**
   - Paso 1: Género
   - Paso 2: Condiciones médicas (ahora con datos)
   - Paso 3: Estado especial (embarazo, lactancia, niños)
   - Paso 4: Medicamentos y alergias (opcional)
   - Paso 5: Resumen

2. **El onboarding se muestra cuando:**
   - Usuario nuevo se registra
   - No tiene `onboarding_completed = true` en `user_medical_profile`
   - Ingresa a `/explorar`

3. **Seguridad:**
   - Los datos médicos se guardan en `user_medical_profile`
   - Solo el usuario puede ver su propio perfil
   - RLS (Row Level Security) activo

---

## 🔧 Troubleshooting

### Si el onboarding no aparece:
1. Verifica que estés logueado
2. Ve a `/explorar`
3. Abre la consola del navegador (F12)
4. Busca errores relacionados con `medical_conditions`

### Si no hay condiciones médicas:
1. Ejecuta el SQL en Supabase (ver Paso 2 arriba)
2. Verifica que la tabla `medical_conditions` tenga datos:
   ```sql
   SELECT COUNT(*) FROM medical_conditions;
   ```
3. Debería retornar al menos 50 filas

### Si los filtros no cambian de color:
1. Refresca la página (Ctrl+R o F5)
2. Limpia caché del navegador
3. Verifica que estés usando la última versión del código

---

¡Listo! Ahora tu aplicación tiene un onboarding médico completo y filtros más visibles. 🎉
