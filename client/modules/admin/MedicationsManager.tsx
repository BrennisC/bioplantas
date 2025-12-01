import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Pill, Plus, Edit2, Trash2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Medication {
  id: string;
  name: string;
  active_ingredient: string;
  category: string;
  tags: string[];
  ailments: string[];
  therapeutic_class: string;
  indications: string[];
  dosage_info: string;
  contraindications: string[];
  side_effects: string[];
  mechanism_of_action: string;
  pregnancy_category: string;
  lactation_safe: boolean;
  pediatric_use: boolean;
  elderly_considerations: string;
  image_url: string;
  created_at: string;
}

export default function MedicationsManager() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    active_ingredient: "",
    category: "",
    tags: "",
    ailments: "",
    therapeutic_class: "",
    indications: "",
    dosage_info: "",
    contraindications: "",
    side_effects: "",
    mechanism_of_action: "",
    pregnancy_category: "",
    lactation_safe: false,
    pediatric_use: false,
    elderly_considerations: "",
    image_url: "",
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      console.error("Error fetching medications:", error);
      toast({
        title: "Error al cargar medicamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name || "",
      active_ingredient: medication.active_ingredient || "",
      category: medication.category || "",
      tags: medication.tags?.join(", ") || "",
      ailments: medication.ailments?.join(", ") || "",
      therapeutic_class: medication.therapeutic_class || "",
      indications: medication.indications?.join("\n") || "",
      dosage_info: medication.dosage_info || "",
      contraindications: medication.contraindications?.join("\n") || "",
      side_effects: medication.side_effects?.join("\n") || "",
      mechanism_of_action: medication.mechanism_of_action || "",
      pregnancy_category: medication.pregnancy_category || "",
      lactation_safe: medication.lactation_safe || false,
      pediatric_use: medication.pediatric_use || false,
      elderly_considerations: medication.elderly_considerations || "",
      image_url: medication.image_url || "",
    });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingMedication(null);
    setFormData({
      name: "",
      active_ingredient: "",
      category: "",
      tags: "",
      ailments: "",
      therapeutic_class: "",
      indications: "",
      dosage_info: "",
      contraindications: "",
      side_effects: "",
      mechanism_of_action: "",
      pregnancy_category: "",
      lactation_safe: false,
      pediatric_use: false,
      elderly_considerations: "",
      image_url: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.active_ingredient) {
      toast({
        title: "Campos requeridos",
        description: "El nombre y el principio activo son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const medicationData = {
        name: formData.name,
        active_ingredient: formData.active_ingredient,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        ailments: formData.ailments
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
        therapeutic_class: formData.therapeutic_class,
        indications: formData.indications
          .split("\n")
          .map((i) => i.trim())
          .filter((i) => i),
        dosage_info: formData.dosage_info,
        contraindications: formData.contraindications
          .split("\n")
          .map((c) => c.trim())
          .filter((c) => c),
        side_effects: formData.side_effects
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s),
        mechanism_of_action: formData.mechanism_of_action,
        pregnancy_category: formData.pregnancy_category,
        lactation_safe: formData.lactation_safe,
        pediatric_use: formData.pediatric_use,
        elderly_considerations: formData.elderly_considerations,
        image_url: formData.image_url,
      };

      if (editingMedication) {
        const { error } = await supabase
          .from("medications")
          .update(medicationData)
          .eq("id", editingMedication.id);

        if (error) throw error;

        toast({
          title: "✅ Medicamento actualizado",
          description: `Se actualizó ${formData.name}`,
        });
      } else {
        const { error } = await supabase
          .from("medications")
          .insert([medicationData]);

        if (error) throw error;

        toast({
          title: "✅ Medicamento creado",
          description: `Se creó ${formData.name}`,
        });
      }

      setIsModalOpen(false);
      fetchMedications();
    } catch (error: any) {
      console.error("Error saving medication:", error);
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMedication = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar ${name}?`)) return;

    try {
      setDeleting(id);
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "✅ Medicamento eliminado",
        description: `Se eliminó ${name}`,
      });

      fetchMedications();
    } catch (error: any) {
      console.error("Error deleting medication:", error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const filteredMedications = medications.filter((medication) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      medication.name?.toLowerCase().includes(searchLower) ||
      medication.active_ingredient?.toLowerCase().includes(searchLower) ||
      medication.category?.toLowerCase().includes(searchLower) ||
      medication.therapeutic_class?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Pill className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando medicamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Pill className="text-primary" />
            Gestión de Medicamentos
          </h2>
          <p className="text-muted-foreground mt-1">
            {medications.length} medicamentos en el sistema
          </p>
        </div>
        <Button onClick={openNewModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Medicamento
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, principio activo, categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Medications Grid */}
      {filteredMedications.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? "No se encontraron medicamentos" : "No hay medicamentos"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Intenta con otra búsqueda" : "Comienza agregando tu primer medicamento"}
          </p>
          {!searchTerm && (
            <Button onClick={openNewModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar Medicamento
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedications.map((medication) => (
            <motion.div
              key={medication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 hover:shadow-lg transition-all"
            >
              {medication.image_url && (
                <img
                  src={medication.image_url}
                  alt={medication.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              
              <h3 className="font-bold text-lg mb-1">{medication.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {medication.active_ingredient}
              </p>

              {medication.category && (
                <Badge variant="secondary" className="mb-2">
                  {medication.category}
                </Badge>
              )}

              {medication.tags && medication.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {medication.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {medication.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{medication.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(medication)}
                  className="flex-1 gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMedication(medication.id, medication.name)}
                  disabled={deleting === medication.id}
                  className="flex-1 gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {deleting === medication.id ? "..." : "Eliminar"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingMedication ? "Editar Medicamento" : "Nuevo Medicamento"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre Comercial *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Omeprazol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Principio Activo *
                  </label>
                  <Input
                    required
                    value={formData.active_ingredient}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        active_ingredient: e.target.value,
                      })
                    }
                    placeholder="Ej: Inhibidor de bomba de protones"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categoría
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Ej: Gastrointestinal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Clase Terapéutica
                  </label>
                  <Input
                    value={formData.therapeutic_class}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        therapeutic_class: e.target.value,
                      })
                    }
                    placeholder="Ej: Antiácido"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categoría de Embarazo (FDA)
                  </label>
                  <select
                    value={formData.pregnancy_category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pregnancy_category: e.target.value,
                      })
                    }
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="A">A - Seguro</option>
                    <option value="B">B - Probablemente seguro</option>
                    <option value="C">C - Riesgo no descartado</option>
                    <option value="D">D - Evidencia de riesgo</option>
                    <option value="X">X - Contraindicado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL de Imagen
                  </label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Tags (separados por comas)
                  </label>
                  <Input
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="antiácido, reflujo, gastritis"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Dolencias que trata (separadas por comas)
                  </label>
                  <Input
                    value={formData.ailments}
                    onChange={(e) =>
                      setFormData({ ...formData, ailments: e.target.value })
                    }
                    placeholder="úlcera gástrica, reflujo gastroesofágico"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Indicaciones (una por línea)
                  </label>
                  <Textarea
                    value={formData.indications}
                    onChange={(e) =>
                      setFormData({ ...formData, indications: e.target.value })
                    }
                    placeholder="Tratamiento de úlcera gástrica&#10;Enfermedad por reflujo gastroesofágico"
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Dosificación
                  </label>
                  <Textarea
                    value={formData.dosage_info}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage_info: e.target.value })
                    }
                    placeholder="20-40 mg una vez al día, antes del desayuno"
                    rows={2}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Contraindicaciones (una por línea)
                  </label>
                  <Textarea
                    value={formData.contraindications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contraindications: e.target.value,
                      })
                    }
                    placeholder="Hipersensibilidad al principio activo&#10;Uso concomitante con atazanavir"
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Efectos Secundarios (uno por línea)
                  </label>
                  <Textarea
                    value={formData.side_effects}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        side_effects: e.target.value,
                      })
                    }
                    placeholder="Dolor de cabeza&#10;Náuseas&#10;Diarrea"
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Mecanismo de Acción
                  </label>
                  <Textarea
                    value={formData.mechanism_of_action}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mechanism_of_action: e.target.value,
                      })
                    }
                    placeholder="Inhibe la enzima H+/K+-ATPasa en la célula parietal gástrica..."
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Consideraciones en Ancianos
                  </label>
                  <Textarea
                    value={formData.elderly_considerations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        elderly_considerations: e.target.value,
                      })
                    }
                    placeholder="Puede requerir ajuste de dosis..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.lactation_safe}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          lactation_safe: checked as boolean,
                        })
                      }
                    />
                    <span className="text-sm">Seguro en lactancia</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.pediatric_use}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          pediatric_use: checked as boolean,
                        })
                      }
                    />
                    <span className="text-sm">Uso pediátrico</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingMedication ? "Actualizar" : "Crear"} Medicamento
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
