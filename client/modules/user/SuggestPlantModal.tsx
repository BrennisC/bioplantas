import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Send, X, AlertCircle, CheckCircle } from "lucide-react";
import { supabase, type Plant } from "@/lib/supabase";
import { useAuth } from "@/modules/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SuggestPlantModalProps {
  open: boolean;
  onClose: () => void;
  existingPlant?: Plant | null; // Si se pasa, es una corrección
}

export default function SuggestPlantModal({ open, onClose, existingPlant }: SuggestPlantModalProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suggestionType, setSuggestionType] = useState<'new' | 'correction'>(
    existingPlant ? 'correction' : 'new'
  );

  const [formData, setFormData] = useState({
    name: existingPlant?.name || "",
    scientific_name: existingPlant?.scientific_name || "",
    description: existingPlant?.description || "",
    category: existingPlant?.category || "",
    properties: existingPlant?.properties || "",
    image: existingPlant?.image || "",
    reason: ""
  });

  useEffect(() => {
    if (existingPlant) {
      setSuggestionType('correction');
      setFormData({
        name: existingPlant.name || "",
        scientific_name: existingPlant.scientific_name || "",
        description: existingPlant.description || "",
        category: existingPlant.category || "",
        properties: existingPlant.properties || "",
        image: existingPlant.image || "",
        reason: ""
      });
    }
  }, [existingPlant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para enviar sugerencias",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!formData.name.trim() || !formData.scientific_name.trim() || !formData.description.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa al menos el nombre, nombre científico y descripción",
        variant: "destructive"
      });
      return;
    }

    if (suggestionType === 'correction' && !formData.reason.trim()) {
      toast({
        title: "Razón requerida",
        description: "Por favor explica qué se debe corregir",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('plant_suggestions')
        .insert({
          user_id: session.id,
          suggestion_type: suggestionType,
          plant_id: existingPlant?.id || null,
          name: formData.name,
          scientific_name: formData.scientific_name,
          description: formData.description,
          category: formData.category || null,
          properties: formData.properties || null,
          image: formData.image || null,
          reason: formData.reason || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "✅ Sugerencia enviada",
        description: suggestionType === 'new' 
          ? "Gracias por tu sugerencia. El administrador la revisará pronto."
          : "Tu corrección ha sido enviada. El administrador la revisará pronto.",
      });

      // Reset form
      setFormData({
        name: "",
        scientific_name: "",
        description: "",
        category: "",
        properties: "",
        image: "",
        reason: ""
      });

      onClose();
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Sugerir Planta
          </DialogTitle>
          <DialogDescription>
            {suggestionType === 'new' 
              ? "¿Conoces una planta que no está en nuestro catálogo? ¡Compártela con nosotros!"
              : "¿Encontraste información incorrecta o incompleta? Ayúdanos a mejorar."
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={suggestionType} onValueChange={(v) => setSuggestionType(v as 'new' | 'correction')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new" disabled={!!existingPlant}>
              Nueva Planta
            </TabsTrigger>
            <TabsTrigger value="correction">
              Corrección
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4 mt-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <p className="font-medium mb-1">¿Qué información necesitamos?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Nombre común de la planta</li>
                    <li>Nombre científico (importante para verificación)</li>
                    <li>Descripción de la planta y sus usos</li>
                    <li>Categoría y propiedades (opcional)</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Nombre Común *
                  </label>
                  <input
                    required
                    placeholder="Ej: Manzanilla"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Nombre Científico *
                  </label>
                  <input
                    required
                    placeholder="Ej: Matricaria chamomilla"
                    className="input"
                    value={formData.scientific_name}
                    onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Descripción *
                </label>
                <textarea
                  required
                  placeholder="Describe la planta, sus características y usos medicinales..."
                  className="input h-24 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Categoría (opcional)
                  </label>
                  <input
                    placeholder="Ej: Hierbas, Flores, Árboles..."
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    URL de Imagen (opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="input"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Propiedades Medicinales (opcional)
                </label>
                <textarea
                  placeholder="Ej: Antiinflamatoria, digestiva, relajante..."
                  className="input h-20 resize-none"
                  value={formData.properties}
                  onChange={(e) => setFormData({ ...formData, properties: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-32"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Enviar Sugerencia
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="correction" className="space-y-4 mt-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  <p className="font-medium mb-1">Ayúdanos a mejorar</p>
                  <p className="text-xs">
                    Si encontraste información incorrecta, incompleta o desactualizada,
                    comparte los datos correctos y explica qué debe corregirse.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {existingPlant && (
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium mb-1">Planta a corregir:</p>
                  <p className="text-lg font-bold">{existingPlant.name}</p>
                  <p className="text-sm italic text-muted-foreground">{existingPlant.scientific_name}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  ¿Qué debe corregirse? *
                </label>
                <textarea
                  required
                  placeholder="Explica qué información es incorrecta o qué falta..."
                  className="input h-24 resize-none"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Nombre Correcto
                  </label>
                  <input
                    placeholder="Déjalo vacío si no necesita cambios"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Nombre Científico Correcto
                  </label>
                  <input
                    placeholder="Déjalo vacío si no necesita cambios"
                    className="input"
                    value={formData.scientific_name}
                    onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Descripción Corregida
                </label>
                <textarea
                  placeholder="Nueva descripción o información adicional..."
                  className="input h-24 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-32"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Enviar Corrección
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
