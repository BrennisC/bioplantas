import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Modal from "@/components/Modal";
import { supabase, type Plant } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Search, Plus, Edit, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function PlantsManager() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Plant | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: "",
    name: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPlants() {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching plants:', error);
        return;
      }
      
      console.log('Plants loaded:', data);
      data?.forEach(p => {
        if (p.image) console.log(`${p.name} image URL:`, p.image);
      });
      
      setPlants(data || []);
      setLoading(false);
    }
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlants(data || []);
    } catch (error: any) {
      console.error('Error fetching plants:', error);
      toast({
        title: "Error al cargar plantas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return plants;
    return plants.filter((p) =>
      [p.name, p.scientific_name, p.category, p.properties]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(q))
    );
  }, [plants, query]);

  const upsert = async (p: Plant) => {
    try {
      // DEBUG: Ver qué valores se están enviando
      console.log('🔍 Guardando planta con estos valores:');
      console.log('usage_instructions:', p.usage_instructions);
      console.log('warnings:', p.warnings);
      console.log('scientific_article_url:', p.scientific_article_url);
      console.log('Longitud usage_instructions:', p.usage_instructions?.length);
      console.log('Longitud warnings:', p.warnings?.length);
      console.log('Longitud scientific_article_url:', p.scientific_article_url?.length);
      
      if (p.id && plants.find(x => x.id === p.id)) {
        // Update existing
        const updateData = {
          name: p.name,
          scientific_name: p.scientific_name,
          description: p.description,
          category: p.category,
          properties: p.properties,
          image: p.image,
          tags: p.tags,
          ailments: p.ailments,
          scientific_article_url: p.scientific_article_url,
          usage_instructions: p.usage_instructions,
          warnings: p.warnings
        };
        
        console.log('📦 Datos que se enviarán al UPDATE:', updateData);
        console.log('🆔 ID de la planta:', p.id);
        
        const { data, error } = await supabase
          .from('plants')
          .update(updateData)
          .eq('id', p.id)
          .select();

        console.log('✅ Respuesta del UPDATE:', { data, error });

        if (error) {
          console.error('❌ Error al actualizar:', error);
          throw error;
        }

        console.log('✅ Planta actualizada exitosamente en Supabase');

        setPlants(prev => prev.map(x => x.id === p.id ? p : x));
        toast({
          title: "Planta actualizada",
          description: `${p.name} ha sido actualizada correctamente`,
        });
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('plants')
          .insert([{
            name: p.name,
            scientific_name: p.scientific_name,
            description: p.description,
            category: p.category,
            properties: p.properties,
            image: p.image,
            tags: p.tags,
            ailments: p.ailments,
            scientific_article_url: p.scientific_article_url,
            usage_instructions: p.usage_instructions,
            warnings: p.warnings
          }])
          .select()
          .single();

        if (error) throw error;

        setPlants(prev => [data, ...prev]);
        toast({
          title: "Planta creada",
          description: `${p.name} ha sido añadida al catálogo`,
        });
      }

      setOpen(false);
      setEditing(null);
    } catch (error: any) {
      console.error('Error saving plant:', error);
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const remove = async (id: string, name: string) => {
    setDeleteDialog({ open: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', deleteDialog.id);

      if (error) throw error;

      setPlants(prev => prev.filter(p => p.id !== deleteDialog.id));
      toast({
        title: "Planta eliminada",
        description: `${deleteDialog.name} ha sido eliminada correctamente`,
      });
      setDeleteDialog({ open: false, id: "", name: "" });
    } catch (error: any) {
      console.error('Error deleting plant:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando plantas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-7 w-7" />
            Gestión de Plantas
          </h2>
          <p className="text-muted-foreground mt-1">
            Total de plantas en el catálogo: <span className="font-bold">{plants.length}</span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditing(null); setOpen(true); }}
          className="btn flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Planta
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, categoría o propiedades..."
          className="input pl-10 w-full"
        />
      </div>

      {/* Plants Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Planta</th>
                <th className="text-left p-4 font-semibold">Categoría</th>
                <th className="text-left p-4 font-semibold">Propiedades</th>
                <th className="text-center p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {query ? "No se encontraron plantas" : "No hay plantas registradas"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((plant, index) => (
                  <motion.tr
                    key={plant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative border border-border">
                          {plant.image && plant.image.trim() !== '' ? (
                            <>
                              <img 
                                src={plant.image.trim()} 
                                alt={plant.name}
                                loading="lazy"
                                className="w-full h-full object-cover" 
                                onLoad={(e) => {
                                  console.log('✅ Image loaded successfully:', plant.name, plant.image);
                                  e.currentTarget.style.display = 'block';
                                }}
                                onError={(e) => {
                                  console.error('❌ Error loading image for', plant.name, ':', plant.image);
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const fallback = parent.querySelector('.fallback-icon') as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }
                                }}
                                style={{ display: 'block' }}
                              />
                              <div 
                                className="fallback-icon w-full h-full flex items-center justify-center absolute inset-0 bg-muted"
                                style={{ display: 'none' }}
                              >
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{plant.name}</p>
                          <p className="text-xs text-muted-foreground italic truncate">{plant.scientific_name}</p>
                          {plant.image && plant.image.trim() !== '' && (
                            <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5" title={plant.image}>
                              🖼️ {plant.image.substring(0, 40)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                        {plant.category || "Sin categoría"}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {plant.properties || plant.description || "Sin propiedades"}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {plant.scientific_article_url && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={plant.scientific_article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-purple-500/10 text-purple-500 transition-colors"
                            title="Ver artículo científico"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </motion.a>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { 
                            console.log('✏️ Editando planta:', plant.name);
                            console.log('📖 usage_instructions en plant:', plant.usage_instructions);
                            console.log('⚠️ warnings en plant:', plant.warnings);
                            console.log('🔬 scientific_article_url en plant:', plant.scientific_article_url);
                            setEditing(plant); 
                            setOpen(true); 
                          }}
                          className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                          title="Editar planta"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => remove(plant.id, plant.name)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                          title="Eliminar planta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <PlantEditor initial={editing || undefined} onSave={upsert} />
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: "", name: "" })}
        onConfirm={confirmDelete}
        title="¿Eliminar planta?"
        description={`¿Estás seguro de que quieres eliminar "${deleteDialog.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        icon="delete"
      />
    </div>
  );
}

function PlantEditor({ initial, onSave }: { initial?: Partial<Plant>; onSave: (p: Plant) => void }) {
  const [v, setV] = useState<Partial<Plant>>({ ...initial });
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image || null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [ailments, setAilments] = useState<string[]>([]);
  const { toast } = useToast();

  // Actualizar estado cuando cambia la planta que se está editando
  useEffect(() => {
    console.log('🔄 Actualizando formulario con initial:', initial);
    console.log('📖 initial.usage_instructions:', initial?.usage_instructions);
    console.log('⚠️ initial.warnings:', initial?.warnings);
    console.log('🔬 initial.scientific_article_url:', initial?.scientific_article_url);
    setV({ ...initial });
    setImagePreview(initial?.image || null);
  }, [initial]);

  // Cargar categorías, tags y ailments desde Supabase
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Cargar desde las nuevas tablas si existen, sino usar valores por defecto
        const [categoriesRes, tagsRes, ailmentsRes] = await Promise.all([
          supabase.from('plant_categories').select('name').order('display_order'),
          supabase.from('plant_tags').select('name').order('display_order'),
          supabase.from('plant_ailments').select('name').order('display_order')
        ]);

        // Si las tablas existen y tienen datos, usarlos
        if (categoriesRes.data && categoriesRes.data.length > 0) {
          setCategories(categoriesRes.data.map(c => c.name));
        } else {
          // Fallback: usar valores hardcodeados si las tablas no existen
          setCategories([
            "Hierbas", "Árboles", "Arbustos", "Flores", "Enredaderas",
            "Suculentas", "Helechos", "Plantas Acuáticas", "Cactus",
            "Medicinales", "Aromáticas", "Comestibles"
          ]);
        }

        if (tagsRes.data && tagsRes.data.length > 0) {
          setTags(tagsRes.data.map(t => t.name));
        } else {
          setTags([
            "Medicinal", "Aromática", "Comestible", "Decorativa",
            "Antiinflamatoria", "Digestiva", "Relajante", "Antioxidante",
            "Antibacteriana", "Analgésica", "Cicatrizante", "Depurativa",
            "Diurética", "Expectorante", "Sedante", "Estimulante",
            "Tónica", "Antiespasmódica", "Antiséptica", "Febrífuga"
          ]);
        }

        if (ailmentsRes.data && ailmentsRes.data.length > 0) {
          setAilments(ailmentsRes.data.map(a => a.name));
        } else {
          setAilments([
            "Dolor de cabeza", "Dolor de estómago", "Insomnio", "Ansiedad",
            "Estrés", "Tos", "Resfriado", "Gripe", "Fiebre", "Náuseas",
            "Diarrea", "Estreñimiento", "Acidez estomacal", "Inflamación",
            "Artritis", "Dolor muscular", "Heridas", "Quemaduras", "Acné",
            "Dermatitis", "Presión arterial alta", "Colesterol alto",
            "Diabetes", "Retención de líquidos"
          ]);
        }
      } catch (error) {
        console.error('Error loading options:', error);
        // Si hay error, usar valores por defecto
        setCategories([
          "Hierbas", "Árboles", "Arbustos", "Flores", "Enredaderas",
          "Suculentas", "Helechos", "Plantas Acuáticas", "Cactus",
          "Medicinales", "Aromáticas", "Comestibles"
        ]);
        setTags([
          "Medicinal", "Aromática", "Comestible", "Decorativa",
          "Antiinflamatoria", "Digestiva", "Relajante", "Antioxidante",
          "Antibacteriana", "Analgésica", "Cicatrizante", "Depurativa",
          "Diurética", "Expectorante", "Sedante", "Estimulante",
          "Tónica", "Antiespasmódica", "Antiséptica", "Febrífuga"
        ]);
        setAilments([
          "Dolor de cabeza", "Dolor de estómago", "Insomnio", "Ansiedad",
          "Estrés", "Tos", "Resfriado", "Gripe", "Fiebre", "Náuseas",
          "Diarrea", "Estreñimiento", "Acidez estomacal", "Inflamación",
          "Artritis", "Dolor muscular", "Heridas", "Quemaduras", "Acné",
          "Dermatitis", "Presión arterial alta", "Colesterol alto",
          "Diabetes", "Retención de líquidos"
        ]);
      }
    };

    loadOptions();
  }, []);

  // Validar y previsualizar imagen cuando cambia la URL

  // Validar y previsualizar imagen cuando cambia la URL
  const handleImageChange = (url: string) => {
    const trimmedUrl = url.trim();
    setV({ ...v, image: trimmedUrl });
    setImageError(false);
    
    if (trimmedUrl) {
      console.log('🔍 Testing image URL:', trimmedUrl);
      setImagePreview(trimmedUrl);
    } else {
      setImagePreview(null);
    }
  };

  // Subir archivo a Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📁 File selected:', file.name, file.type, file.size);

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('❌ Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ La imagen es muy grande. Máximo 5MB');
      return;
    }

    // Mostrar preview inmediato del archivo local
    const reader = new FileReader();
    reader.onload = (e) => {
      const localUrl = e.target?.result as string;
      setImagePreview(localUrl);
      console.log('👁️ Local preview loaded');
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setImageError(false);

    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}_${random}.${fileExt}`;
      const filePath = `plants/${fileName}`;

      console.log('📤 Uploading file to Supabase:', filePath);

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from('plant-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw error;
      }

      console.log('✅ Uploaded to Supabase:', data);

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('plant-images')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;
      console.log('🌐 Public URL:', publicUrl);

      // Actualizar estado con URL pública
      setV({ ...v, image: publicUrl });
      setImagePreview(publicUrl);
      setImageError(false);

      toast({
        title: "✅ Imagen subida",
        description: "La imagen se ha subido correctamente a Supabase",
      });

    } catch (error: any) {
      console.error('❌ Upload error:', error);
      setImageError(true);
      
      if (error.message?.includes('new row violates row-level security') || error.message?.includes('row-level security')) {
        toast({
          title: "❌ Error de permisos",
          description: "No tienes permisos para subir imágenes. Verifica las políticas RLS del bucket.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "❌ Error al subir",
          description: error.message || "No se pudo subir la imagen",
          variant: "destructive"
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Título del formulario */}
      <div className="pb-3 border-b border-border">
        <h3 className="text-xl font-bold flex items-center gap-2">
          {initial ? (
            <>
              <Edit className="h-5 w-5 text-blue-500" />
              Editar Planta
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 text-green-500" />
              Nueva Planta
            </>
          )}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {initial ? 'Modifica los datos de la planta' : 'Completa la información de la nueva planta'}
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!v.name || !v.scientific_name) return;
          
          // DEBUG: Ver el estado completo antes de guardar
          console.log('📝 Estado completo del formulario (v):', v);
          console.log('📖 v.usage_instructions:', v.usage_instructions);
          console.log('⚠️ v.warnings:', v.warnings);
          console.log('🔬 v.scientific_article_url:', v.scientific_article_url);
          
          const cleanedImage = v.image?.trim() || undefined;
          console.log('💾 Saving plant with image:', cleanedImage);
        
        // Generar UUID compatible con todos los navegadores
        const generateId = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        
        onSave({
          id: v.id || generateId(),
          name: v.name,
          scientific_name: v.scientific_name,
          description: v.description || "",
          category: v.category || "Hierbas",
          properties: v.properties || "",
          image: cleanedImage,
          scientific_article_url: v.scientific_article_url?.trim() || null,
          tags: v.tags || [],
          ailments: v.ailments || [],
          usage_instructions: v.usage_instructions?.trim() || null,
          warnings: v.warnings?.trim() || null
        });
      }}
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="input" placeholder="Nombre *" required value={v.name || ""} onChange={(e) => setV({ ...v, name: e.target.value })} />
        <input className="input" placeholder="Nombre científico *" required value={v.scientific_name || ""} onChange={(e) => setV({ ...v, scientific_name: e.target.value })} />
      </div>
      
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Categoría *</label>
        <select 
          className="input w-full"
          value={v.category || "Hierbas"}
          onChange={(e) => setV({ ...v, category: e.target.value })}
          required
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Campo de imagen mejorado con preview y upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Imagen de la Planta</label>
        
        {/* Opción 1: Subir archivo */}
        <div className={`border-2 border-dashed rounded-lg p-4 transition-all ${
          uploading ? 'border-blue-500 bg-blue-500/5' : 'border-border hover:border-primary/50'
        }`}>
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm font-medium text-primary">Subiendo imagen...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Subir imagen desde tu computadora</p>
              </>
            )}
            <p className="text-xs text-muted-foreground text-center">
              JPG, PNG, WEBP, GIF - Máximo 5MB
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`btn mt-2 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'} transition-transform`}
            >
              {uploading ? '⏳ Subiendo...' : imagePreview ? '✅ Cambiar imagen' : '📤 Seleccionar archivo'}
            </label>
          </div>
        </div>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O usa una URL</span>
          </div>
        </div>

        {/* Opción 2: URL externa */}
        <input 
          className="input" 
          placeholder="https://ejemplo.com/imagen.jpg" 
          value={v.image || ""} 
          onChange={(e) => handleImageChange(e.target.value)}
          disabled={uploading}
        />
        
        {/* Preview de la imagen */}
        {imagePreview && (
          <div className="mt-3 p-3 border border-border rounded-lg bg-muted/30">
            <p className="text-xs font-medium mb-2">Vista previa:</p>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border bg-muted relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    setImageError(false);
                    console.log('✅ Preview loaded successfully');
                  }}
                  onError={(e) => {
                    setImageError(true);
                    console.error('❌ Preview failed to load');
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
                    <p className="text-xs text-red-500 text-center p-2">❌ Error</p>
                  </div>
                )}
              </div>
              <div className="flex-1 text-xs">
                {imageError ? (
                  <p className="text-red-500">⚠️ No se pudo cargar la imagen. Verifica la URL.</p>
                ) : (
                  <p className="text-green-500">✅ Imagen cargada correctamente</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <textarea className="input h-20" placeholder="Descripción" value={v.description || ""} onChange={(e) => setV({ ...v, description: e.target.value })} />
      <textarea className="input h-16" placeholder="Propiedades" value={v.properties || ""} onChange={(e) => setV({ ...v, properties: e.target.value })} />
      
      <div>
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          🔬 Artículo Científico (Opcional)
        </label>
        <input 
          className="input" 
          placeholder="https://www.ncbi.nlm.nih.gov/pmc/articles/..." 
          value={v.scientific_article_url || ""} 
          onChange={(e) => setV({ ...v, scientific_article_url: e.target.value })}
          type="url"
        />
        <p className="text-xs text-muted-foreground mt-1">
          URL del estudio o artículo científico sobre esta planta
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          🏷️ Tags (Selecciona los que apliquen)
        </label>
        <div className="border border-border rounded-lg p-4 max-h-60 overflow-y-auto bg-muted/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tags.map(tag => {
              const isSelected = v.tags?.includes(tag) || false;
              return (
                <label 
                  key={tag}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-primary/10 border-primary text-primary font-medium' 
                      : 'bg-background border-border hover:bg-muted hover:border-primary/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const newTags = e.target.checked
                        ? [...(v.tags || []), tag]
                        : (v.tags || []).filter(t => t !== tag);
                      setV({ ...v, tags: newTags });
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              );
            })}
          </div>
          {v.tags && v.tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Seleccionados ({v.tags.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {v.tags.map(tag => (
                  <span 
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          💊 Dolencias que trata (Selecciona las que apliquen)
        </label>
        <div className="border border-border rounded-lg p-4 max-h-60 overflow-y-auto bg-muted/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ailments.map(ailment => {
              const isSelected = v.ailments?.includes(ailment) || false;
              return (
                <label 
                  key={ailment}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-green-500/10 border-green-500 text-green-600 font-medium' 
                      : 'bg-background border-border hover:bg-muted hover:border-green-500/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const newAilments = e.target.checked
                        ? [...(v.ailments || []), ailment]
                        : (v.ailments || []).filter(a => a !== ailment);
                      setV({ ...v, ailments: newAilments });
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                  />
                  <span className="text-sm">{ailment}</span>
                </label>
              );
            })}
          </div>
          {v.ailments && v.ailments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Seleccionadas ({v.ailments.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {v.ailments.map(ailment => (
                  <span 
                    key={ailment}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20"
                  >
                    {ailment}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Índice Botánico: Instrucciones de Uso */}
      <div>
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          📖 Instrucciones de Uso (Índice Botánico)
        </label>
        <textarea 
          className="input h-32" 
          placeholder="Ejemplo:&#10;• Hervir 200ml de agua&#10;• Añadir 1-2 cucharaditas de la planta&#10;• Dejar reposar 5-10 minutos&#10;• Colar y beber tibio&#10;&#10;Puedes usar saltos de línea y viñetas para mejor formato."
          value={v.usage_instructions || ""} 
          onChange={(e) => {
            console.log('📖 Escribiendo usage_instructions:', e.target.value);
            setV({ ...v, usage_instructions: e.target.value });
          }}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Instrucciones de preparación y uso. Este contenido aparecerá en el Índice Botánico de la planta.
        </p>
      </div>

      {/* Índice Botánico: Advertencias */}
      <div>
        <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
          ⚠️ Advertencias y Precauciones (Índice Botánico)
        </label>
        <textarea 
          className="input h-32" 
          placeholder="Ejemplo:&#10;• No consumir durante el embarazo o lactancia&#10;• Consultar con un médico si estás tomando otros medicamentos&#10;• No exceder la dosis recomendada&#10;• Puede causar somnolencia&#10;&#10;Lista todas las precauciones importantes."
          value={v.warnings || ""} 
          onChange={(e) => {
            console.log('⚠️ Escribiendo warnings:', e.target.value);
            setV({ ...v, warnings: e.target.value });
          }}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Advertencias, contraindicaciones y precauciones. Este contenido aparecerá en el Índice Botánico de la planta.
        </p>
      </div>
      
      <button className="btn w-full" type="submit" disabled={uploading}>
        {uploading ? '⏳ Procesando...' : '💾 Guardar Planta'}
      </button>
    </form>
    </div>
  );
}
