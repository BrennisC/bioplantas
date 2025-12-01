import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus, Edit2, Trash2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Interaction {
  id: string;
  medication_id: string;
  medication_name: string;
  plant_id: string;
  plant_name: string;
  severity: "GRAVE" | "MODERADA" | "LEVE";
  interaction_type: string;
  mechanism: string;
  clinical_consequence: string;
  recommendation: string;
  evidence_level: "ALTA" | "MODERADA" | "BAJA";
  scientific_references: string[];
  created_at: string;
}

interface PlantOption {
  id: string;
  name: string;
}

interface MedicationOption {
  id: string;
  name: string;
}

export default function InteractionsManager() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [plants, setPlants] = useState<PlantOption[]>([]);
  const [medications, setMedications] = useState<MedicationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    medication_id: "",
    medication_name: "",
    plant_id: "",
    plant_name: "",
    severity: "MODERADA" as "GRAVE" | "MODERADA" | "LEVE",
    interaction_type: "",
    mechanism: "",
    clinical_consequence: "",
    recommendation: "",
    evidence_level: "MODERADA" as "ALTA" | "MODERADA" | "BAJA",
    scientific_references: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from("medication_plant_interactions")
        .select("*")
        .order("severity", { ascending: true });

      if (interactionsError) throw interactionsError;
      setInteractions(interactionsData || []);

      // Fetch plants
      const { data: plantsData, error: plantsError } = await supabase
        .from("plants")
        .select("id, name")
        .order("name");

      if (plantsError) throw plantsError;
      setPlants(plantsData || []);

      // Fetch medications
      const { data: medicationsData, error: medicationsError } = await supabase
        .from("medications")
        .select("id, name")
        .order("name");

      if (medicationsError) throw medicationsError;
      setMedications(medicationsData || []);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error al cargar datos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setFormData({
      medication_id: interaction.medication_id || "",
      medication_name: interaction.medication_name || "",
      plant_id: interaction.plant_id || "",
      plant_name: interaction.plant_name || "",
      severity: interaction.severity,
      interaction_type: interaction.interaction_type || "",
      mechanism: interaction.mechanism || "",
      clinical_consequence: interaction.clinical_consequence || "",
      recommendation: interaction.recommendation || "",
      evidence_level: interaction.evidence_level,
      scientific_references: interaction.scientific_references?.join("\n") || "",
    });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingInteraction(null);
    setFormData({
      medication_id: "",
      medication_name: "",
      plant_id: "",
      plant_name: "",
      severity: "MODERADA",
      interaction_type: "",
      mechanism: "",
      clinical_consequence: "",
      recommendation: "",
      evidence_level: "MODERADA",
      scientific_references: "",
    });
    setIsModalOpen(true);
  };

  const handleMedicationChange = (medicationId: string) => {
    const medication = medications.find(m => m.id === medicationId);
    setFormData({
      ...formData,
      medication_id: medicationId,
      medication_name: medication?.name || "",
    });
  };

  const handlePlantChange = (plantId: string) => {
    const plant = plants.find(p => p.id === plantId);
    setFormData({
      ...formData,
      plant_id: plantId,
      plant_name: plant?.name || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medication_id || !formData.plant_id) {
      toast({
        title: "Campos requeridos",
        description: "Debes seleccionar un medicamento y una planta",
        variant: "destructive",
      });
      return;
    }

    try {
      const interactionData = {
        medication_id: formData.medication_id,
        medication_name: formData.medication_name,
        plant_id: formData.plant_id,
        plant_name: formData.plant_name,
        severity: formData.severity,
        interaction_type: formData.interaction_type,
        mechanism: formData.mechanism,
        clinical_consequence: formData.clinical_consequence,
        recommendation: formData.recommendation,
        evidence_level: formData.evidence_level,
        scientific_references: formData.scientific_references
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s),
      };

      if (editingInteraction) {
        const { error } = await supabase
          .from("medication_plant_interactions")
          .update(interactionData)
          .eq("id", editingInteraction.id);

        if (error) throw error;

        toast({
          title: "✅ Interacción actualizada",
          description: `${formData.plant_name} + ${formData.medication_name}`,
        });
      } else {
        const { error } = await supabase
          .from("medication_plant_interactions")
          .insert([interactionData]);

        if (error) throw error;

        toast({
          title: "✅ Interacción creada",
          description: `${formData.plant_name} + ${formData.medication_name}`,
        });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving interaction:", error);
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteInteraction = async (id: string, plantName: string, medicationName: string) => {
    if (!confirm(`¿Eliminar interacción ${plantName} + ${medicationName}?`)) return;

    try {
      setDeleting(id);
      const { error } = await supabase
        .from("medication_plant_interactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "✅ Interacción eliminada",
        description: `${plantName} + ${medicationName}`,
      });

      fetchData();
    } catch (error: any) {
      console.error("Error deleting interaction:", error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const filteredInteractions = interactions.filter((interaction) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      interaction.plant_name?.toLowerCase().includes(searchLower) ||
      interaction.medication_name?.toLowerCase().includes(searchLower) ||
      interaction.severity?.toLowerCase().includes(searchLower)
    );
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "GRAVE":
        return "bg-red-100 border-red-500 dark:bg-red-950/20";
      case "MODERADA":
        return "bg-amber-100 border-amber-500 dark:bg-amber-950/20";
      case "LEVE":
        return "bg-green-100 border-green-500 dark:bg-green-950/20";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando interacciones...</p>
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
            <AlertTriangle className="text-primary" />
            Gestión de Interacciones
          </h2>
          <p className="text-muted-foreground mt-1">
            {interactions.length} interacciones en el sistema
          </p>
        </div>
        <Button onClick={openNewModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Interacción
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por planta, medicamento, severidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Interactions Table */}
      {filteredInteractions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? "No se encontraron interacciones" : "No hay interacciones"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Intenta con otra búsqueda" : "Comienza agregando la primera interacción"}
          </p>
          {!searchTerm && (
            <Button onClick={openNewModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar Interacción
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInteractions.map((interaction) => (
            <motion.div
              key={interaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-2 rounded-lg p-4 ${getSeverityColor(interaction.severity)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={
                      interaction.severity === "GRAVE" ? "bg-red-600" :
                      interaction.severity === "MODERADA" ? "bg-amber-600" :
                      "bg-green-600"
                    }>
                      {interaction.severity}
                    </Badge>
                    <Badge variant="outline">{interaction.evidence_level}</Badge>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1">
                    {interaction.plant_name} + {interaction.medication_name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {interaction.clinical_consequence}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    <strong>Recomendación:</strong> {interaction.recommendation}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(interaction)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteInteraction(
                      interaction.id,
                      interaction.plant_name,
                      interaction.medication_name
                    )}
                    disabled={deleting === interaction.id}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
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
            className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingInteraction ? "Editar Interacción" : "Nueva Interacción"}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Medicamento *
                  </label>
                  <select
                    required
                    value={formData.medication_id}
                    onChange={(e) => handleMedicationChange(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar...</option>
                    {medications.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Planta *
                  </label>
                  <select
                    required
                    value={formData.plant_id}
                    onChange={(e) => handlePlantChange(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar...</option>
                    {plants.map((plant) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Severidad *
                  </label>
                  <select
                    required
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        severity: e.target.value as "GRAVE" | "MODERADA" | "LEVE",
                      })
                    }
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="LEVE">LEVE - Beneficiosa</option>
                    <option value="MODERADA">MODERADA - Precaución</option>
                    <option value="GRAVE">GRAVE - Evitar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nivel de Evidencia *
                  </label>
                  <select
                    required
                    value={formData.evidence_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        evidence_level: e.target.value as "ALTA" | "MODERADA" | "BAJA",
                      })
                    }
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="BAJA">BAJA</option>
                    <option value="MODERADA">MODERADA</option>
                    <option value="ALTA">ALTA</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Tipo de Interacción
                  </label>
                  <Input
                    value={formData.interaction_type}
                    onChange={(e) =>
                      setFormData({ ...formData, interaction_type: e.target.value })
                    }
                    placeholder="FARMACOCINÉTICA, FARMACODINÁMICA, BENEFICIOSA, etc."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Mecanismo de Interacción *
                  </label>
                  <Textarea
                    required
                    value={formData.mechanism}
                    onChange={(e) =>
                      setFormData({ ...formData, mechanism: e.target.value })
                    }
                    placeholder="Describe el mecanismo bioquímico..."
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Consecuencia Clínica *
                  </label>
                  <Textarea
                    required
                    value={formData.clinical_consequence}
                    onChange={(e) =>
                      setFormData({ ...formData, clinical_consequence: e.target.value })
                    }
                    placeholder="¿Qué le puede pasar al paciente?"
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Recomendación *
                  </label>
                  <Textarea
                    required
                    value={formData.recommendation}
                    onChange={(e) =>
                      setFormData({ ...formData, recommendation: e.target.value })
                    }
                    placeholder="¿Qué hacer? Evitar, monitorear, ajustar dosis..."
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Referencias Científicas (una por línea)
                  </label>
                  <Textarea
                    value={formData.scientific_references}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scientific_references: e.target.value,
                      })
                    }
                    placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingInteraction ? "Actualizar" : "Crear"} Interacción
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
