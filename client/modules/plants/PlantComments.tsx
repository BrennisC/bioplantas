import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Star, 
  MessageSquare, 
  Send, 
  Trash2,
  Edit2,
  X,
  Loader2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  plant_id: string;
  user_id: string;
  content: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

interface PlantCommentsProps {
  plantId: string;
  plantName: string;
}

export default function PlantComments({ plantId, plantName }: PlantCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState<number>(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [plantId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('plant_id', plantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Obtener información de usuarios
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: users } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);

        const enrichedComments = data.map(comment => {
          const user = users?.find(u => u.id === comment.user_id);
          return {
            ...comment,
            user_name: user?.name || user?.email?.split('@')[0] || 'Usuario',
            user_email: user?.email
          };
        });

        setComments(enrichedComments);
      } else {
        setComments([]);
      }
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

  const handleSubmitComment = async () => {
    if (!currentUser) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para dejar un comentario",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Comentario vacío",
        description: "Por favor escribe un comentario",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('comments')
        .insert({
          plant_id: plantId,
          user_id: currentUser.id,
          content: newComment.trim(),
          rating: newRating || null
        });

      if (error) throw error;

      toast({
        title: "¡Comentario publicado!",
        description: "Tu comentario ha sido agregado exitosamente"
      });

      setNewComment("");
      setNewRating(0);
      fetchComments();
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error al publicar comentario",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setEditRating(comment.rating || 0);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditRating(0);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast({
        title: "Comentario vacío",
        description: "Por favor escribe un comentario",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: editContent.trim(),
          rating: editRating || null
        })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comentario actualizado",
        description: "Tu comentario ha sido modificado exitosamente"
      });

      setEditingId(null);
      setEditContent("");
      setEditRating(0);
      fetchComments();
    } catch (error: any) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error al actualizar comentario",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comentario eliminado",
        description: "Tu comentario ha sido eliminado exitosamente"
      });

      setDeletingId(null);
      fetchComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error al eliminar comentario",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const renderStars = (
    rating: number,
    interactive: boolean = false,
    onRate?: (rating: number) => void,
    hoveredRating: number = 0
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`transition-all ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const averageRating = comments.length > 0
    ? comments.filter(c => c.rating).reduce((acc, c) => acc + (c.rating || 0), 0) / 
      comments.filter(c => c.rating).length
    : 0;

  const ratingsCount = comments.filter(c => c.rating).length;

  return (
    <div className="border-t pt-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Comentarios y Valoraciones
          </h3>
          {ratingsCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({ratingsCount} {ratingsCount === 1 ? 'valoración' : 'valoraciones'})
              </span>
            </div>
          )}
        </div>

        {/* Formulario para nuevo comentario */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tu valoración (opcional)
                </label>
                {renderStars(newRating, true, setNewRating, hoverRating)}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tu comentario sobre {plantName}
                </label>
                <Textarea
                  placeholder="Comparte tu experiencia con esta planta..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                  disabled={!currentUser}
                />
              </div>

              {!currentUser && (
                <p className="text-sm text-muted-foreground italic">
                  Debes iniciar sesión para dejar un comentario
                </p>
              )}

              <Button
                onClick={handleSubmitComment}
                disabled={!currentUser || submitting || !newComment.trim()}
                className="gap-2 w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publicar comentario
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de comentarios */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                Sé el primero en comentar sobre {plantName}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    {editingId === comment.id ? (
                      // Modo edición
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Valoración
                          </label>
                          {renderStars(editRating, true, setEditRating)}
                        </div>
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateComment(comment.id)}
                            className="gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Modo vista
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {comment.user_name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="font-semibold text-sm">
                                {comment.user_name || 'Usuario'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                {comment.updated_at !== comment.created_at && ' (editado)'}
                              </p>
                            </div>

                            {currentUser?.id === comment.user_id && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStartEdit(comment)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeletingId(comment.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {comment.rating && (
                            <div className="mb-2">
                              {renderStars(comment.rating)}
                            </div>
                          )}

                          <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Alert Dialog para confirmar eliminación */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tu comentario será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDeleteComment(deletingId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
