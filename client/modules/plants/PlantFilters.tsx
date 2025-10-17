import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { X, Filter } from "lucide-react";

interface PlantFiltersProps {
  selectedCategories: string[];
  selectedTags: string[];
  selectedAilments: string[];
  onCategoryChange: (categories: string[]) => void;
  onTagChange: (tags: string[]) => void;
  onAilmentChange: (ailments: string[]) => void;
  onClearAll: () => void;
}

export default function PlantFilters({
  selectedCategories,
  selectedTags,
  selectedAilments,
  onCategoryChange,
  onTagChange,
  onAilmentChange,
  onClearAll
}: PlantFiltersProps) {
  const [categories, setCategories] = useState<Array<{ name: string; color: string }>>([]);
  const [tags, setTags] = useState<Array<{ name: string; color: string }>>([]);
  const [ailments, setAilments] = useState<Array<{ name: string; color: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      // Obtener todas las plantas primero
      const { data: allPlants, error: plantsError } = await supabase
        .from('plants')
        .select('category, tags, ailments');

      if (plantsError) throw plantsError;

      // Extraer categorías, tags y ailments únicos que realmente existen en plantas
      const categoriesInUse = new Set<string>();
      const tagsInUse = new Set<string>();
      const ailmentsInUse = new Set<string>();

      allPlants?.forEach(plant => {
        if (plant.category) categoriesInUse.add(plant.category);
        if (plant.tags) plant.tags.forEach((tag: string) => tagsInUse.add(tag));
        if (plant.ailments) plant.ailments.forEach((ailment: string) => ailmentsInUse.add(ailment));
      });

      // Obtener datos de las tablas de filtros
      const [categoriesRes, tagsRes, ailmentsRes] = await Promise.all([
        supabase.from('plant_categories').select('name, color').order('display_order'),
        supabase.from('plant_tags').select('name, color').order('display_order'),
        supabase.from('plant_ailments').select('name, color').order('display_order')
      ]);

      // Filtrar solo los que están en uso
      if (categoriesRes.data) {
        setCategories(categoriesRes.data.filter(cat => categoriesInUse.has(cat.name)));
      }
      if (tagsRes.data) {
        setTags(tagsRes.data.filter(tag => tagsInUse.has(tag.name)));
      }
      if (ailmentsRes.data) {
        setAilments(ailmentsRes.data.filter(ailment => ailmentsInUse.has(ailment.name)));
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    onCategoryChange(newCategories);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onTagChange(newTags);
  };

  const handleAilmentToggle = (ailment: string) => {
    const newAilments = selectedAilments.includes(ailment)
      ? selectedAilments.filter(a => a !== ailment)
      : [...selectedAilments, ailment];
    onAilmentChange(newAilments);
  };

  const totalFilters = selectedCategories.length + selectedTags.length + selectedAilments.length;

  // Contenido de los filtros (reutilizable para móvil y desktop)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Dolencias - PRIMERO */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">
          Dolencias que trata
          {selectedAilments.length > 0 && (
            <span className="ml-2 text-green-600 dark:text-green-400">
              ({selectedAilments.length})
            </span>
          )}
        </h4>
        <div className="space-y-2">
          {ailments.map((ailment) => (
            <motion.label
              key={ailment.name}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                selectedAilments.includes(ailment.name)
                  ? 'bg-green-500/20 border-green-500 shadow-sm'
                  : 'border-transparent hover:bg-muted/50'
              }`}
            >
              <Checkbox
                checked={selectedAilments.includes(ailment.name)}
                onCheckedChange={() => handleAilmentToggle(ailment.name)}
              />
              <span className={`text-sm flex-1 ${selectedAilments.includes(ailment.name) ? 'font-semibold text-green-700 dark:text-green-400' : ''}`}>
                {ailment.name}
              </span>
              {ailment.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ailment.color }}
                />
              )}
            </motion.label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tags - SEGUNDO */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">
          Propiedades
          {selectedTags.length > 0 && (
            <span className="ml-2 text-primary">({selectedTags.length})</span>
          )}
        </h4>
        <div className="space-y-2">
          {tags.map((tag) => (
            <motion.label
              key={tag.name}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                selectedTags.includes(tag.name)
                  ? 'bg-blue-500/20 border-blue-500 shadow-sm'
                  : 'border-transparent hover:bg-muted/50'
              }`}
            >
              <Checkbox
                checked={selectedTags.includes(tag.name)}
                onCheckedChange={() => handleTagToggle(tag.name)}
              />
              <span className={`text-sm flex-1 ${selectedTags.includes(tag.name) ? 'font-semibold text-blue-700 dark:text-blue-400' : ''}`}>
                {tag.name}
              </span>
              {tag.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
              )}
            </motion.label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categorías - AL FINAL */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">
          Categorías
          {selectedCategories.length > 0 && (
            <span className="ml-2 text-primary">({selectedCategories.length})</span>
          )}
        </h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <motion.label
              key={category.name}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border-2 ${
                selectedCategories.includes(category.name)
                  ? 'bg-primary/20 border-primary shadow-sm'
                  : 'border-transparent hover:bg-muted/50'
              }`}
            >
              <Checkbox
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={() => handleCategoryToggle(category.name)}
              />
              <span className={`text-sm flex-1 ${selectedCategories.includes(category.name) ? 'font-semibold text-primary' : ''}`}>
                {category.name}
              </span>
              {category.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
            </motion.label>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <aside className="w-full lg:w-72 space-y-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-8 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* MÓVIL: Botón flotante + Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-xl"
              size="icon"
            >
              <Filter className="w-5 h-5" />
              {totalFilters > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full">
                  {totalFilters}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <span>Filtros</span>
                  {totalFilters > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {totalFilters}
                    </Badge>
                  )}
                </div>
                {totalFilters > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-8 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpiar
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-4">
                <FilterContent />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* DESKTOP: Sidebar normal */}
      <aside className="hidden lg:block w-72">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="sticky top-4 space-y-4"
        >
          <div className="rounded-xl border border-border bg-card shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-lg">Filtros</h3>
                  {totalFilters > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {totalFilters}
                    </Badge>
                  )}
                </div>
                {totalFilters > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-8 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4">
                <FilterContent />
              </div>
            </ScrollArea>
          </div>

          {/* Resumen de filtros activos */}
          {totalFilters > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-primary/30 bg-primary/5 p-3"
            >
              <p className="text-xs text-muted-foreground mb-2">Filtros activos:</p>
              <div className="flex flex-wrap gap-1">
                {selectedAilments.map(ailment => (
                  <Badge key={ailment} className="text-xs bg-green-500 hover:bg-green-600">
                    {ailment}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleAilmentToggle(ailment)}
                    />
                  </Badge>
                ))}
                {selectedTags.map(tag => (
                  <Badge key={tag} className="text-xs bg-blue-500 hover:bg-blue-600">
                    {tag}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    />
                  </Badge>
                ))}
                {selectedCategories.map(cat => (
                  <Badge key={cat} variant="default" className="text-xs">
                    {cat}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleCategoryToggle(cat)}
                    />
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </aside>
    </>
  );
}
