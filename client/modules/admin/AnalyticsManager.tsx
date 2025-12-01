import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Leaf, 
  Heart, 
  MessageSquare,
  Star,
  Calendar
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface Analytics {
  totalPlants: number;
  totalUsers: number;
  totalFavorites: number;
  totalComments: number;
  topPlants: { name: string; favorites: number }[];
  categoriesData: { name: string; count: number }[];
  usersGrowth: { month: string; users: number }[];
  activityData: { date: string; comments: number; favorites: number }[];
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

export default function AnalyticsManager() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPlants: 0,
    totalUsers: 0,
    totalFavorites: 0,
    totalComments: 0,
    topPlants: [],
    categoriesData: [],
    usersGrowth: [],
    activityData: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Totales
      const [plantsRes, usersRes, favoritesRes, commentsRes] = await Promise.all([
        supabase.from('plants').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
      ]);

      // Top 5 plantas más favoritas
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select('plant_id, plants(name)')
        .not('plant_id', 'is', null);

      console.log('📊 Datos de favoritos:', favData);
      console.log('❌ Error favoritos:', favError);

      // Contar favoritos por planta
      const plantCounts = new Map<string, { name: string; count: number }>();
      favData?.forEach((fav: any) => {
        if (fav.plant_id && fav.plants) {
          const plantName = fav.plants.name || 'Desconocida';
          const existing = plantCounts.get(fav.plant_id);
          if (existing) {
            existing.count++;
          } else {
            plantCounts.set(fav.plant_id, { name: plantName, count: 1 });
          }
        }
      });

      console.log('📈 Conteo de plantas:', Array.from(plantCounts.entries()));

      // Top 5
      const topPlantsData = Array.from(plantCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(plant => ({ 
          name: plant.name.length > 20 ? plant.name.substring(0, 20) + '...' : plant.name, 
          favorites: plant.count 
        }));

      console.log('🏆 Top 5 plantas:', topPlantsData);

      // Categorías de plantas
      const { data: plantsData } = await supabase
        .from('plants')
        .select('category');

      const categoryCounts = new Map<string, number>();
      plantsData?.forEach(plant => {
        if (plant.category) {
          categoryCounts.set(plant.category, (categoryCounts.get(plant.category) || 0) + 1);
        }
      });

      const allCategories = Array.from(categoryCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // Solo mostrar top 4 categorías, el resto en "Otros"
      const top4Categories = allCategories.slice(0, 4);
      const otherCategories = allCategories.slice(4);
      
      const categoriesData = otherCategories.length > 0 
        ? [
            ...top4Categories,
            {
              name: 'Otros',
              count: otherCategories.reduce((sum, cat) => sum + cat.count, 0)
            }
          ]
        : top4Categories;

      // Crecimiento de usuarios por mes
      const { data: usersData } = await supabase
        .from('profiles')
        .select('created_at');

      const monthCounts = new Map<string, number>();
      usersData?.forEach(user => {
        const date = new Date(user.created_at);
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
      });

      const usersGrowth = Array.from(monthCounts.entries())
        .map(([month, users]) => ({ month, users }))
        .slice(-6); // Últimos 6 meses

      // Actividad reciente (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentComments } = await supabase
        .from('comments')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      const { data: recentFavorites } = await supabase
        .from('favorites')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      console.log('💬 Comentarios recientes:', recentComments?.length);
      console.log('❤️ Favoritos recientes:', recentFavorites?.length);

      const activityMap = new Map<string, { comments: number; favorites: number }>();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        activityMap.set(dateKey, { comments: 0, favorites: 0 });
      }

      recentComments?.forEach(comment => {
        const date = new Date(comment.created_at);
        const dateKey = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const activity = activityMap.get(dateKey);
        if (activity) activity.comments++;
      });

      recentFavorites?.forEach(favorite => {
        const date = new Date(favorite.created_at);
        const dateKey = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const activity = activityMap.get(dateKey);
        if (activity) activity.favorites++;
      });

      const activityData = Array.from(activityMap.entries())
        .map(([date, data]) => ({ date, ...data }));

      console.log('📅 Datos de actividad:', activityData);

      setAnalytics({
        totalPlants: plantsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalFavorites: favoritesRes.count || 0,
        totalComments: commentsRes.count || 0,
        topPlants: topPlantsData,
        categoriesData,
        usersGrowth,
        activityData
      });

      console.log('✅ Analytics actualizados:', {
        totalFavorites: favoritesRes.count,
        topPlantsCount: topPlantsData.length,
        activityDays: activityData.length
      });

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error al cargar analytics",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Generando estadísticas...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Plantas", value: analytics.totalPlants, icon: Leaf, color: "text-green-500", bgColor: "bg-green-500/10" },
    { label: "Usuarios", value: analytics.totalUsers, icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { label: "Favoritos", value: analytics.totalFavorites, icon: Heart, color: "text-red-500", bgColor: "bg-red-500/10" },
    { label: "Comentarios", value: analytics.totalComments, icon: MessageSquare, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7" />
            Analytics & Estadísticas
          </h2>
          <p className="text-muted-foreground mt-1">
            Análisis detallado de la plataforma
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchAnalytics}
          className="btn flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Actualizar datos
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Plantas más populares */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Top 5 Plantas Favoritas</h3>
          </div>
          
          {analytics.topPlants.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No hay plantas favoritas aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topPlants} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: '#888', fontSize: 11 }}
                  interval={0}
                />
                <YAxis tick={{ fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f1f1f', 
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                />
                <Bar 
                  dataKey="favorites" 
                  fill="#10b981" 
                  radius={[8, 8, 0, 0]}
                  name="Favoritos"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Distribución por categorías */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Leaf className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Distribución por Categorías</h3>
          </div>
          
          {analytics.categoriesData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No hay datos de categorías
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoriesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={false}
                  >
                    {analytics.categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f1f1f', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="flex-1 space-y-2">
                {analytics.categoriesData.map((cat, index) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-sm" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm flex-1">{cat.name}</span>
                    <span className="text-sm font-semibold">{cat.count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({((cat.count / analytics.totalPlants) * 100).toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Actividad de los últimos 7 días */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Actividad de los Últimos 7 Días</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#888' }}
              />
              <YAxis tick={{ fill: '#888' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f1f1f', 
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="comments" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Comentarios"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="favorites" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Favoritos"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500/10 text-green-500 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Promedio</p>
              <p className="text-xl font-bold">
                {analytics.totalPlants > 0 
                  ? (analytics.totalFavorites / analytics.totalPlants).toFixed(1) 
                  : 0}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Favoritos por planta</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Promedio</p>
              <p className="text-xl font-bold">
                {analytics.totalPlants > 0 
                  ? (analytics.totalComments / analytics.totalPlants).toFixed(1) 
                  : 0}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Comentarios por planta</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Engagement</p>
              <p className="text-xl font-bold">
                {analytics.totalUsers > 0 
                  ? ((analytics.totalFavorites + analytics.totalComments) / analytics.totalUsers).toFixed(1) 
                  : 0}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Acciones por usuario</p>
        </div>
      </div>
    </div>
  );
}
