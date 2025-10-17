# 📞 Configuración de Contacto - BioPlantas

Este archivo contiene la información de contacto que aparece en las páginas de detalle de plantas.

## 🔧 Cómo Actualizar

Para cambiar los números de teléfono, WhatsApp o email, edita el archivo:
`client/pages/PlantDetail.tsx`

Busca la sección **"Sección de Contacto/Venta"** (línea ~362) y actualiza:

```tsx
{/* Sección de Contacto/Venta */}
<div className="border-2 border-primary/30 rounded-xl p-6 bg-primary/5">
  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
    <MessageCircle className="w-5 h-5 text-primary" />
    ¿Interesado en esta planta?
  </h3>
  <p className="text-muted-foreground mb-6">
    Contáctanos para más información sobre disponibilidad, precios y asesoramiento personalizado.
  </p>
  <div className="grid sm:grid-cols-2 gap-3">
    <Button variant="default" className="gap-2 w-full" asChild>
      <a href="tel:+1234567890"> {/* 👈 CAMBIA ESTE NÚMERO */}
        <Phone className="w-4 h-4" />
        Llamar ahora
      </a>
    </Button>
    <Button variant="outline" className="gap-2 w-full" asChild>
      <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer"> {/* 👈 CAMBIA ESTE NÚMERO DE WHATSAPP */}
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </a>
    </Button>
    <Button variant="outline" className="gap-2 w-full sm:col-span-2" asChild>
      <a href="mailto:contacto@biopiantas.com"> {/* 👈 CAMBIA ESTE EMAIL */}
        <Mail className="w-4 h-4" />
        Enviar correo
      </a>
    </Button>
  </div>
  <p className="text-xs text-muted-foreground mt-4 text-center">
    📞 +123 456 7890 | 📧 contacto@biopiantas.com {/* 👈 CAMBIA ESTOS TAMBIÉN */}
  </p>
</div>
```

---

## 📝 Valores a Actualizar

### Teléfono
- **Formato:** `tel:+1234567890`
- **Ejemplo:** `tel:+573001234567` (Colombia)
- **Ejemplo:** `tel:+34612345678` (España)

### WhatsApp
- **Formato:** `https://wa.me/1234567890`
- **Ejemplo:** `https://wa.me/573001234567` (Colombia)
- **Ejemplo:** `https://wa.me/34612345678` (España)
- **Con mensaje:** `https://wa.me/573001234567?text=Hola,%20estoy%20interesado%20en...`

### Email
- **Formato:** `mailto:tu-email@dominio.com`
- **Ejemplo:** `mailto:ventas@biopiantas.com`

---

## 🔮 Mejora Futura: Configuración Dinámica

En el futuro, esta información se puede cargar desde:

1. **Tabla de Supabase:** `site_settings`
   ```sql
   CREATE TABLE site_settings (
     id UUID PRIMARY KEY,
     contact_phone VARCHAR(50),
     contact_whatsapp VARCHAR(50),
     contact_email VARCHAR(255),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **SettingsManager (Admin):**
   - Ya tienes el módulo `SettingsManager.tsx`
   - Se puede agregar un tab "Contacto" para editar estos valores
   - Los cambios se reflejan automáticamente en todas las páginas

3. **Carga dinámica:**
   ```tsx
   const [contactInfo, setContactInfo] = useState({
     phone: '',
     whatsapp: '',
     email: ''
   });

   useEffect(() => {
     const loadContactInfo = async () => {
       const { data } = await supabase
         .from('site_settings')
         .select('contact_phone, contact_whatsapp, contact_email')
         .single();
       
       if (data) setContactInfo(data);
     };
     loadContactInfo();
   }, []);
   ```

---

## 🎨 Personalización Adicional

### Cambiar el Mensaje
Línea ~349 de `PlantDetail.tsx`:
```tsx
<p className="text-muted-foreground mb-6">
  Contáctanos para más información sobre disponibilidad, precios y asesoramiento personalizado.
</p>
```

### Agregar Redes Sociales
Puedes agregar más botones para Instagram, Facebook, etc.:

```tsx
<Button variant="outline" className="gap-2 w-full" asChild>
  <a href="https://instagram.com/biopiantas" target="_blank" rel="noopener noreferrer">
    <Instagram className="w-4 h-4" />
    Instagram
  </a>
</Button>
```

### Cambiar Colores
La sección usa `border-primary/30` y `bg-primary/5`. Puedes cambiar a:
- Verde: `border-green-500/30` y `bg-green-500/5`
- Azul: `border-blue-500/30` y `bg-blue-500/5`
- Personalizado: Edita `client/global.css` para definir colores de marca

---

**Última actualización:** 12 de Octubre, 2025
