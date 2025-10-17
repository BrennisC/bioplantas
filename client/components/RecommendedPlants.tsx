import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Sparkles, Heart, Shield, Baby, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecommendedPlant {
  id: string;  // ⬅️ CORREGIDO: UUID es string en TypeScript
  common_name: string;
  scientific_name: string;
  image: string;  // ⬅️ CORREGIDO: 'image' en vez de 'image_url'
  relevance_score: number;
  therapeutic_indications?: string;
  safe_pregnancy: boolean;
  safe_lactation: boolean;
  safe_children: boolean;
  evidence_level?: string;
}

interface RecommendedPlantsProps {
  userId: string;
}

export default function RecommendedPlants({ userId }: RecommendedPlantsProps) {
  const [plants, setPlants] = useState<RecommendedPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSafeOnly, setShowSafeOnly] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecommendedPlants();
  }, [userId]);

  const fetchRecommendedPlants = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching recommendations for user:', userId);
      
      const { data, error } = await supabase.rpc('get_recommended_plants_for_user', {
        p_user_id: userId
      });

      console.log('📊 RPC Response:', { data, error });

      if (error) {
        console.error('❌ RPC Error:', error);
        throw error;
      }
      
      console.log('✅ Recommendations loaded:', data?.length || 0, 'plants');
      setPlants(data || []);
    } catch (error: any) {
      console.error('💥 Error fetching recommended plants:', error);
      console.error('Error details:', {
        message: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      });
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las recomendaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = showSafeOnly
    ? plants.filter(p => p.safe_pregnancy && p.safe_lactation && p.safe_children)
    : plants;

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Cargando recomendaciones personalizadas...</p>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="py-16 text-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl">
        <Sparkles className="w-16 h-16 mx-auto text-primary mb-4" />
        <h3 className="text-xl font-semibold mb-2">¡Explora nuestro catálogo completo!</h3>
        <p className="text-muted-foreground mb-2">
          Estamos cargando plantas según tu perfil médico
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          💡 Mientras tanto, puedes navegar por todas nuestras plantas medicinales a continuación
        </p>
      </div>
    );
  }

  const getEvidenceBadgeColor = (level?: string) => {
    switch (level) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Recomendadas para ti</h2>
            <p className="text-sm text-muted-foreground">
              Según tu perfil médico - {plants.length} plantas encontradas
            </p>
          </div>
        </div>

        <Button
          variant={showSafeOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowSafeOnly(!showSafeOnly)}
        >
          <Shield className="w-4 h-4 mr-2" />
          Solo seguras
        </Button>
      </div>

      {filteredPlants.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No hay plantas que cumplan todos los criterios de seguridad
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlants.slice(0, 8).map((plant, index) => (
            <motion.div
              key={plant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/plantas/${plant.id}`}>
                <div className="group relative bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all cursor-pointer">
                  {/* Imagen */}
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={plant.image || "/placeholder-plant.jpg"}
                      alt={plant.common_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Badge de puntuación */}
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {plant.relevance_score} pts
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {plant.common_name}
                    </h3>
                    <p className="text-sm text-muted-foreground italic mb-3">
                      {plant.scientific_name}
                    </p>

                    {/* Indicaciones terapéuticas */}
                    {plant.therapeutic_indications && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {plant.therapeutic_indications}
                      </p>
                    )}

                    {/* Badges de seguridad */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {plant.safe_pregnancy && (
                        <Badge variant="secondary" className="text-xs bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                          <Baby className="w-3 h-3 mr-1" />
                          Embarazo
                        </Badge>
                      )}
                      {plant.safe_lactation && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          <Heart className="w-3 h-3 mr-1" />
                          Lactancia
                        </Badge>
                      )}
                      {plant.safe_children && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          <Baby className="w-3 h-3 mr-1" />
                          Niños
                        </Badge>
                      )}
                    </div>

                    {/* Evidencia científica */}
                    {plant.evidence_level && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Evidencia:</span>
                        <div className={`w-6 h-6 rounded-full ${getEvidenceBadgeColor(plant.evidence_level)} flex items-center justify-center text-white text-xs font-bold`}>
                          {plant.evidence_level}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {filteredPlants.length > 8 && (
        <div className="text-center mt-8">
          <Link to="/explorar?filter=recommended">
            <Button variant="outline" size="lg">
              Ver todas las recomendaciones ({filteredPlants.length})
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
