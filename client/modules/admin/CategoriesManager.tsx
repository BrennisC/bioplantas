import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Tag, Search, Plus, Edit, Trash2, Folder, Hash } from "lucide-react";
import Modal from "@/components/Modal";

interface Category {
  id: string;
  name: string;
  description?: string;
  plant_count?: number;
}

interface TagItem {
  id: string;
  name: string;
  usage_count?: number;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [ailments, setAilments] = useState<TagItem[]>([]);
  const [activeTab, setActiveTab] = useState<"categories" | "tags" | "ailments">("categories");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [editingAilment, setEditingAilment] = useState<TagItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchCategories(),
      fetchTags(),
      fetchAilments()
    ]);
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      // Obtener todas las plantas para contar por categoría
      const { data: plants, error } = await supabase
        .from('plants')
        .select('category');

      if (error) throw error;

      // Contar plantas por categoría
      const categoryCounts = new Map<string, number>();
      plants?.forEach(plant => {
        if (plant.category) {
          categoryCounts.set(plant.category, (categoryCounts.get(plant.category) || 0) + 1);
        }
      });

      // Crear array de categorías únicas
      const uniqueCategories = Array.from(categoryCounts.keys()).map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        plant_count: categoryCounts.get(name) || 0
      }));

      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error al cargar categorías",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchTags = async () => {
    try {
      const { data: plants, error } = await supabase
        .from('plants')
        .select('tags');

      if (error) throw error;

      // Contar uso de cada tag
      const tagCounts = new Map<string, number>();
      plants?.forEach(plant => {
        plant.tags?.forEach((tag: string) => {
          if (tag) {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          }
        });
      });

      const uniqueTags = Array.from(tagCounts.keys()).map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        usage_count: tagCounts.get(name) || 0
      }));

      setTags(uniqueTags);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchAilments = async () => {
    try {
      const { data: plants, error } = await supabase
        .from('plants')
        .select('ailments');

      if (error) throw error;

      // Contar uso de cada ailment
      const ailmentCounts = new Map<string, number>();
      plants?.forEach(plant => {
        plant.ailments?.forEach((ailment: string) => {
          if (ailment) {
            ailmentCounts.set(ailment, (ailmentCounts.get(ailment) || 0) + 1);
          }
        });
      });

      const uniqueAilments = Array.from(ailmentCounts.keys()).map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        usage_count: ailmentCounts.get(name) || 0
      }));

      setAilments(uniqueAilments);
    } catch (error: any) {
      console.error('Error fetching ailments:', error);
    }
  };

  const deleteCategory = async (categoryName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${categoryName}"?\n\nLas plantas con esta categoría quedarán sin categoría.`)) return;

    try {
      // Actualizar todas las plantas que tengan esta categoría
      const { error } = await supabase
        .from('plants')
        .update({ category: null })
        .eq('category', categoryName);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.name !== categoryName));
      toast({
        title: "Categoría eliminada",
        description: `La categoría "${categoryName}" ha sido eliminada`,
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTag = async (tagName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el tag "${tagName}"?`)) return;

    try {
      // Obtener todas las plantas que tengan este tag
      const { data: plants, error: fetchError } = await supabase
        .from('plants')
        .select('id, tags')
        .contains('tags', [tagName]);

      if (fetchError) throw fetchError;

      // Actualizar cada planta removiendo el tag
      for (const plant of plants || []) {
        const newTags = plant.tags.filter((t: string) => t !== tagName);
        const { error: updateError } = await supabase
          .from('plants')
          .update({ tags: newTags })
          .eq('id', plant.id);

        if (updateError) throw updateError;
      }

      setTags(prev => prev.filter(t => t.name !== tagName));
      toast({
        title: "Tag eliminado",
        description: `El tag "${tagName}" ha sido eliminado`,
      });
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteAilment = async (ailmentName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la dolencia "${ailmentName}"?`)) return;

    try {
      const { data: plants, error: fetchError } = await supabase
        .from('plants')
        .select('id, ailments')
        .contains('ailments', [ailmentName]);

      if (fetchError) throw fetchError;

      for (const plant of plants || []) {
        const newAilments = plant.ailments.filter((a: string) => a !== ailmentName);
        const { error: updateError } = await supabase
          .from('plants')
          .update({ ailments: newAilments })
          .eq('id', plant.id);

        if (updateError) throw updateError;
      }

      setAilments(prev => prev.filter(a => a.name !== ailmentName));
      toast({
        title: "Dolencia eliminada",
        description: `La dolencia "${ailmentName}" ha sido eliminada`,
      });
    } catch (error: any) {
      console.error('Error deleting ailment:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [categories, query]);

  const filteredTags = useMemo(() => {
    return tags.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [tags, query]);

  const filteredAilments = useMemo(() => {
    return ailments.filter(a => 
      a.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [ailments, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando categorías y tags...</p>
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
            <Tag className="h-7 w-7" />
            Gestión de Categorías y Tags
          </h2>
          <p className="text-muted-foreground mt-1">
            Organiza el catálogo de plantas
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "categories"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <Folder className="h-4 w-4" />
          Categorías ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "tags"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <Hash className="h-4 w-4" />
          Tags ({tags.length})
        </button>
        <button
          onClick={() => setActiveTab("ailments")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "ailments"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <Tag className="h-4 w-4" />
          Dolencias ({ailments.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Buscar ${activeTab === "categories" ? "categorías" : activeTab === "tags" ? "tags" : "dolencias"}...`}
          className="input pl-10 w-full"
        />
      </div>

      {/* Categories Content */}
      {activeTab === "categories" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.length === 0 ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-12 text-center">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {query ? "No se encontraron categorías" : "No hay categorías registradas"}
              </p>
            </div>
          ) : (
            filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-card p-4 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Folder className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.plant_count} {category.plant_count === 1 ? 'planta' : 'plantas'}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteCategory(category.name)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Tags Content */}
      {activeTab === "tags" && (
        <div className="flex flex-wrap gap-3">
          {filteredTags.length === 0 ? (
            <div className="w-full rounded-xl border border-border bg-card p-12 text-center">
              <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {query ? "No se encontraron tags" : "No hay tags registrados"}
              </p>
            </div>
          ) : (
            filteredTags.map((tag, index) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all"
              >
                <Hash className="h-3.5 w-3.5 text-green-500" />
                <span className="text-sm font-medium text-green-500">{tag.name}</span>
                <span className="text-xs text-muted-foreground">({tag.usage_count})</span>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteTag(tag.name)}
                  className="p-1 rounded-full hover:bg-red-500/20 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar tag"
                >
                  <Trash2 className="h-3 w-3" />
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Ailments Content */}
      {activeTab === "ailments" && (
        <div className="flex flex-wrap gap-3">
          {filteredAilments.length === 0 ? (
            <div className="w-full rounded-xl border border-border bg-card p-12 text-center">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {query ? "No se encontraron dolencias" : "No hay dolencias registradas"}
              </p>
            </div>
          ) : (
            filteredAilments.map((ailment, index) => (
              <motion.div
                key={ailment.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
              >
                <Tag className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-sm font-medium text-purple-500">{ailment.name}</span>
                <span className="text-xs text-muted-foreground">({ailment.usage_count})</span>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteAilment(ailment.name)}
                  className="p-1 rounded-full hover:bg-red-500/20 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar dolencia"
                >
                  <Trash2 className="h-3 w-3" />
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
