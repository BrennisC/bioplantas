import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Search, Trash2, User, Leaf, Calendar, Filter } from "lucide-react";

interface Comment {
  id: string;
  plant_id: string;
  user_id: string;
  content: string;
  created_at: string;
  plant_name?: string;
  user_email?: string;
}

export default function CommentsManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "recent" | "oldest">("recent");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      // Obtener comentarios con información de planta y usuario
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id,
          plant_id,
          user_id,
          content,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      // Obtener nombres de plantas
      const plantIds = [...new Set(commentsData.map(c => c.plant_id))];
      const { data: plantsData } = await supabase
        .from('plants')
        .select('id, name')
        .in('id', plantIds);

      // Obtener emails de usuarios
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      // Crear mapas para búsqueda rápida
      const plantsMap = new Map(plantsData?.map(p => [p.id, p.name]) || []);
      const usersMap = new Map(usersData?.map(u => [u.id, u.email]) || []);

      // Enriquecer comentarios con nombres
      const enrichedComments = commentsData.map(comment => ({
        ...comment,
        plant_name: plantsMap.get(comment.plant_id) || 'Planta desconocida',
        user_email: usersMap.get(comment.user_id) || 'Usuario desconocido'
      }));

      setComments(enrichedComments);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error al cargar comentarios",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id: string, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el comentario de "${userName}"?`)) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado correctamente",
      });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Filtrar y ordenar comentarios
  const filtered = useMemo(() => {
    let result = comments.filter(c =>
      c.content.toLowerCase().includes(query.toLowerCase()) ||
      c.plant_name?.toLowerCase().includes(query.toLowerCase()) ||
      c.user_email?.toLowerCase().includes(query.toLowerCase())
    );

    // Aplicar filtro de ordenamiento
    if (filter === "recent") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filter === "oldest") {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    return result;
  }, [comments, query, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando comentarios...</p>
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
            <MessageSquare className="h-7 w-7" />
            Moderación de Comentarios
          </h2>
          <p className="text-muted-foreground mt-1">
            Total de comentarios: <span className="font-bold">{comments.length}</span>
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por contenido, planta o usuario..."
            className="input pl-10 w-full"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input pl-10 pr-8 cursor-pointer"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {query ? "No se encontraron comentarios" : "No hay comentarios registrados"}
            </p>
          </div>
        ) : (
          filtered.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Header: Usuario y Planta */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{comment.user_email}</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="flex items-center gap-1.5 text-green-500">
                      <Leaf className="h-4 w-4" />
                      <span className="font-medium">{comment.plant_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">{formatDate(comment.created_at)}</span>
                    </div>
                  </div>

                  {/* Contenido del comentario */}
                  <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                    <p className="text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>

                {/* Botón de eliminar */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteComment(comment.id, comment.user_email || 'Usuario')}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors flex-shrink-0"
                  title="Eliminar comentario"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
