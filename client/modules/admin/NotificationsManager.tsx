import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Send, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Megaphone,
  Calendar,
  Trash2,
  Eye
} from "lucide-react";
import Modal from "@/components/Modal";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "announcement";
  target: "all" | "users" | "admins";
  created_at: string;
  created_by: string;
  sent_count?: number;
}

export default function NotificationsManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewNotification, setPreviewNotification] = useState<Notification | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "announcement",
    target: "all" as "all" | "users" | "admins"
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Por ahora simulamos datos, en producción esto vendría de una tabla de notificaciones
      // Puedes crear una tabla "notifications" en Supabase para almacenar el historial
      
      setNotifications([]);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error al cargar notificaciones",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título y mensaje",
        variant: "destructive"
      });
      return;
    }

    try {
      setSending(true);

      // Obtener el ID del admin actual PRIMERO
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({
          title: "Error de autenticación",
          description: "No se pudo obtener tu información de usuario",
          variant: "destructive"
        });
        return;
      }

      console.log('📧 Enviando notificación...', { target: formData.target, currentUser: currentUser.id });

      // Obtener usuarios según el target
      let query = supabase.from('profiles').select('id, email, role');
      
      if (formData.target === "users") {
        query = query.eq('role', 'user');
      } else if (formData.target === "admins") {
        query = query.eq('role', 'admin');
      }
      // Si es 'all', no agregamos filtro

      const { data: users, error: usersError } = await query;

      if (usersError) {
        console.error('❌ Error obteniendo usuarios:', usersError);
        throw usersError;
      }

      const userCount = users?.length || 0;

      console.log('👥 Usuarios encontrados:', userCount, users);

      if (userCount === 0) {
        toast({
          title: "Sin destinatarios",
          description: "No hay usuarios para enviar la notificación",
          variant: "destructive"
        });
        setSending(false);
        return;
      }

      // Crear notificaciones para cada usuario en la base de datos
      const notificationsToInsert = users.map(user => ({
        user_id: user.id,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        read: false,
        created_by: currentUser.id
      }));

      console.log('📝 Insertando notificaciones:', notificationsToInsert.length);

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);

      if (insertError) {
        console.error('❌ Error insertando notificaciones:', insertError);
        throw insertError;
      }

      // Simular guardado en historial local
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        created_by: currentUser.id,
        sent_count: userCount
      };

      setNotifications(prev => [newNotification, ...prev]);

      console.log('✅ Notificaciones enviadas exitosamente');

      toast({
        title: "✅ Notificación enviada",
        description: `Se ha enviado a ${userCount} ${userCount === 1 ? 'usuario' : 'usuarios'}`,
      });

      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "info",
        target: "all"
      });

      setModalOpen(false);

    } catch (error: any) {
      console.error('💥 Error sending notification:', error);
      toast({
        title: "Error al enviar",
        description: error.message || "Ocurrió un error al enviar la notificación",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta notificación del historial?")) return;

    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Notificación eliminada",
      description: "Se ha eliminado del historial",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info": return Info;
      case "success": return CheckCircle;
      case "warning": return AlertCircle;
      case "announcement": return Megaphone;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "success": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "warning": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "announcement": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

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
          <p className="text-muted-foreground">Cargando notificaciones...</p>
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
            <Bell className="h-7 w-7" />
            Sistema de Notificaciones
          </h2>
          <p className="text-muted-foreground mt-1">
            Envía anuncios y notificaciones a usuarios
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setModalOpen(true)}
          className="btn flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Nueva Notificación
        </motion.button>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-500 mb-1">Sistema de notificaciones</p>
            <p className="text-muted-foreground">
              Las notificaciones se pueden implementar mediante:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li><strong>Email:</strong> Usando servicios como SendGrid, Resend o Supabase Auth Email</li>
              <li><strong>In-app:</strong> Guardando en tabla de Supabase y mostrando en la interfaz</li>
              <li><strong>Push:</strong> Con Firebase Cloud Messaging para notificaciones móviles</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500/10 text-purple-500 p-3 rounded-lg">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Enviadas</p>
              <p className="text-3xl font-bold">{notifications.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Notificaciones en historial</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500/10 text-green-500 p-3 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alcance Total</p>
              <p className="text-3xl font-bold">
                {notifications.reduce((sum, n) => sum + (n.sent_count || 0), 0)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Usuarios notificados</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-lg">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Anuncios</p>
              <p className="text-3xl font-bold">
                {notifications.filter(n => n.type === 'announcement').length}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Notificaciones importantes</p>
        </div>
      </div>

      {/* Notifications History */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Historial de Notificaciones
        </h3>

        {notifications.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay notificaciones enviadas</p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn mt-4"
            >
              Enviar primera notificación
            </button>
          </div>
        ) : (
          notifications.map((notification, index) => {
            const TypeIcon = getTypeIcon(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`${getTypeColor(notification.type)} p-3 rounded-lg flex-shrink-0 border`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{notification.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(notification.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {notification.sent_count} usuarios
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setPreviewNotification(notification)}
                          className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)} border`}>
                        {notification.type === "info" && "Información"}
                        {notification.type === "success" && "Éxito"}
                        {notification.type === "warning" && "Advertencia"}
                        {notification.type === "announcement" && "Anuncio"}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {notification.target === "all" && "Todos"}
                        {notification.target === "users" && "Solo usuarios"}
                        {notification.target === "admins" && "Solo admins"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Notification Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div className="pb-3 border-b border-border">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" />
              Nueva Notificación
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Envía un mensaje a tus usuarios
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Título *</label>
              <input
                className="input w-full mt-1"
                placeholder="Ej: Nueva funcionalidad disponible"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={sending}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Mensaje *</label>
              <textarea
                className="input w-full mt-1 min-h-[100px]"
                placeholder="Escribe el mensaje de la notificación..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={sending}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <select
                  className="input w-full mt-1"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  disabled={sending}
                >
                  <option value="info">Información</option>
                  <option value="success">Éxito</option>
                  <option value="warning">Advertencia</option>
                  <option value="announcement">Anuncio</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Destinatarios</label>
                <select
                  className="input w-full mt-1"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
                  disabled={sending}
                >
                  <option value="all">Todos los usuarios</option>
                  <option value="users">Solo usuarios</option>
                  <option value="admins">Solo administradores</option>
                </select>
              </div>
            </div>

            <button
              onClick={sendNotification}
              disabled={sending}
              className="btn w-full"
            >
              {sending ? '📤 Enviando...' : '✉️ Enviar Notificación'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal open={!!previewNotification} onClose={() => setPreviewNotification(null)}>
        {previewNotification && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                Detalles de Notificación
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Título</p>
                <p className="font-semibold text-lg">{previewNotification.title}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Mensaje</p>
                <p className="text-sm">{previewNotification.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(previewNotification.type)} border`}>
                    {previewNotification.type}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Destinatarios</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted">
                    {previewNotification.sent_count} usuarios
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha de envío</p>
                <p className="text-sm">{formatDate(previewNotification.created_at)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
