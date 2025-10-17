import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Heart, Search, TrendingUp, Users, Leaf, Star, Crown, Award } from "lucide-react";

interface PlantWithFavorites {
  id: string;
  name: string;
  scientific_name: string;
  category: string;
  image?: string;
  favorite_count: number;
  users: { id: string; email: string }[];
}

interface TrendingPlant {
  id: string;
  name: string;
  scientific_name: string;
  category: string;
  image?: string;
  recent_favorites: number;
  trend: "up" | "down" | "stable";
}

export default function FavoritesManager() {
  const [plants, setPlants] = useState<PlantWithFavorites[]>([]);
  const [trending, setTrending] = useState<TrendingPlant[]>([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"favorites" | "alphabetical">("favorites");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"popular" | "trending">("popular");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchPopularPlants(),
      fetchTrendingPlants()
    ]);
    setLoading(false);
  };

  const fetchPopularPlants = async () => {
    try {
      // Obtener todos los favoritos con información de usuarios
      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select(`
          plant_id,
          user_id,
          users:user_id (
            id,
            email
          )
        `);

      if (favError) throw favError;

      // Agrupar por planta
      const plantFavoritesMap = new Map<string, { users: any[], count: number }>();
      
      favorites?.forEach(fav => {
        if (!plantFavoritesMap.has(fav.plant_id)) {
          plantFavoritesMap.set(fav.plant_id, { users: [], count: 0 });
        }
        const plantData = plantFavoritesMap.get(fav.plant_id)!;
        plantData.count++;
        if (fav.users) {
          plantData.users.push(fav.users);
        }
      });

      // Obtener información de las plantas
      const plantIds = Array.from(plantFavoritesMap.keys());
      
      if (plantIds.length === 0) {
        setPlants([]);
        return;
      }

      const { data: plantsData, error: plantsError } = await supabase
        .from('plants')
        .select('id, name, scientific_name, category, image')
        .in('id', plantIds);

      if (plantsError) throw plantsError;

      // Combinar datos
      const plantsWithFavorites: PlantWithFavorites[] = plantsData?.map(plant => ({
        ...plant,
        favorite_count: plantFavoritesMap.get(plant.id)?.count || 0,
        users: plantFavoritesMap.get(plant.id)?.users || []
      })) || [];

      // Ordenar por cantidad de favoritos
      plantsWithFavorites.sort((a, b) => b.favorite_count - a.favorite_count);

      setPlants(plantsWithFavorites);
    } catch (error: any) {
      console.error('Error fetching popular plants:', error);
      toast({
        title: "Error al cargar plantas populares",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchTrendingPlants = async () => {
    try {
      // Favoritos de los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentFavorites, error: recentError } = await supabase
        .from('favorites')
        .select('plant_id, created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      // Favoritos de hace 7-14 días
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data: previousFavorites, error: previousError } = await supabase
        .from('favorites')
        .select('plant_id')
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString());

      if (previousError) throw previousError;

      // Contar favoritos recientes por planta
      const recentCounts = new Map<string, number>();
      recentFavorites?.forEach(fav => {
        recentCounts.set(fav.plant_id, (recentCounts.get(fav.plant_id) || 0) + 1);
      });

      // Contar favoritos previos por planta
      const previousCounts = new Map<string, number>();
      previousFavorites?.forEach(fav => {
        previousCounts.set(fav.plant_id, (previousCounts.get(fav.plant_id) || 0) + 1);
      });

      // Obtener plantas con actividad reciente
      const trendingPlantIds = Array.from(recentCounts.keys());
      
      if (trendingPlantIds.length === 0) {
        setTrending([]);
        return;
      }

      const { data: plantsData, error: plantsError } = await supabase
        .from('plants')
        .select('id, name, scientific_name, category, image')
        .in('id', trendingPlantIds);

      if (plantsError) throw plantsError;

      // Calcular tendencias
      const trendingPlants: TrendingPlant[] = plantsData?.map(plant => {
        const recentCount = recentCounts.get(plant.id) || 0;
        const previousCount = previousCounts.get(plant.id) || 0;
        
        let trend: "up" | "down" | "stable" = "stable";
        if (recentCount > previousCount) trend = "up";
        else if (recentCount < previousCount) trend = "down";

        return {
          ...plant,
          recent_favorites: recentCount,
          trend
        };
      }) || [];

      // Ordenar por favoritos recientes
      trendingPlants.sort((a, b) => b.recent_favorites - a.recent_favorites);

      setTrending(trendingPlants.slice(0, 10)); // Top 10 trending
    } catch (error: any) {
      console.error('Error fetching trending plants:', error);
      toast({
        title: "Error al cargar tendencias",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filtered = useMemo(() => {
    let result = plants.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.scientific_name?.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase())
    );

    if (sortBy === "alphabetical") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => b.favorite_count - a.favorite_count);
    }

    return result;
  }, [plants, query, sortBy]);

  const filteredTrending = useMemo(() => {
    return trending.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.scientific_name?.toLowerCase().includes(query.toLowerCase())
    );
  }, [trending, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Analizando tendencias...</p>
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
            <Heart className="h-7 w-7 text-red-500" />
            Favoritos y Tendencias
          </h2>
          <p className="text-muted-foreground mt-1">
            Análisis de popularidad de plantas
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchData}
          className="btn flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Actualizar datos
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-bold">
                {plants.reduce((sum, p) => sum + p.favorite_count, 0)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Favoritos en la plataforma</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500/10 text-green-500 p-3 rounded-lg">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plantas</p>
              <p className="text-3xl font-bold">{plants.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Con al menos 1 favorito</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tendencias</p>
              <p className="text-3xl font-bold">{trending.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Plantas activas esta semana</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("popular")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "popular"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <Crown className="h-4 w-4" />
          Más Populares ({plants.length})
        </button>
        <button
          onClick={() => setActiveTab("trending")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "trending"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Tendencias ({trending.length})
        </button>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar plantas..."
            className="input pl-10 w-full"
          />
        </div>
        
        {activeTab === "popular" && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input cursor-pointer"
          >
            <option value="favorites">Por favoritos</option>
            <option value="alphabetical">Alfabético</option>
          </select>
        )}
      </div>

      {/* Popular Plants Content */}
      {activeTab === "popular" && (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {query ? "No se encontraron plantas" : "No hay plantas con favoritos"}
              </p>
            </div>
          ) : (
            filtered.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Ranking Badge */}
                  <div className="flex-shrink-0">
                    {index === 0 && (
                      <div className="bg-yellow-500/20 text-yellow-500 w-12 h-12 rounded-full flex items-center justify-center">
                        <Crown className="h-6 w-6" />
                      </div>
                    )}
                    {index === 1 && (
                      <div className="bg-gray-400/20 text-gray-400 w-12 h-12 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6" />
                      </div>
                    )}
                    {index === 2 && (
                      <div className="bg-orange-600/20 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6" />
                      </div>
                    )}
                    {index > 2 && (
                      <div className="bg-muted text-muted-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold">
                        #{index + 1}
                      </div>
                    )}
                  </div>

                  {/* Plant Image */}
                  {plant.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={plant.image} 
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Plant Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{plant.name}</h3>
                    <p className="text-sm text-muted-foreground italic">{plant.scientific_name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                        {plant.category}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="font-bold text-lg">{plant.favorite_count}</span> favoritos
                      </span>
                    </div>
                  </div>

                  {/* Users List */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {plant.users.length} {plant.users.length === 1 ? 'usuario' : 'usuarios'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Users Detail */}
                {plant.users.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Usuarios que la favoritearon:</p>
                    <div className="flex flex-wrap gap-2">
                      {plant.users.slice(0, 5).map((user: any) => (
                        <span 
                          key={user.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20"
                        >
                          {user.email}
                        </span>
                      ))}
                      {plant.users.length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                          +{plant.users.length - 5} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Trending Plants Content */}
      {activeTab === "trending" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrending.length === 0 ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {query ? "No se encontraron tendencias" : "No hay plantas en tendencia esta semana"}
              </p>
            </div>
          ) : (
            filteredTrending.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-card p-4 hover:shadow-lg transition-all group relative overflow-hidden"
              >
                {/* Trend Badge */}
                <div className="absolute top-3 right-3">
                  {plant.trend === "up" && (
                    <div className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Subiendo
                    </div>
                  )}
                  {plant.trend === "down" && (
                    <div className="bg-red-500/20 text-red-500 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 rotate-180" />
                      Bajando
                    </div>
                  )}
                  {plant.trend === "stable" && (
                    <div className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full text-xs font-medium">
                      Estable
                    </div>
                  )}
                </div>

                {/* Plant Image */}
                {plant.image ? (
                  <div className="w-full h-40 rounded-lg overflow-hidden bg-muted mb-3">
                    <img 
                      src={plant.image} 
                      alt={plant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 rounded-lg bg-muted flex items-center justify-center mb-3">
                    <Leaf className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Plant Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-1">{plant.name}</h3>
                  <p className="text-xs text-muted-foreground italic mb-2">{plant.scientific_name}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                      {plant.category}
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold">{plant.recent_favorites}</span>
                      <span className="text-xs text-muted-foreground">esta semana</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
