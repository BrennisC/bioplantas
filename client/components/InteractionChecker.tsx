import { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, Info, CheckCircle2, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Interaction {
  id: string;
  medication_name: string;
  plant_name: string;
  severity: 'GRAVE' | 'MODERADA' | 'LEVE';
  interaction_type: string;
  mechanism: string;
  clinical_consequence: string;
  recommendation: string;
  evidence_level: string;
  scientific_references: string[];
}

interface InteractionCheckerProps {
  medicationId?: string;
  medicationName?: string;
  plantId?: string;
  plantName?: string;
}

export default function InteractionChecker({ 
  medicationId, 
  medicationName,
  plantId,
  plantName 
}: InteractionCheckerProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInteraction, setExpandedInteraction] = useState<string | null>(null);

  useEffect(() => {
    checkInteractions();
  }, [medicationId, plantId]);

  const checkInteractions = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setLoading(false);
        return;
      }

      let query = supabase
        .from('medication_plant_interactions')
        .select('*');

      if (medicationId && medicationName) {
        // Verificar interacciones de este medicamento con plantas del usuario
        const { data: userPlants } = await supabase
          .from('favorites')
          .select('plant_id, plants(name)')
          .eq('user_id', session.session.user.id);

        if (userPlants && userPlants.length > 0) {
          // Extraer nombres de plantas del usuario
          const plantNames = userPlants
            .map(p => p.plants?.name)
            .filter(Boolean) as string[];
          
          if (plantNames.length > 0) {
            query = query
              .eq('medication_name', medicationName)
              .in('plant_name', plantNames);
          } else {
            setInteractions([]);
            setLoading(false);
            return;
          }
        } else {
          setInteractions([]);
          setLoading(false);
          return;
        }
      } else if (plantId && plantName) {
        // Verificar interacciones de esta planta con medicamentos del usuario
        const { data: userMeds } = await supabase
          .from('user_medications')
          .select('medication_name')
          .eq('user_id', session.session.user.id);

        if (userMeds && userMeds.length > 0) {
          query = query
            .eq('plant_name', plantName)
            .in('medication_name', userMeds.map(m => m.medication_name));
        } else {
          setInteractions([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query.order('severity', { ascending: true });

      if (error) throw error;
      setInteractions(data || []);
    } catch (error) {
      console.error('Error checking interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'GRAVE':
        return 'bg-red-100 dark:bg-red-950/30 border-red-500 text-red-900 dark:text-red-100';
      case 'MODERADA':
        return 'bg-amber-100 dark:bg-amber-950/30 border-amber-500 text-amber-900 dark:text-amber-100';
      case 'LEVE':
        return 'bg-yellow-100 dark:bg-yellow-950/30 border-yellow-500 text-yellow-900 dark:text-yellow-100';
      default:
        return 'bg-gray-100 dark:bg-gray-950/30 border-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'GRAVE':
        return <ShieldAlert className="w-6 h-6 text-red-600" />;
      case 'MODERADA':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'LEVE':
        return <Info className="w-6 h-6 text-yellow-600" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  if (loading) {
    return null; // No mostrar nada mientras carga
  }

  if (interactions.length === 0) {
    // Mostrar mensaje informativo si no hay interacciones
    return (
      <div className="p-6 rounded-xl bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">
              ✓ Sin interacciones detectadas
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {medicationName 
                ? `No se encontraron interacciones entre ${medicationName} y las plantas que estás usando actualmente.`
                : `No se encontraron interacciones entre ${plantName} y tus medicamentos actuales.`
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Agrupar por severidad
  const graveInteractions = interactions.filter(i => i.severity === 'GRAVE');
  const moderadaInteractions = interactions.filter(i => i.severity === 'MODERADA');
  const leveInteractions = interactions.filter(i => i.severity === 'LEVE');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800">
        <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-900 dark:text-red-100">
            {interactions.length} interacción(es) detectada(s)
          </p>
          <p className="text-xs text-red-700 dark:text-red-300">
            Revisa cuidadosamente las advertencias a continuación
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Interacciones GRAVES */}
        {graveInteractions.length > 0 && (
          <div>
            <h4 className="font-bold text-red-600 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              INTERACCIONES GRAVES ({graveInteractions.length})
            </h4>
            {graveInteractions.map(interaction => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                isExpanded={expandedInteraction === interaction.id}
                onToggle={() => setExpandedInteraction(
                  expandedInteraction === interaction.id ? null : interaction.id
                )}
              />
            ))}
          </div>
        )}

        {/* Interacciones MODERADAS */}
        {moderadaInteractions.length > 0 && (
          <div>
            <h4 className="font-bold text-amber-600 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              INTERACCIONES MODERADAS ({moderadaInteractions.length})
            </h4>
            {moderadaInteractions.map(interaction => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                isExpanded={expandedInteraction === interaction.id}
                onToggle={() => setExpandedInteraction(
                  expandedInteraction === interaction.id ? null : interaction.id
                )}
              />
            ))}
          </div>
        )}

        {/* Interacciones LEVES */}
        {leveInteractions.length > 0 && (
          <div>
            <h4 className="font-bold text-yellow-600 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              INTERACCIONES LEVES ({leveInteractions.length})
            </h4>
            {leveInteractions.map(interaction => (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                isExpanded={expandedInteraction === interaction.id}
                onToggle={() => setExpandedInteraction(
                  expandedInteraction === interaction.id ? null : interaction.id
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground">
          <strong>⚠️ Importante:</strong> Esta información está basada en evidencia científica publicada.
          Siempre consulta con tu médico o farmacéutico antes de combinar medicamentos con plantas medicinales.
          No suspendas ningún tratamiento sin supervisión médica.
        </p>
      </div>
    </div>
  );
}

// ============================================
// INTERACTION CARD COMPONENT
// ============================================

interface InteractionCardProps {
  interaction: Interaction;
  isExpanded: boolean;
  onToggle: () => void;
}

function InteractionCard({ interaction, isExpanded, onToggle }: InteractionCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'GRAVE':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'MODERADA':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'LEVE':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'GRAVE':
        return <Badge className="bg-red-600">GRAVE - EVITAR</Badge>;
      case 'MODERADA':
        return <Badge className="bg-amber-600">MODERADA - MONITOREAR</Badge>;
      case 'LEVE':
        return <Badge className="bg-yellow-600">LEVE - PRECAUCIÓN</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border-2 rounded-lg mb-3 overflow-hidden ${getSeverityColor(interaction.severity)}`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getSeverityBadge(interaction.severity)}
              <Badge variant="outline">{interaction.interaction_type}</Badge>
            </div>
            <h5 className="font-bold text-lg">
              {interaction.plant_name} + {interaction.medication_name}
            </h5>
            <p className="text-sm mt-1 opacity-80">
              {interaction.clinical_consequence}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-current/20"
          >
            <div className="p-4 space-y-4">
              {/* Mecanismo */}
              <div>
                <h6 className="font-semibold mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Mecanismo de Interacción:
                </h6>
                <p className="text-sm">{interaction.mechanism}</p>
              </div>

              {/* Consecuencia Clínica */}
              <div>
                <h6 className="font-semibold mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Consecuencia Clínica:
                </h6>
                <p className="text-sm">{interaction.clinical_consequence}</p>
              </div>

              {/* Recomendación */}
              <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <h6 className="font-semibold mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Recomendación:
                </h6>
                <p className="text-sm font-medium">{interaction.recommendation}</p>
              </div>

              {/* Evidencia */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold">Nivel de Evidencia: </span>
                  <Badge variant="outline" className="ml-1">
                    {interaction.evidence_level}
                  </Badge>
                </div>
              </div>

              {/* Referencias Científicas */}
              {interaction.scientific_references && interaction.scientific_references.length > 0 && (
                <div>
                  <h6 className="font-semibold mb-2 text-xs">Referencias Científicas:</h6>
                  <div className="space-y-1">
                    {interaction.scientific_references.map((ref, index) => (
                      <a
                        key={index}
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {ref.includes('pubmed') ? 'PubMed Study' : 'Scientific Reference'} {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
