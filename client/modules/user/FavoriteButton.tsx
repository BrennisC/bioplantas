import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/modules/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface FavoriteButtonProps {
  plantId: string;
  plantName?: string;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export default function FavoriteButton({ 
  plantId, 
  plantName = "esta planta",
  showCount = false,
  size = "md",
  variant = "default"
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Tamaños del botón
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  // Variantes de estilo
  const variants = {
    default: isFavorite 
      ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30" 
      : "bg-background border-border hover:bg-muted hover:border-red-500/50",
    outline: isFavorite
      ? "bg-transparent border-red-500 text-red-500 hover:bg-red-500/10"
      : "bg-transparent border-border hover:bg-muted hover:border-red-500/50",
    ghost: isFavorite
      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      : "bg-transparent hover:bg-muted text-muted-foreground"
  };

  useEffect(() => {
    checkIfFavorite();
    if (showCount) {
      fetchFavoriteCount();
    }
  }, [plantId, session]);

  // Verificar si la planta está en favoritos del usuario
  const checkIfFavorite = async () => {
    if (!session) {
      setIsFavorite(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.id)
        .eq('plant_id', plantId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favorite:', error);
        return;
      }

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  // Obtener el conteo total de favoritos para esta planta
  const fetchFavoriteCount = async () => {
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('plant_id', plantId);

      if (error) {
        console.error('Error fetching favorite count:', error);
        return;
      }

      setFavoriteCount(count || 0);
    } catch (error) {
      console.error('Error fetching favorite count:', error);
    }
  };

  // Toggle favorito
  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar navegación si está dentro de un Link
    e.stopPropagation(); // Evitar propagación del evento

    // Si no hay sesión, redirigir a login
    if (!session) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.id)
          .eq('plant_id', plantId);

        if (error) throw error;

        setIsFavorite(false);
        if (showCount) {
          setFavoriteCount(prev => Math.max(0, prev - 1));
        }

        toast({
          title: "💔 Eliminado de favoritos",
          description: `${plantName} se ha eliminado de tus favoritos`,
        });
      } else {
        // Agregar a favoritos
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: session.id,
            plant_id: plantId
          });

        if (error) throw error;

        setIsFavorite(true);
        if (showCount) {
          setFavoriteCount(prev => prev + 1);
        }

        toast({
          title: "❤️ Agregado a favoritos",
          description: `${plantName} se ha guardado en tus favoritos`,
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar favoritos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleFavorite}
        disabled={loading}
        className={`
          ${sizes[size]}
          ${variants[variant]}
          rounded-full border-2 
          flex items-center justify-center
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          relative
        `}
        title={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : (
          <motion.div
            initial={false}
            animate={{ 
              scale: isFavorite ? [1, 1.3, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Heart 
              className={`${iconSizes[size]} transition-all`}
              fill={isFavorite ? "currentColor" : "none"}
            />
          </motion.div>
        )}
      </motion.button>

      {/* Contador de favoritos */}
      {showCount && favoriteCount > 0 && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-sm font-medium text-muted-foreground"
        >
          {favoriteCount} {favoriteCount === 1 ? 'persona' : 'personas'}
        </motion.span>
      )}
    </div>
  );
}
