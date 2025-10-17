import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type Plant } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  Leaf,
  Trash2,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";

interface FavoriteWithPlant {
  id: string;
  plant_id: string;
  created_at: string;
  plants: Plant;
}

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteWithPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);
      await fetchFavorites(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/login');
    }
  };

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          plant_id,
          created_at,
          plants (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion ya que Supabase retorna el join correctamente
      setFavorites((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error al cargar favoritos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string, plantName: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      
      toast({
        title: "Eliminado de favoritos",
        description: `${plantName} ha sido eliminado de tus favoritos`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewPlant = (plantId: string) => {
    navigate(`/plantas/${plantId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 grid place-items-center">
              <Heart className="w-6 h-6 text-primary fill-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mis Favoritos</h1>
              <p className="text-sm text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? 'planta guardada' : 'plantas guardadas'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 grid place-items-center">
              <Heart className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No tienes favoritos aún</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explora nuestro catálogo y guarda las plantas que más te interesen para acceder fácilmente a ellas más tarde.
            </p>
            <Button onClick={() => navigate('/explorar')} size="lg" className="gap-2">
              <Leaf className="w-4 h-4" />
              Explorar plantas
            </Button>
          </motion.div>
        ) : (
          /* Grid de Favoritos */
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Imagen */}
                  <div
                    className="aspect-square bg-muted/40 cursor-pointer relative overflow-hidden"
                    onClick={() => handleViewPlant(favorite.plant_id)}
                  >
                    {favorite.plants.image ? (
                      <img
                        src={favorite.plants.image}
                        alt={favorite.plants.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center">
                        <Leaf className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Overlay con botones */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPlant(favorite.plant_id);
                        }}
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold line-clamp-1 flex-1">
                        {favorite.plants.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveFavorite(favorite.id, favorite.plants.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {favorite.plants.scientific_name && (
                      <p className="text-xs text-green-600 dark:text-green-400 italic mb-2 line-clamp-1">
                        {favorite.plants.scientific_name}
                      </p>
                    )}

                    {favorite.plants.category && (
                      <Badge variant="secondary" className="text-xs mb-3">
                        {favorite.plants.category}
                      </Badge>
                    )}

                    {favorite.plants.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {favorite.plants.description}
                      </p>
                    )}

                    {/* Tags */}
                    {favorite.plants.tags && favorite.plants.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {favorite.plants.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {favorite.plants.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            +{favorite.plants.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Fecha agregada */}
                    <p className="text-xs text-muted-foreground/60 mt-2 pt-2 border-t border-border">
                      Agregado {new Date(favorite.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Info adicional */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 rounded-lg border border-primary/30 bg-primary/5 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Acceso rápido a tus plantas favoritas</p>
              <p className="text-muted-foreground text-xs">
                Tus plantas favoritas se guardan automáticamente y puedes acceder a ellas en cualquier momento desde esta página.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
