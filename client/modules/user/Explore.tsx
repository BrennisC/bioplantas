import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase, type Plant } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/modules/auth/useAuth";
import PlantFilters from "@/modules/plants/PlantFilters";
import PlantSearchBar from "@/modules/plants/PlantSearchBar";
import ViewToggle, { type ViewType } from "@/modules/plants/ViewToggle";
import PlantSortDropdown, { type SortOption } from "@/modules/plants/PlantSortDropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Shield, Filter, X, Search } from "lucide-react"; // ⬅️ Re-agregados Filter, X, Search
import OnboardingWizard from "@/components/OnboardingWizard";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAilments, setSelectedAilments] = useState<string[]>([]);
  const [view, setView] = useState<ViewType>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onlySafeForMe, setOnlySafeForMe] = useState(false); // ⬅️ NUEVO: Toggle para filtrar solo seguras
  const [userProfile, setUserProfile] = useState<any>(null); // ⬅️ NUEVO: Perfil del usuario
  const { toast } = useToast();
  const { session } = useAuth();
  const user = session?.user;

  // Inicializar desde URL params
  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const tags = searchParams.get('tags');
    const ailments = searchParams.get('ailments');

    if (search) setSearchQuery(search);
    if (category) setSelectedCategories([category]);
    if (tags) setSelectedTags(tags.split(','));
    if (ailments) setSelectedAilments(ailments.split(','));
  }, []);

  useEffect(() => {
    fetchPlants();
    if (user) {
      checkMedicalProfile();
    }
  }, [user]);

  const checkMedicalProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_medical_profile')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      if (!data || !data.onboarding_completed) {
        setShowOnboarding(true);
        setUserProfile(null);
      } else {
        // Obtener nombres de las condiciones médicas del usuario
        if (data.conditions && data.conditions.length > 0) {
          const { data: conditionsData } = await supabase
            .from('medical_conditions')
            .select('name')
            .in('id', data.conditions);
          
          // Agregar los nombres de las condiciones al perfil
          data.conditionNames = conditionsData?.map(c => c.name) || [];
        } else {
          data.conditionNames = [];
        }
        
        setUserProfile(data); // ⬅️ Guardar perfil completo con nombres de condiciones
        console.log('👤 Perfil del usuario cargado:', data);
      }
    } catch (error: any) {
      console.error('Error checking profile:', error);
    }
  };

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

  // Filtrar y ordenar plantas
  const filteredAndSortedPlants = useMemo(() => {
    let result = [...plants];

    // ⬅️ NUEVO: Si el usuario tiene condiciones médicas, priorizar plantas relevantes
    if (userProfile && userProfile.conditionNames && userProfile.conditionNames.length > 0) {
      console.log('🔍 Condiciones del usuario:', userProfile.conditionNames);
      
      // Separar plantas relevantes y no relevantes
      const relevantPlants: Plant[] = [];
      const otherPlants: Plant[] = [];
      
      result.forEach(plant => {
        // Verificar si la planta trata alguna de las condiciones del usuario
        const treatsUserCondition = plant.ailments?.some(ailment => 
          userProfile.conditionNames.some((condition: string) => 
            ailment.toLowerCase().includes(condition.toLowerCase()) ||
            condition.toLowerCase().includes(ailment.toLowerCase())
          )
        );
        
        if (treatsUserCondition) {
          relevantPlants.push(plant);
        } else {
          otherPlants.push(plant);
        }
      });
      
      // Mostrar primero las plantas relevantes
      result = [...relevantPlants, ...otherPlants];
      console.log(`🌿 Plantas relevantes para el usuario: ${relevantPlants.length}/${plants.length}`);
    }

    // ⬅️ Filtro de seguridad basado en perfil médico
    if (onlySafeForMe && userProfile) {
      result = result.filter(p => {
        // Si está embarazada, solo mostrar plantas seguras en embarazo
        if (userProfile.is_pregnant && p.safe_pregnancy === false) return false;
        // Si está lactando, solo mostrar plantas seguras en lactancia
        if (userProfile.is_lactating && p.safe_lactation === false) return false;
        // Si tiene niños, solo mostrar plantas seguras para niños
        if (userProfile.has_children && p.safe_children === false) return false;
        return true;
      });
    }

    // Filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.scientific_name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.properties?.toLowerCase().includes(query)
      );
    }

    // Filtro de categorías
    if (selectedCategories.length > 0) {
      result = result.filter(p => 
        p.category && selectedCategories.includes(p.category)
      );
    }

    // Filtro de tags
    if (selectedTags.length > 0) {
      result = result.filter(p =>
        p.tags && p.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // Filtro de ailments
    if (selectedAilments.length > 0) {
      result = result.filter(p =>
        p.ailments && p.ailments.some(ailment => selectedAilments.includes(ailment))
      );
    }

    // Ordenar
    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "date-desc":
        result.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case "date-asc":
        result.sort((a, b) => 
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
        break;
      case "favorites-desc":
        // Por ahora ordenamos por nombre, en el futuro se puede agregar contador de favoritos
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
    }

    return result;
  }, [plants, searchQuery, selectedCategories, selectedTags, selectedAilments, sortBy, onlySafeForMe, userProfile]);

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedAilments([]);
    // Limpiar URL params
    setSearchParams({});
  };

  // Actualizar URL params cuando cambian los filtros
  useEffect(() => {
    const params: Record<string, string> = {};
    
    if (searchQuery) params.search = searchQuery;
    if (selectedCategories.length > 0) params.category = selectedCategories[0];
    if (selectedTags.length > 0) params.tags = selectedTags.join(',');
    if (selectedAilments.length > 0) params.ailments = selectedAilments.join(',');
    
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategories, selectedTags, selectedAilments]);

  const hasActiveFilters = 
    searchQuery || 
    selectedCategories.length > 0 || 
    selectedTags.length > 0 || 
    selectedAilments.length > 0;

  if (loading) {
    return (
      <section className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="h-10 bg-muted rounded-xl animate-pulse w-full max-w-2xl mx-auto" />
          <div className="h-14 bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="flex gap-6">
          <div className="w-72 h-[600px] bg-muted rounded-xl animate-pulse hidden lg:block" />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden bg-card animate-pulse">
                <div className="aspect-[4/3] bg-muted/40" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Onboarding Wizard */}
      {user && (
        <OnboardingWizard
          open={showOnboarding}
          userId={user.id}
          onComplete={() => {
            setShowOnboarding(false);
            checkMedicalProfile(); // ⬅️ Recargar perfil después de completar
          }}
        />
      )}

      {/* Header con título y búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 space-y-4"
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">
              Catálogo de Plantas Medicinales
            </h1>
          </div>
          <p className="text-muted-foreground">
            Explora nuestra colección de {plants.length} plantas medicinales
          </p>
          
          {/* Badge de personalización */}
          {userProfile && userProfile.conditionNames && userProfile.conditionNames.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Recomendaciones personalizadas según tu perfil
              </span>
            </div>
          )}
        </div>

        {/* Barra de búsqueda */}
        <PlantSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          resultsCount={filteredAndSortedPlants.length}
        />
      </motion.div>

      {/* Toolbar: Contador + Limpiar Filtros + View Toggle + Sort */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Contador de resultados */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {hasActiveFilters ? (
                <>
                  <span className="text-primary">{filteredAndSortedPlants.length}</span>
                  <span className="text-muted-foreground"> de {plants.length} plantas</span>
                </>
              ) : (
                <span className="text-muted-foreground">{plants.length} plantas</span>
              )}
            </span>
          </div>

          {/* Botón Limpiar Filtros */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllFilters}
              className="gap-2 h-8 text-xs"
            >
              <X className="w-3 h-3" />
              Limpiar filtros
            </Button>
          )}

          {/* ⬅️ NUEVO: Botón Solo Plantas Seguras */}
          {userProfile && (
            <Button
              variant={onlySafeForMe ? "default" : "outline"}
              size="sm"
              onClick={() => setOnlySafeForMe(!onlySafeForMe)}
              className="gap-2 h-8 text-xs"
            >
              <Shield className="w-3 h-3" />
              Solo seguras para mí
            </Button>
          )}

          {/* Badges de filtros activos */}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: "{searchQuery.slice(0, 20)}{searchQuery.length > 20 ? '...' : ''}"
              <button
                onClick={() => setSearchQuery("")}
                className="ml-1 hover:bg-background/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedCategories.map(cat => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {cat}
              <button
                onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))}
                className="ml-1 hover:bg-background/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        {/* View Toggle + Sort */}
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <PlantSortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </motion.div>

      {/* Layout: Filtros + Grid/Lista */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de Filtros */}
        <PlantFilters
          selectedCategories={selectedCategories}
          selectedTags={selectedTags}
          selectedAilments={selectedAilments}
          onCategoryChange={setSelectedCategories}
          onTagChange={setSelectedTags}
          onAilmentChange={setSelectedAilments}
          onClearAll={handleClearAllFilters}
        />

        {/* Contenido Principal */}
        <div className="flex-1">
          {filteredAndSortedPlants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 px-4"
            >
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">
                No se encontraron plantas
              </h3>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters
                  ? "Intenta ajustar los filtros para ver más resultados"
                  : "No hay plantas disponibles aún"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAllFilters}
                  className="btn btn-outline"
                >
                  Limpiar filtros
                </button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {view === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredAndSortedPlants.map((p, i) => (
                    <PlantCardGrid key={p.id} plant={p} index={i} userProfile={userProfile} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredAndSortedPlants.map((p, i) => (
                    <PlantCardList key={p.id} plant={p} index={i} userProfile={userProfile} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

// Componente PlantCard para vista Grid
function PlantCardGrid({ plant, index, userProfile }: { plant: Plant; index: number; userProfile?: any }) {
  const navigate = useNavigate();
  
  // Verificar si esta planta es relevante para el usuario
  const isRelevantForUser = userProfile?.conditionNames?.some((condition: string) =>
    plant.ailments?.some((ailment: string) =>
      ailment.toLowerCase().includes(condition.toLowerCase()) ||
      condition.toLowerCase().includes(ailment.toLowerCase())
    )
  );
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-xl border border-border overflow-hidden bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300"
    >
      {/* Imagen */}
      <div className="aspect-[4/3] bg-muted/40 overflow-hidden relative cursor-pointer" onClick={() => navigate(`/plantas/${plant.id}`)}>
        {plant.image ? (
          <img
            src={plant.image}
            alt={plant.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full grid place-items-center">
            <Leaf className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        {plant.category && (
          <Badge className="absolute top-2 right-2 bg-background/90 backdrop-blur">
            {plant.category}
          </Badge>
        )}
        {/* Badge de recomendación personalizada */}
        {isRelevantForUser && (
          <Badge className="absolute top-2 left-2 bg-green-500 text-white">
            ✨ Para ti
          </Badge>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{plant.name}</h3>
        {plant.scientific_name && (
          <p className="text-xs text-muted-foreground italic mb-2 line-clamp-1">
            {plant.scientific_name}
          </p>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {plant.description}
        </p>

        {/* Tags */}
        {plant.tags && plant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {plant.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {plant.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{plant.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <button 
          onClick={() => navigate(`/plantas/${plant.id}`)}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          Ver detalles
        </button>
      </div>
    </motion.article>
  );
}

// Componente PlantCard para vista Lista
function PlantCardList({ plant, index, userProfile }: { plant: Plant; index: number; userProfile?: any }) {
  const navigate = useNavigate();
  
  // Verificar si esta planta es relevante para el usuario
  const isRelevantForUser = userProfile?.conditionNames?.some((condition: string) =>
    plant.ailments?.some((ailment: string) =>
      ailment.toLowerCase().includes(condition.toLowerCase()) ||
      condition.toLowerCase().includes(ailment.toLowerCase())
    )
  );
  
  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group rounded-xl border overflow-hidden transition-all duration-300 ${
        isRelevantForUser 
          ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-lg' 
          : 'border-border bg-card hover:shadow-lg hover:border-primary/50'
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Imagen */}
        <div className="sm:w-48 aspect-[4/3] sm:aspect-square bg-muted/40 overflow-hidden relative flex-shrink-0 cursor-pointer" onClick={() => navigate(`/plantas/${plant.id}`)}>
          {plant.image ? (
            <img
              src={plant.image}
              alt={plant.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full grid place-items-center">
              <Leaf className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          {/* Badge de recomendación personalizada */}
          {isRelevantForUser && (
            <Badge className="absolute top-2 left-2 bg-green-500 text-white">
              ✨ Recomendada para ti
            </Badge>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-1">{plant.name}</h3>
              {plant.scientific_name && (
                <p className="text-sm text-muted-foreground italic">
                  {plant.scientific_name}
                </p>
              )}
            </div>
            {plant.category && (
              <Badge className="ml-4">
                {plant.category}
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-4 line-clamp-3">
            {plant.description}
          </p>

          {/* Tags y Ailments */}
          <div className="flex flex-wrap gap-2 mb-4">
            {plant.tags && plant.tags.slice(0, 5).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {plant.ailments && plant.ailments.slice(0, 3).map(ailment => (
              <Badge key={ailment} className="text-xs bg-green-500 hover:bg-green-600">
                {ailment}
              </Badge>
            ))}
          </div>

          <button 
            onClick={() => navigate(`/plantas/${plant.id}`)}
            className="py-2 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </motion.article>
  );
}
