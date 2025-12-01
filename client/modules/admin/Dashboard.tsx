import { motion } from "framer-motion";
import { Leaf, Users, BarChart3, MessageSquare, Shield, Activity, TrendingUp, Eye, Heart, Tag, Bell, Image, Settings, Lightbulb, Sparkles, Menu, X, Pill, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import PlantsManager from "./PlantsManager";
import UsersManager from "./UsersManager";
import CommentsManager from "./CommentsManager";
import CategoriesManager from "./CategoriesManager";
import AnalyticsManager from "./AnalyticsManager";
import FavoritesManager from "./FavoritesManager";
import NotificationsManager from "./NotificationsManager";
import MediaManager from "./MediaManager";
import SettingsManager from "./SettingsManager";
import SuggestionsManager from "./SuggestionsManager";
import AIAnalytics from "./AIAnalytics";
import MedicationsManager from "./MedicationsManager";
import InteractionsManager from "./InteractionsManager";
import { supabase } from "@/lib/supabase";
import { useAuth } from "../auth/useAuth";

const items = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "analytics", label: "Analytics", icon: TrendingUp },
  { key: "ai", label: "IA Analytics", icon: Sparkles },
  { key: "favorites", label: "Favoritos & Tendencias", icon: Heart },
  { key: "plants", label: "Gestión de Plantas", icon: Leaf },
    { key: "medications", label: "Medicamentos", icon: Pill },
    { key: "interactions", label: "Interacciones", icon: AlertTriangle },
    { key: "users", label: "Usuarios", icon: Users },
  { key: "comments", label: "Comentarios", icon: MessageSquare },
  { key: "categories", label: "Categorías & Tags", icon: Tag },
  { key: "suggestions", label: "Sugerencias", icon: Lightbulb },
  { key: "notifications", label: "Notificaciones", icon: Bell },
  { key: "media", label: "Multimedia", icon: Image },
  { key: "settings", label: "Configuración", icon: Settings },
];

export default function Dashboard() {
  const [tab, setTab] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { session } = useAuth();
  const [stats, setStats] = useState({
    totalPlants: 0,
    totalUsers: 0,
    totalFavorites: 0,
    totalComments: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [plantsRes, usersRes, favoritesRes, commentsRes] = await Promise.all([
        supabase.from('plants').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalPlants: plantsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalFavorites: favoritesRes.count || 0,
        totalComments: commentsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              
              <div>
                <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <span className="hidden sm:inline">Panel de Administración</span>
                  <span className="sm:hidden">Admin</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
                  Bienvenido, {session?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 rounded-lg border border-primary/20">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar - Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <aside className={`
            fixed lg:sticky lg:top-6 h-fit z-50
            lg:translate-x-0 transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:block left-0 top-0 h-screen lg:h-fit
            w-72 lg:w-auto p-4 lg:p-0
            bg-background lg:bg-transparent
          `}>
            <div className="rounded-xl border border-border bg-card p-4 max-h-screen overflow-y-auto">
              <nav className="space-y-2">
                {items.map(({ key, label, icon: Icon }) => (
                  <motion.button
                    key={key}
                    onClick={() => {
                      setTab(key);
                      setIsSidebarOpen(false); // Cerrar sidebar en móvil
                    }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                      tab === key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main>
            {tab === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Resumen General</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Plantas", value: stats.totalPlants, icon: Leaf, color: "text-green-500" },
                      { label: "Usuarios", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
                      { label: "Favoritos", value: stats.totalFavorites, icon: Activity, color: "text-purple-500" },
                      { label: "Comentarios", value: stats.totalComments, icon: TrendingUp, color: "text-orange-500" },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                            <p className="text-3xl font-bold">{stat.value}</p>
                          </div>
                          <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTab("plants")}
                      className="p-6 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-left group"
                    >
                      <Leaf className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-1">Gestionar Plantas</h3>
                      <p className="text-sm text-muted-foreground">Agregar, editar o eliminar plantas</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTab("users")}
                      className="p-6 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-left group"
                    >
                      <Users className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-1">Ver Usuarios</h3>
                      <p className="text-sm text-muted-foreground">Administrar usuarios registrados</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-6 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-left group"
                    >
                      <Eye className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-1">Ver Catálogo</h3>
                      <p className="text-sm text-muted-foreground">Explorar todas las plantas</p>
                    </motion.button>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Actividad Reciente
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-muted-foreground">Sistema funcionando correctamente</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-muted-foreground">Base de datos conectada</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span className="text-muted-foreground">Autenticación activa</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-border bg-card">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Información del Sistema
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Versión</span>
                        <span className="font-medium">1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base de Datos</span>
                        <span className="font-medium">Supabase</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado</span>
                        <span className="font-medium text-green-500">● Activo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {tab === "analytics" && (
              <div>
                <AnalyticsManager />
              </div>
            )}
            
            {tab === "ai" && (
              <div>
                <AIAnalytics />
              </div>
            )}
            
            {tab === "favorites" && (
              <div>
                <FavoritesManager />
              </div>
            )}
            
            {tab === "plants" && (
              <div>
                <PlantsManager />
              </div>
            )}
            
            {tab === "medications" && (
              <div>
                <MedicationsManager />
              </div>
            )}
            
            {tab === "interactions" && (
              <div>
                <InteractionsManager />
              </div>
            )}
            
            {tab === "users" && (
              <div>
                <UsersManager />
              </div>
            )}
            
            {tab === "comments" && (
              <div>
                <CommentsManager />
              </div>
            )}
            
            {tab === "categories" && (
              <div>
                <CategoriesManager />
              </div>
            )}
            
            {tab === "suggestions" && (
              <div>
                <SuggestionsManager />
              </div>
            )}
            
            {tab === "notifications" && (
              <div>
                <NotificationsManager />
              </div>
            )}
            
            {tab === "media" && (
              <div>
                <MediaManager />
              </div>
            )}
            
            {tab === "settings" && (
              <div>
                <SettingsManager />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
