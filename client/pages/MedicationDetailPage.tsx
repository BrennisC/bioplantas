import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pill, AlertTriangle, Heart, CheckCircle2, XCircle, Info, Shield, Leaf } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import InteractionChecker from "@/components/InteractionChecker";
import RecommendedPlantsForMedication from "@/components/RecommendedPlantsForMedication";

interface Medication {
  id: string;
  name: string;
  active_ingredient: string;
  category: string;
  tags: string[];
  therapeutic_class: string;
  indications: string[];
  contraindications: string[];
  side_effects: string[];
  dosage_info: string;
  pregnancy_category: string;
  lactation_safe: boolean;
  pediatric_use: boolean;
  elderly_considerations: string;
  mechanism_of_action: string;
  image_url: string | null;
}

export default function MedicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInMyMedications, setIsInMyMedications] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchMedicationDetail();
      checkUserStatus();
    }
  }, [id]);

  const fetchMedicationDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMedication(data);
    } catch (error: any) {
      console.error('Error fetching medication:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el medicamento",
        variant: "destructive"
      });
      navigate('/medications');
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      // Verificar si está en medicamentos del usuario
      const { data: userMeds } = await supabase
        .from('user_medications')
        .select('id')
        .eq('user_id', session.session.user.id)
        .eq('medication_id', id)
        .maybeSingle();

      setIsInMyMedications(!!userMeds);
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleAddToMyMedications = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para agregar medicamentos",
          variant: "destructive"
        });
        return;
      }

      if (!medication) return;

      if (isInMyMedications) {
        // Eliminar
        const { error } = await supabase
          .from('user_medications')
          .delete()
          .eq('user_id', session.session.user.id)
          .eq('medication_id', medication.id);

        if (error) throw error;

        setIsInMyMedications(false);
        toast({
          title: "Eliminado",
          description: `${medication.name} fue eliminado de tus medicamentos`
        });
      } else {
        // Agregar
        const { error } = await supabase
          .from('user_medications')
          .insert({
            user_id: session.session.user.id,
            medication_id: medication.id,
            medication_name: medication.name
          });

        if (error) throw error;

        setIsInMyMedications(true);
        toast({
          title: "Agregado",
          description: `${medication.name} fue agregado a tus medicamentos`
        });
      }
    } catch (error: any) {
      console.error('Error toggling medication:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando medicamento...</p>
        </div>
      </div>
    );
  }

  if (!medication) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/medications')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al catálogo
        </Button>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
            {/* Image */}
            <div className="md:col-span-1">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                {medication.image_url ? (
                  <img
                    src={medication.image_url}
                    alt={medication.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Pill className="w-32 h-32 text-blue-400" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{medication.name}</h1>
                <p className="text-lg text-muted-foreground">
                  {medication.active_ingredient}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm">
                  {medication.therapeutic_class}
                </Badge>
                <Badge variant={medication.lactation_safe ? "default" : "secondary"}>
                  {medication.lactation_safe ? "Seguro en lactancia" : "No en lactancia"}
                </Badge>
                <Badge variant={medication.pediatric_use ? "default" : "secondary"}>
                  {medication.pediatric_use ? "Uso pediátrico" : "No pediátrico"}
                </Badge>
                <Badge variant="outline">
                  Categoría embarazo: {medication.pregnancy_category}
                </Badge>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  size="lg"
                  onClick={handleAddToMyMedications}
                  variant={isInMyMedications ? "outline" : "default"}
                  className="flex-1"
                >
                  {isInMyMedications ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      En mis medicamentos
                    </>
                  ) : (
                    <>
                      <Pill className="w-5 h-5 mr-2" />
                      Agregar a mis medicamentos
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Information Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <Tabs defaultValue="indications" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-6">
              <TabsTrigger value="indications">Indicaciones</TabsTrigger>
              <TabsTrigger value="dosage">Dosificación</TabsTrigger>
              <TabsTrigger value="contraindications">Contraindicaciones</TabsTrigger>
              <TabsTrigger value="side-effects">Efectos Secundarios</TabsTrigger>
              <TabsTrigger value="mechanism">Mecanismo</TabsTrigger>
              <TabsTrigger value="interactions">Interacciones</TabsTrigger>
            </TabsList>

            {/* Indicaciones */}
            <TabsContent value="indications" className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Indicaciones Terapéuticas</h3>
              <ul className="space-y-3">
                {medication.indications.map((indication, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{indication}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            {/* Dosificación */}
            <TabsContent value="dosage" className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Información de Dosificación</h3>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium mb-2">Dosis recomendada:</p>
                    <p className="text-sm leading-relaxed">{medication.dosage_info}</p>
                  </div>
                </div>
              </div>

              {medication.elderly_considerations && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium mb-2">Consideraciones en adultos mayores:</p>
                      <p className="text-sm leading-relaxed">{medication.elderly_considerations}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Contraindicaciones */}
            <TabsContent value="contraindications" className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Contraindicaciones</h3>
              <ul className="space-y-3">
                {medication.contraindications.map((contraindication, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{contraindication}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            {/* Efectos Secundarios */}
            <TabsContent value="side-effects" className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Efectos Secundarios Comunes</h3>
              <ul className="space-y-3">
                {medication.side_effects.map((effect, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            {/* Mecanismo de Acción */}
            <TabsContent value="mechanism" className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Mecanismo de Acción</h3>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <p className="text-sm leading-relaxed">{medication.mechanism_of_action}</p>
                </div>
              </div>
            </TabsContent>

            {/* Interacciones con Plantas Medicinales */}
            <TabsContent value="interactions" className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Interacciones con Plantas Medicinales</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Aquí encontrarás información sobre las interacciones de este medicamento con plantas medicinales.
                </p>
              </div>

              {/* Advertencias de Interacciones */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Interacciones con tus Plantas Actuales
                </h4>
                <InteractionChecker medicationId={medication.id} medicationName={medication.name} />
              </div>

              {/* Plantas Recomendadas */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Plantas Complementarias y Beneficiosas
                </h4>
                <RecommendedPlantsForMedication 
                  medicationName={medication.name}
                  medicationCategory={medication.category}
                  medicationTags={medication.tags}
                />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
