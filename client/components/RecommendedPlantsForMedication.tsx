import { useState, useEffect } from "react";
import { Leaf, CheckCircle2, ArrowRight, Sparkles, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Plant {
  id: string;
  name: string;
  scientific_name: string;
  category: string;
  description: string;
  image_url: string | null;
}

interface Interaction {
  plant_id: string;
  plant_name: string;
  severity: string;
  interaction_type: string;
  mechanism: string;
  recommendation: string;
}

interface RecommendedPlantsProps {
  medicationName: string;
  medicationCategory?: string;
  medicationTags?: string[];
}

export default function RecommendedPlantsForMedication({ 
  medicationName,
  medicationCategory,
  medicationTags 
}: RecommendedPlantsProps) {
  const [recommendedPlants, setRecommendedPlants] = useState<Plant[]>([]);
  const [beneficialInteractions, setBeneficialInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendedPlants();
  }, [medicationName, medicationCategory, medicationTags]);

  const fetchRecommendedPlants = async () => {
    try {
      setLoading(true);

      // 1. Buscar interacciones BENEFICIOSAS (LEVE con tipo SINÉRGICA o BENEFICIOSA)
      const { data: interactions, error: intError } = await supabase
        .from('medication_plant_interactions')
        .select('*')
        .eq('medication_name', medicationName)
        .or('severity.eq.LEVE,interaction_type.ilike.%BENEFICIOSA%,interaction_type.ilike.%SINÉRGICA%');

      if (intError) throw intError;

      if (interactions && interactions.length > 0) {
        setBeneficialInteractions(interactions);

        // Obtener los IDs de las plantas de las interacciones beneficiosas
        const plantIds = interactions
          .map(int => int.plant_id)
          .filter(Boolean);

        if (plantIds.length > 0) {
          const { data: plants, error: plantError } = await supabase
            .from('plants')
            .select('id, name, scientific_name, category, description, image_url')
            .in('id', plantIds)
            .limit(6);

          if (plantError) throw plantError;
          setRecommendedPlants(plants || []);
        }
      }

      // 2. Si no hay interacciones beneficiosas, buscar plantas de la misma categoría (complementarias)
      if (!interactions || interactions.length === 0) {
        if (medicationCategory) {
          const { data: plants, error: plantError } = await supabase
            .from('plants')
            .select('id, name, scientific_name, category, description, image_url')
            .eq('category', medicationCategory)
            .limit(6);

          if (plantError) throw plantError;
          setRecommendedPlants(plants || []);
        }
      }

    } catch (error) {
      console.error('Error fetching recommended plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInteractionForPlant = (plantName: string) => {
    return beneficialInteractions.find(int => int.plant_name === plantName);
  };

  if (loading) {
    return null; // No mostrar nada mientras carga
  }

  if (recommendedPlants.length === 0) {
    // Mostrar mensaje informativo si no hay plantas recomendadas
    return (
      <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              No hay plantas recomendadas disponibles
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Actualmente no tenemos información sobre interacciones beneficiosas para este medicamento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {recommendedPlants.map((plant, index) => {
            const interaction = getInteractionForPlant(plant.name);
            
            return (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-green-200 dark:border-green-700 hover:border-green-400 dark:hover:border-green-500"
                onClick={() => navigate(`/plantas/${plant.id}`)}
              >
                <div className="flex items-start gap-3">
                  {plant.image_url ? (
                    <img 
                      src={plant.image_url} 
                      alt={plant.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {plant.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">
                      {plant.scientific_name}
                    </p>
                    
                    {interaction ? (
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {interaction.interaction_type === 'SINÉRGICA BENEFICIOSA' || interaction.interaction_type.includes('BENEFICIOSA')
                          ? 'Sinergia Beneficiosa'
                          : 'Compatible'
                        }
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                        Complementaria
                      </Badge>
                    )}
                  </div>
                  
                  <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                </div>

                {interaction && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="text-xs text-green-800 dark:text-green-300 font-medium mb-1">
                      💡 Beneficio:
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      {interaction.mechanism}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {beneficialInteractions.length > 0 && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-300">
              <strong>Nota:</strong> Estas combinaciones son generalmente seguras y pueden potenciar los efectos terapéuticos. 
              Siempre consulta con tu médico antes de combinar tratamientos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
