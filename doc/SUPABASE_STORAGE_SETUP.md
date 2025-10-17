# 📸 Configuración de Supabase Storage para Imágenes de Plantas

## 1️⃣ Crear el Bucket en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Click en **Storage** en el menú lateral
3. Click en **"Create a new bucket"**
4. Configura:
   - **Name**: `plant-images`
   - **Public**: ✅ **Activado** (para que las imágenes sean públicas)
   - **File size limit**: 5 MB (o el que prefieras)
   - **Allowed MIME types**: `image/*`

## 2️⃣ Configurar las políticas de acceso (RLS)

En el bucket `plant-images`, configura estas políticas:

### Política de SELECT (ver imágenes) - PÚBLICA
```sql
CREATE POLICY "Public can view plant images"
ON storage.objects FOR SELECT
USING (bucket_id = 'plant-images');
```

### Política de INSERT (subir imágenes) - Solo admins
```sql
CREATE POLICY "Admins can upload plant images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'plant-images' 
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);
```

### Política de DELETE (eliminar imágenes) - Solo admins
```sql
CREATE POLICY "Admins can delete plant images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'plant-images'
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);
```

## 3️⃣ Después de crear el bucket

Una vez creado, el sistema automáticamente permitirá:
- ✅ Subir imágenes arrastrando y soltando
- ✅ Visualización instantánea sin errores de CORS
- ✅ URLs públicas automáticas
- ✅ Eliminación automática de imágenes antiguas

## 🎯 Ventajas de usar Supabase Storage

- ✅ Sin problemas de CORS
- ✅ Optimización automática de imágenes
- ✅ CDN global para carga rápida
- ✅ Control total sobre las imágenes
- ✅ Eliminación automática cuando se borra una planta
