import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import {
  MessageSquare,
  Image as ImageIcon,
  Users,
  TrendingUp,
  Calendar,
  Sparkles,
} from "lucide-react";

interface AIStats {
  totalConversations: number;
  totalMessages: number;
  totalIdentifications: number;
  totalTokensUsed: number;
  activeUsers: number;
  avgMessagesPerConversation: number;
}

interface RecentActivity {
  id: string;
  type: "chat" | "identification";
  user_email: string;
  content: string;
  created_at: string;
}

/**
 * Panel de administración para ver estadísticas de uso de IA
 * Muestra métricas generales y actividad reciente
 */
export default function AIAnalytics() {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIStats();
    loadRecentActivity();

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadAIStats();
      loadRecentActivity();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadAIStats = async () => {
    try {
      // Obtener estadísticas generales
      const [conversationsRes, messagesRes, identificationsRes, usersRes] = await Promise.all([
        supabase.from("ai_conversations").select("session_id", { count: "exact", head: true }),
        supabase.from("ai_conversations").select("id", { count: "exact", head: true }),
        supabase.from("ai_plant_identifications").select("id", { count: "exact", head: true }),
        supabase
          .from("ai_conversations")
          .select("user_id")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      // Calcular usuarios únicos activos (últimos 30 días)
      const uniqueUsers = new Set(usersRes.data?.map((r) => r.user_id) || []).size;

      // Calcular tokens usados (si está disponible)
      const { data: tokensData } = await supabase
        .from("ai_conversations")
        .select("tokens_used");

      const totalTokens = tokensData?.reduce((sum, row) => sum + (row.tokens_used || 0), 0) || 0;

      setStats({
        totalConversations: conversationsRes.count || 0,
        totalMessages: messagesRes.count || 0,
        totalIdentifications: identificationsRes.count || 0,
        totalTokensUsed: totalTokens,
        activeUsers: uniqueUsers,
        avgMessagesPerConversation:
          conversationsRes.count > 0
            ? Math.round((messagesRes.count || 0) / conversationsRes.count)
            : 0,
      });
    } catch (error) {
      console.error("Error loading AI stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Últimos mensajes de chat
      const { data: chatData } = await supabase
        .from("ai_conversations")
        .select("id, user_id, content, created_at, users(email)")
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(5);

      // Últimas identificaciones
      const { data: identData } = await supabase
        .from("ai_plant_identifications")
        .select("id, user_id, identified_plant_name, created_at, users(email)")
        .order("created_at", { ascending: false })
        .limit(5);

      // Combinar y ordenar por fecha
      const combined: RecentActivity[] = [
        ...(chatData?.map((c: any) => ({
          id: c.id,
          type: "chat" as const,
          user_email: c.users?.email || "Usuario",
          content: c.content.substring(0, 100),
          created_at: c.created_at,
        })) || []),
        ...(identData?.map((i: any) => ({
          id: i.id,
          type: "identification" as const,
          user_email: i.users?.email || "Usuario",
          content: `Identificó: ${i.identified_plant_name}`,
          created_at: i.created_at,
        })) || []),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setRecentActivity(combined);
    } catch (error) {
      console.error("Error loading recent activity:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Conversaciones Totales",
      value: stats?.totalConversations || 0,
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      label: "Mensajes Totales",
      value: stats?.totalMessages || 0,
      icon: MessageSquare,
      color: "text-green-500",
    },
    {
      label: "Identificaciones",
      value: stats?.totalIdentifications || 0,
      icon: ImageIcon,
      color: "text-purple-500",
    },
    {
      label: "Usuarios Activos (30d)",
      value: stats?.activeUsers || 0,
      icon: Users,
      color: "text-orange-500",
    },
    {
      label: "Mensajes por Conversación",
      value: stats?.avgMessagesPerConversation || 0,
      icon: TrendingUp,
      color: "text-pink-500",
    },
    {
      label: "Tokens Usados",
      value: stats?.totalTokensUsed.toLocaleString() || 0,
      icon: Sparkles,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estadísticas de IA</h2>
          <p className="text-sm text-muted-foreground">
            Uso del sistema Cosmos AI con Google Gemini
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Sparkles className="w-3 h-3" />
          Gemini 1.5 Flash
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Actividad Reciente</h3>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay actividad reciente
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === "chat" ? "bg-blue-500/20" : "bg-purple-500/20"
                    }`}
                  >
                    {activity.type === "chat" ? (
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">
                        {activity.user_email}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {activity.type === "chat" ? "Chat" : "Identificación"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.created_at).toLocaleString("es-ES")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
