import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type Plant } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Leaf,
  Heart,
  Share2,
  ExternalLink,
  Stethoscope,
  Pill,
  FlaskConical,
  Phone,
  Mail,
  MessageCircle,
  ChevronRight,
  ShoppingCart,
  X,
  AlertTriangle,
  ChefHat,
  ArrowUp,
  Eye,
  Lightbulb,
} from "lucide-react";
import PlantComments from "@/modules/plants/PlantComments";
import SuggestPlantModal from "@/modules/user/SuggestPlantModal";

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [viewCount, setViewCount] = useState<number>(0);
  const [relatedPlants, setRelatedPlants] = useState<Plant[]>([]);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const { toast } = useToast();

  // Scroll listener para botón "volver arriba"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (id) {
      fetchPlantDetail();
      checkIfFavorite();
      incrementViewCount();
    }
  }, [id]);

  const fetchPlantDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPlant(data);
      
      // DEBUG: Ver qué campos trae la planta
      console.log('🌿 Planta cargada:', data.name);
      console.log('📖 usage_instructions:', data.usage_instructions);
      console.log('⚠️ warnings:', data.warnings);
      console.log('🔬 scientific_article_url:', data.scientific_article_url);
      
      // Cargar plantas relacionadas después de cargar la planta principal
      if (data) {
        fetchRelatedPlants(data.category, data.tags);
      }
    } catch (error: any) {
      console.error('Error fetching plant:', error);
      toast({
        title: "Error al cargar planta",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPlants = async (category: string | null, tags: string[] | null) => {
    try {
      // Primero intentar con la misma categoría
      let { data, error } = await supabase
        .from('plants')
        .select('*')
        .neq('id', id)
        .eq('category', category || '')
        .limit(4);

      if (error) throw error;

      // Si no hay suficientes plantas de la misma categoría, cargar cualquier planta
      if (!data || data.length < 4) {
        const { data: allData, error: allError } = await supabase
          .from('plants')
          .select('*')
          .neq('id', id)
          .limit(4);

        if (allError) throw allError;
        setRelatedPlants(allData || []);
      } else {
        setRelatedPlants(data || []);
      }
    } catch (error) {
      console.error('Error fetching related plants:', error);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('plant_id', id)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // No hacer nada si no está autenticado
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para agregar favoritos",
          variant: "destructive"
        });
        return;
      }

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('plant_id', id);
        
        setIsFavorite(false);
        toast({ title: "Eliminado de favoritos" });
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, plant_id: id });
        
        setIsFavorite(true);
        toast({ title: "¡Agregado a favoritos!" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && plant) {
      try {
        await navigator.share({
          title: plant.name,
          text: `${plant.name} - ${plant.description}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "¡Enlace copiado al portapapeles!" });
    }
  };

  const incrementViewCount = async () => {
    try {
      // Obtener contador actual
      const { data } = await supabase
        .from('plants')
        .select('view_count')
        .eq('id', id)
        .single();

      const currentCount = data?.view_count || 0;
      setViewCount(currentCount + 1);

      // Incrementar en la BD (esto requiere agregar la columna view_count a plants)
      // Por ahora solo mostramos un contador local
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Leaf className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h2 className="text-2xl font-bold mb-2">Planta no encontrada</h2>
        <p className="text-muted-foreground mb-6">
          La planta que buscas no existe o fue eliminada
        </p>
        <Button onClick={() => navigate('/explorar')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/explorar" className="hover:text-primary transition-colors">
              Plantas
            </Link>
            {plant.category && (
              <>
                <ChevronRight className="w-4 h-4" />
                <Link 
                  to={`/explorar?category=${encodeURIComponent(plant.category)}`}
                  className="hover:text-primary transition-colors"
                >
                  {plant.category}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{plant.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón Volver */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/explorar')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Button>
        </motion.div>

        {/* Hero Section con Imagen Grande */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start">
            {/* Columna Izquierda: Imagen */}
            <div className="relative">
              <div className="aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden bg-muted/40 border border-border shadow-xl sticky top-4">
                {plant.image ? (
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                    <Leaf className="w-24 h-24 text-muted-foreground/20" />
                  </div>
                )}
                
                {/* Overlay con categoría y vistas */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  {plant.category && (
                    <Badge className="bg-white/90 text-black backdrop-blur-sm border-0 text-sm px-3 py-1">
                      {plant.category}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{viewCount}</span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción debajo de la imagen */}
              <div className="flex gap-3 mt-4">
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  className="flex-1 gap-2 h-12"
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  title="Compartir"
                  className="h-12 w-12"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSuggestModalOpen(true)}
                  title="Sugerir corrección"
                  className="h-12 w-12"
                >
                  <Lightbulb className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Columna Derecha: Información Principal */}
            <div className="space-y-6">
              {/* Header con Título */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  {plant.name}
                </h1>
                {plant.scientific_name && (
                  <p className="text-lg text-green-600 dark:text-green-400 italic font-medium">
                    {plant.scientific_name}
                  </p>
                )}
              </div>

              {/* Descripción */}
              {plant.description && (
                <div className="prose dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4 border border-border/50">
                  <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
                    {plant.description}
                  </p>
                </div>
              )}

              {/* Tags y Ailments */}
              <div className="space-y-3">
                {plant.tags && plant.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Propiedades</h3>
                    <div className="flex flex-wrap gap-2">
                      {plant.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {plant.ailments && plant.ailments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Útil para tratar</h3>
                    <div className="flex flex-wrap gap-2">
                      {plant.ailments.map(ailment => (
                        <Badge key={ailment} className="text-sm px-3 py-1 bg-green-500 hover:bg-green-600">
                          {ailment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sección de Información Detallada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <div className="max-w-5xl mx-auto">
            {/* Header de Botanic Index */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600 rounded-full text-white shadow-lg">
                <FlaskConical className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Botanic Index</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Información científica y médica detallada
              </p>
            </div>

            {/* Acordeones */}
            <div>
              <Accordion type="multiple" className="space-y-2">
                {/* Propiedades Medicinales */}
                <AccordionItem
                  value="properties"
                  className="border border-border rounded-lg px-3 bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/20"
                >
                  <AccordionTrigger className="text-base font-semibold hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-destructive/10 grid place-items-center">
                        <Stethoscope className="w-4 h-4 text-destructive" />
                      </div>
                      Propiedades Medicinales
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    {plant.properties ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {plant.properties}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No hay información disponible sobre propiedades medicinales.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Usos / Dolencias que trata */}
                <AccordionItem
                  value="ailments"
                  className="border border-border rounded-lg px-3 bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20"
                >
                  <AccordionTrigger className="text-base font-semibold hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-600/10 grid place-items-center">
                        <Pill className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      Usos y Dolencias que Trata
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    {plant.ailments && plant.ailments.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {plant.ailments.map((ailment, index) => (
                          <motion.div
                            key={ailment}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 border border-green-500/30"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                            <span className="text-xs font-medium">{ailment}</span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No hay información disponible sobre dolencias.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Cómo Preparar/Usar */}
                {plant.usage_instructions && (
                  <AccordionItem
                    value="usage"
                    className="border border-border rounded-lg px-3 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20"
                  >
                    <AccordionTrigger className="text-base font-semibold hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-600/10 grid place-items-center">
                          <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        Cómo Preparar y Usar
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        <p className="text-muted-foreground whitespace-pre-line">
                          {plant.usage_instructions}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Advertencias y Contraindicaciones */}
                {plant.warnings && (
                  <AccordionItem
                    value="warnings"
                    className="border border-destructive/30 rounded-lg px-3 bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/20"
                  >
                    <AccordionTrigger className="text-base font-semibold hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-destructive/10 grid place-items-center">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        </div>
                        Advertencias y Contraindicaciones
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                          <div className="prose dark:prose-invert max-w-none">
                            <p className="text-muted-foreground whitespace-pre-line text-xs">
                              {plant.warnings}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Artículo Científico - SIEMPRE VISIBLE */}
                <AccordionItem
                  value="scientific"
                  className="border border-border rounded-lg px-3 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20"
                >
                  <AccordionTrigger className="text-base font-semibold hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600/10 grid place-items-center">
                        <FlaskConical className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Investigación Científica
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    {plant.scientific_article_url && plant.scientific_article_url.trim() !== '' ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-3">
                          Consulta el artículo científico con estudios y evidencia sobre esta planta.
                        </p>
                        <Button
                          asChild
                          className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                          size="sm"
                        >
                          <a
                            href={plant.scientific_article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Ver artículo científico
                          </a>
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No hay artículo científico disponible para esta planta.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Plantas Relacionadas */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                Plantas Relacionadas
              </h3>
              {relatedPlants.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {relatedPlants.map((relatedPlant) => (
                    <motion.div
                      key={relatedPlant.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer group"
                      onClick={() => navigate(`/plantas/${relatedPlant.id}`)}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted/40 border border-border mb-2 shadow-sm group-hover:shadow-md transition-shadow">
                        {relatedPlant.image ? (
                          <img
                            src={relatedPlant.image}
                            alt={relatedPlant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center">
                            <Leaf className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {relatedPlant.name}
                      </h4>
                      {relatedPlant.category && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {relatedPlant.category}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic py-4">
                  No hay plantas relacionadas disponibles en este momento.
                </p>
              )}
            </div>

            {/* Sistema de Comentarios y Valoraciones */}
            {plant && <PlantComments plantId={plant.id} plantName={plant.name} />}
          </div>
        </motion.div>

        {/* Botón de Carrito Flotante */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl hover:shadow-2xl bg-primary hover:bg-primary/90"
            onClick={() => setShowContactModal(true)}
          >
            <ShoppingCart className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* Botón Scroll to Top */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="fixed bottom-8 right-24 z-50"
            >
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl bg-background border-2"
                onClick={scrollToTop}
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Contacto */}
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 grid place-items-center p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  ¿Interesado en {plant?.name}?
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowContactModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Contáctanos para más información sobre disponibilidad, precios y asesoramiento personalizado.
              </p>

              <div className="space-y-2">
                <Button
                  variant="default"
                  size="lg"
                  className="gap-2 w-full bg-green-600 hover:bg-green-700"
                  asChild
                >
                  <a href="tel:+51957119443">
                    <Phone className="w-4 h-4" />
                    Llamar ahora
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  asChild
                >
                  <a 
                    href={`https://wa.me/51967119443?text=${encodeURIComponent(`Hola, estoy interesado en ${plant?.name}`)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 w-full"
                  asChild
                >
                  <a href="mailto:bioplantas@gmail.com?subject=Consulta sobre ${plant?.name}&body=Hola, estoy interesado en ${plant?.name}">
                    <Mail className="w-4 h-4" />
                    Enviar correo
                  </a>
                </Button>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  📞 +51 967 119 443<br />
                  📧 bioplantas@gmail.com
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Modal de sugerencia de corrección */}
      {plant && (
        <SuggestPlantModal 
          open={suggestModalOpen} 
          onClose={() => setSuggestModalOpen(false)}
          existingPlant={plant}
        />
      )}
    </div>
  );
}
