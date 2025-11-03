import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Pill, Heart, AlertTriangle, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Medication {
  id: string;
  name: string;
  active_ingredient: string;
  therapeutic_class: string;
  indications: string[];
  contraindications: string[];
  side_effects: string[];
  pregnancy_category: string;
  lactation_safe: boolean;
  pediatric_use: boolean;
  image_url: string | null;
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      console.error('Error fetching medications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los medicamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener clases terapéuticas únicas
  const therapeuticClasses = useMemo(() => {
    const classes = new Set(medications.map(m => m.therapeutic_class));
    return Array.from(classes).sort();
  }, [medications]);

  // Filtrar medicamentos
  const filteredMedications = useMemo(() => {
    return medications.filter(medication => {
      const matchesSearch = 
        medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medication.active_ingredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medication.therapeutic_class.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = selectedClass === "all" || medication.therapeutic_class === selectedClass;

      return matchesSearch && matchesClass;
    });
  }, [medications, searchQuery, selectedClass]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando medicamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Pill className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Catálogo de Medicamentos</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Información completa sobre medicamentos convencionales con verificación de interacciones
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por nombre, principio activo o clase terapéutica..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {selectedClass !== "all" && (
                <Badge variant="secondary" className="ml-2">1</Badge>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <h3 className="font-semibold mb-3">Clase Terapéutica</h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedClass === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedClass("all")}
                >
                  Todas ({medications.length})
                </Badge>
                {therapeuticClasses.map(tc => {
                  const count = medications.filter(m => m.therapeutic_class === tc).length;
                  return (
                    <Badge
                      key={tc}
                      variant={selectedClass === tc ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedClass(tc)}
                    >
                      {tc} ({count})
                    </Badge>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredMedications.length === medications.length ? (
            <span>Mostrando {medications.length} medicamentos</span>
          ) : (
            <span>
              {filteredMedications.length} de {medications.length} medicamentos
            </span>
          )}
        </div>

        {/* Medications Grid */}
        {filteredMedications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Pill className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron medicamentos</h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar tus filtros o búsqueda
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedClass("all");
              }}
            >
              Limpiar filtros
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedications.map((medication, index) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                index={index}
                onClick={() => navigate(`/medications/${medication.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MEDICATION CARD COMPONENT
// ============================================

interface MedicationCardProps {
  medication: Medication;
  index: number;
  onClick: () => void;
}

function MedicationCard({ medication, index, onClick }: MedicationCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasInteractions, setHasInteractions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkInteractions();
  }, [medication.id]);

  const checkInteractions = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      // Verificar si hay interacciones con plantas del usuario
      const { data: userPlants } = await supabase
        .from('favorites')
        .select('plant_id')
        .eq('user_id', session.session.user.id);

      if (!userPlants || userPlants.length === 0) return;

      const { data: interactions } = await supabase
        .from('medication_plant_interactions')
        .select('id, severity')
        .eq('medication_name', medication.name)
        .in('plant_id', userPlants.map(p => p.plant_id));

      setHasInteractions(interactions && interactions.length > 0);
    } catch (error) {
      console.error('Error checking interactions:', error);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para guardar favoritos",
          variant: "destructive"
        });
        return;
      }

      // Aquí iría la lógica para guardar/quitar de favoritos
      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos",
        description: medication.name
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden group border border-transparent hover:border-blue-300 dark:hover:border-blue-700"
    >
      {/* Image or Icon */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center relative">
        {medication.image_url ? (
          <img
            src={medication.image_url}
            alt={medication.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Pill className="w-20 h-20 text-blue-400" />
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Interaction Alert */}
        {hasInteractions && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Interacción
          </div>
        )}

        {/* Badges */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {!medication.lactation_safe && (
            <Badge variant="destructive" className="text-xs">
              No lactancia
            </Badge>
          )}
          {!medication.pediatric_use && (
            <Badge variant="secondary" className="text-xs">
              No pediátrico
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors line-clamp-1">
            {medication.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {medication.active_ingredient}
          </p>
        </div>

        <Badge variant="outline" className="mb-3">
          {medication.therapeutic_class}
        </Badge>

        {/* Indications */}
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">Indicaciones principales:</h4>
          <ul className="text-sm space-y-1">
            {medication.indications.slice(0, 3).map((indication, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="line-clamp-1">{indication}</span>
              </li>
            ))}
          </ul>
          {medication.indications.length > 3 && (
            <p className="text-xs text-blue-600 mt-1">
              +{medication.indications.length - 3} más
            </p>
          )}
        </div>

        {/* Pregnancy Category */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Categoría embarazo: {medication.pregnancy_category}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
