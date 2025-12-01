import { useState, useEffect } from "react";
import { Search, Filter, AlertTriangle, CheckCircle2, Info, Leaf, Pill, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Interaction {
  id: string;
  plant_name: string;
  medication_name: string;
  severity: string;
  interaction_type: string;
  mechanism: string;
  clinical_consequence: string;
  recommendations: string;
  evidence_level: string;
}

export default function CompatibilityPage() {
  const navigate = useNavigate();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [filteredInteractions, setFilteredInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  useEffect(() => {
    loadInteractions();
  }, []);

  useEffect(() => {
    filterInteractions();
  }, [searchTerm, severityFilter, typeFilter, interactions]);

  const loadInteractions = async () => {
    try {
      const { data, error } = await supabase
        .from('medication_plant_interactions')
        .select('*')
        .order('severity', { ascending: true });

      if (error) throw error;
      setInteractions(data || []);
    } catch (error) {
      console.error('Error loading interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInteractions = () => {
    let filtered = [...interactions];

    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        i =>
          i.plant_name.toLowerCase().includes(search) ||
          i.medication_name.toLowerCase().includes(search) ||
          i.interaction_type.toLowerCase().includes(search)
      );
    }

    // Filtrar por severidad
    if (severityFilter !== "ALL") {
      filtered = filtered.filter(i => i.severity === severityFilter);
    }

    // Filtrar por tipo
    if (typeFilter !== "ALL") {
      filtered = filtered.filter(i => i.interaction_type.includes(typeFilter));
    }

    setFilteredInteractions(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'GRAVE':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'MODERADA':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'LEVE':
        return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'GRAVE':
        return <Badge className="bg-red-600">⚠️ GRAVE - EVITAR</Badge>;
      case 'MODERADA':
        return <Badge className="bg-amber-600">⚡ MODERADA - PRECAUCIÓN</Badge>;
      case 'LEVE':
        return <Badge className="bg-green-600">✓ LEVE - BENEFICIOSA</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'GRAVE':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'MODERADA':
        return <Info className="w-6 h-6 text-amber-600" />;
      case 'LEVE':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getStatistics = () => {
    const grave = interactions.filter(i => i.severity === 'GRAVE').length;
    const moderada = interactions.filter(i => i.severity === 'MODERADA').length;
    const leve = interactions.filter(i => i.severity === 'LEVE').length;
    return { grave, moderada, leve, total: interactions.length };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🔬 Compatibilidad Plantas-Medicamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explora todas las interacciones documentadas entre plantas medicinales y medicamentos
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Interacciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Graves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.grave}</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Moderadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.moderada}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Beneficiosas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.leve}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar planta o medicamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Severity Filter */}
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las Severidades</SelectItem>
                  <SelectItem value="GRAVE">⚠️ Solo Graves</SelectItem>
                  <SelectItem value="MODERADA">⚡ Solo Moderadas</SelectItem>
                  <SelectItem value="LEVE">✓ Solo Leves/Beneficiosas</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los Tipos</SelectItem>
                  <SelectItem value="CONTRAINDICACIÓN">Contraindicaciones</SelectItem>
                  <SelectItem value="BENEFICIOSA">Beneficiosas</SelectItem>
                  <SelectItem value="SINÉRGICA">Sinérgicas</SelectItem>
                  <SelectItem value="POTENCIACIÓN">Potenciación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredInteractions.length} de {interactions.length} interacciones
          </p>
        </div>

        {/* Interactions List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredInteractions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No se encontraron interacciones con los filtros seleccionados
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredInteractions.map((interaction, index) => (
                <motion.div
                  key={interaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-2 ${getSeverityColor(interaction.severity)} hover:shadow-lg transition-shadow`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getSeverityIcon(interaction.severity)}
                            {getSeverityBadge(interaction.severity)}
                            <Badge variant="outline">{interaction.interaction_type}</Badge>
                          </div>
                          <CardTitle className="text-2xl mb-2 flex items-center gap-3 flex-wrap">
                            <Button
                              variant="ghost"
                              className="px-3 py-1 h-auto font-bold text-lg hover:bg-green-100 dark:hover:bg-green-900/30"
                              onClick={() => {
                                // Buscar ID de la planta y navegar
                                supabase
                                  .from('plants')
                                  .select('id')
                                  .eq('name', interaction.plant_name)
                                  .single()
                                  .then(({ data }) => {
                                    if (data) navigate(`/plantas/${data.id}`);
                                  });
                              }}
                            >
                              <Leaf className="w-4 h-4 mr-1" />
                              {interaction.plant_name}
                            </Button>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                            <Button
                              variant="ghost"
                              className="px-3 py-1 h-auto font-bold text-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              onClick={() => {
                                // Buscar ID del medicamento y navegar
                                supabase
                                  .from('medications')
                                  .select('id')
                                  .eq('name', interaction.medication_name)
                                  .single()
                                  .then(({ data }) => {
                                    if (data) navigate(`/medications/${data.id}`);
                                  });
                              }}
                            >
                              <Pill className="w-4 h-4 mr-1" />
                              {interaction.medication_name}
                            </Button>
                          </CardTitle>
                          <CardDescription className="text-base">
                            {interaction.clinical_consequence}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Mechanism */}
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-400">
                          Mecanismo de Interacción:
                        </h4>
                        <p className="text-sm">{interaction.mechanism}</p>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-400">
                          Recomendaciones:
                        </h4>
                        <p className="text-sm">{interaction.recommendations}</p>
                      </div>

                      {/* Evidence Level */}
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-gray-600 dark:text-gray-400">
                            Nivel de Evidencia:{" "}
                          </span>
                          <Badge variant="outline" className="ml-1">
                            {interaction.evidence_level}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Disclaimer */}
        {filteredInteractions.length > 0 && (
          <Card className="mt-8 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-semibold mb-2">⚠️ Importante:</p>
                  <p>
                    Esta información está basada en evidencia científica publicada y tiene fines educativos.
                    Siempre consulta con tu médico o farmacéutico antes de combinar medicamentos con plantas medicinales.
                    No suspendas ningún tratamiento sin supervisión médica profesional.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
