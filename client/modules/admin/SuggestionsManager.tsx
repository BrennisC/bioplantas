import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Eye,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PlantSuggestion {
  id: string;
  user_id: string;
  suggestion_type: 'new' | 'correction';
  plant_id: string | null;
  name: string;
  scientific_name: string;
  description: string;
  category: string | null;
  properties: string | null;
  image: string | null;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_comment: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function SuggestionsManager() {
  const [suggestions, setSuggestions] = useState<PlantSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSuggestion, setSelectedSuggestion] = useState<PlantSuggestion | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewComment, setReviewComment] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();

    // Suscripción en tiempo real
    const channel = supabase
      .channel('plant_suggestions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plant_suggestions'
        },
        () => {
          fetchSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('plant_suggestions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSuggestions(data || []);
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Error al cargar sugerencias",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedSuggestion) return;

    if (reviewAction === 'reject' && !reviewComment.trim()) {
      toast({
        title: "Razón requerida",
        description: "Por favor explica por qué se rechaza la sugerencia",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autorizado');

      if (reviewAction === 'approve') {
        const { error } = await supabase.rpc('approve_plant_suggestion', {
          suggestion_id: selectedSuggestion.id,
          admin_id: user.id,
          comment: reviewComment || null
        });

        if (error) throw error;

        toast({
          title: "✅ Sugerencia aprobada",
          description: selectedSuggestion.suggestion_type === 'new'
            ? "La planta ha sido añadida al catálogo"
            : "La corrección ha sido aplicada",
        });
      } else {
        const { error } = await supabase.rpc('reject_plant_suggestion', {
          suggestion_id: selectedSuggestion.id,
          admin_id: user.id,
          reason: reviewComment
        });

        if (error) throw error;

        toast({
          title: "❌ Sugerencia rechazada",
          description: "El usuario ha sido notificado",
        });
      }

      setReviewModal(false);
      setReviewComment("");
      setSelectedSuggestion(null);
      fetchSuggestions();
    } catch (error: any) {
      console.error('Error reviewing suggestion:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const deleteSuggestion = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la sugerencia "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('plant_suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Sugerencia eliminada",
        description: "La sugerencia ha sido eliminada permanentemente",
      });
    } catch (error: any) {
      console.error('Error deleting suggestion:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredSuggestions = suggestions.filter(s => s.status === activeTab);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: "bg-yellow-500", text: "Pendiente", icon: Clock },
      approved: { color: "bg-green-500", text: "Aprobada", icon: CheckCircle },
      rejected: { color: "bg-red-500", text: "Rechazada", icon: XCircle }
    };
    const variant = variants[status as keyof typeof variants];
    const Icon = variant.icon;

    return (
      <Badge variant="secondary" className={`${variant.color}/10 text-${variant.color.replace('bg-', '')} border-${variant.color.replace('bg-', '')}/20`}>
        <Icon className="h-3 w-3 mr-1" />
        {variant.text}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'new' ? (
      <Badge variant="default">Nueva Planta</Badge>
    ) : (
      <Badge variant="outline">Corrección</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const approvedCount = suggestions.filter(s => s.status === 'approved').length;
  const rejectedCount = suggestions.filter(s => s.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando sugerencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="h-7 w-7 text-yellow-500" />
          Sugerencias de Plantas
        </h2>
        <p className="text-muted-foreground mt-1">
          Revisa las sugerencias de usuarios: nuevas plantas y correcciones
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aprobadas</p>
              <p className="text-3xl font-bold text-green-500">{approvedCount}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rechazadas</p>
              <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">
            Pendientes {pendingCount > 0 && `(${pendingCount})`}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprobadas {approvedCount > 0 && `(${approvedCount})`}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rechazadas {rejectedCount > 0 && `(${rejectedCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-border bg-muted/30">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                No hay sugerencias {activeTab === 'pending' ? 'pendientes' : activeTab === 'approved' ? 'aprobadas' : 'rechazadas'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(suggestion.suggestion_type)}
                          {getStatusBadge(suggestion.status)}
                        </div>
                        <h3 className="text-xl font-bold">{suggestion.name}</h3>
                        <p className="text-sm italic text-muted-foreground">{suggestion.scientific_name}</p>
                      </div>
                      
                      {activeTab === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedSuggestion(suggestion);
                              setReviewAction('approve');
                              setReviewModal(true);
                            }}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedSuggestion(suggestion);
                              setReviewAction('reject');
                              setReviewModal(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Descripción:</p>
                        <p className="text-foreground">{suggestion.description}</p>
                      </div>

                      {suggestion.reason && (
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Razón de la {suggestion.suggestion_type === 'new' ? 'sugerencia' : 'corrección'}:</p>
                          <p className="text-orange-600 dark:text-orange-400">{suggestion.reason}</p>
                        </div>
                      )}

                      {suggestion.category && (
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Categoría:</p>
                          <Badge variant="secondary">{suggestion.category}</Badge>
                        </div>
                      )}

                      {suggestion.properties && (
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Propiedades:</p>
                          <p className="text-foreground">{suggestion.properties}</p>
                        </div>
                      )}

                      {suggestion.admin_comment && (
                        <div className="bg-muted/50 rounded-lg p-3 mt-3">
                          <p className="font-medium text-muted-foreground mb-1 flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            Comentario del admin:
                          </p>
                          <p className="text-foreground">{suggestion.admin_comment}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {suggestion.profiles?.first_name} {suggestion.profiles?.last_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(suggestion.created_at)}
                        </span>
                      </div>
                      
                      {activeTab !== 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSuggestion(suggestion.id, suggestion.name)}
                          className="h-7 px-2 text-xs hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={reviewModal} onOpenChange={setReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? '✅ Aprobar Sugerencia' : '❌ Rechazar Sugerencia'}
            </DialogTitle>
            <DialogDescription>
              {selectedSuggestion?.name} - {selectedSuggestion?.scientific_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {reviewAction === 'approve' ? 'Comentario (opcional)' : 'Razón del rechazo *'}
              </label>
              <textarea
                required={reviewAction === 'reject'}
                placeholder={
                  reviewAction === 'approve'
                    ? "Agrega un comentario para el usuario..."
                    : "Explica por qué se rechaza la sugerencia..."
                }
                className="input h-24 resize-none"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewModal(false);
                setReviewComment("");
              }}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReview}
              disabled={processing}
              className={reviewAction === 'approve' ? 'bg-green-500 hover:bg-green-600' : ''}
              variant={reviewAction === 'reject' ? 'destructive' : 'default'}
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </div>
              ) : (
                reviewAction === 'approve' ? 'Aprobar' : 'Rechazar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
