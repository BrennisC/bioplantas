import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, Heart, Baby, Pill, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MedicalCondition {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

interface OnboardingWizardProps {
  open: boolean;
  userId: string;
  onComplete: () => void;
}

export default function OnboardingWizard({ open, userId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const { toast } = useToast();

  // Estado del formulario
  const [gender, setGender] = useState<string>(""); // ⬅️ NUEVO: Género del usuario
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [isPregnant, setIsPregnant] = useState(false);
  const [isLactating, setIsLactating] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [currentMedications, setCurrentMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [preferredRoute, setPreferredRoute] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchMedicalConditions();
    }
  }, [open]);

  const fetchMedicalConditions = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_conditions')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setConditions(data || []);
    } catch (error: any) {
      console.error('Error fetching conditions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las condiciones médicas",
        variant: "destructive"
      });
    }
  };

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev =>
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const toggleRoute = (route: string) => {
    setPreferredRoute(prev =>
      prev.includes(route)
        ? prev.filter(r => r !== route)
        : [...prev, route]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_medical_profile')
        .upsert({
          user_id: userId,
          gender: gender || 'other', // ⬅️ Valor por defecto si no seleccionó
          conditions: selectedConditions,
          is_pregnant: gender === 'female' ? isPregnant : false,
          is_lactating: gender === 'female' ? isLactating : false,
          has_children: hasChildren,
          current_medications: currentMedications ? currentMedications.split(',').map(m => m.trim()) : [],
          allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
          preferred_administration: preferredRoute,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Mensaje según si completó o saltó
      const isPartialCompletion = !gender || selectedConditions.length === 0;
      
      toast({
        title: isPartialCompletion ? "Perfil guardado" : "¡Perfil completado!",
        description: isPartialCompletion 
          ? "Puedes completar tu perfil médico más tarde desde tu cuenta"
          : "Ahora verás recomendaciones personalizadas según tu perfil médico"
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Si es Paso 1 (género) y no ha seleccionado, no avanzar
    if (step === 1 && !gender) {
      toast({
        title: "Selecciona una opción",
        description: "Por favor indica tu género para continuar",
        variant: "destructive"
      });
      return;
    }
    setStep(prev => Math.min(prev + 1, 5)); // ⬅️ Ahora son 5 pasos
  };
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const groupedConditions = conditions.reduce((acc, condition) => {
    if (!acc[condition.category]) {
      acc[condition.category] = [];
    }
    acc[condition.category].push(condition);
    return acc;
  }, {} as Record<string, MedicalCondition[]>);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="border-b border-border px-6 py-4 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Completa tu perfil médico (opcional)</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Paso {step} de 5 - Te ayudaremos a encontrar las plantas adecuadas para ti
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleComplete}
                className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                disabled={loading}
              >
                Saltar por ahora
              </button>
              <div className="text-3xl">{step === 1 ? "🏥" : step === 2 ? "👤" : step === 3 ? "💊" : "✅"}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "25%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Género */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-2">¿Cuál es tu género?</h3>
                  <p className="text-sm text-muted-foreground">
                    Esta información nos ayuda a personalizar las recomendaciones según tu fisiología
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Opción: Mujer */}
                  <button
                    onClick={() => setGender('female')}
                    className={`flex items-center gap-3 p-6 rounded-lg border-2 transition-all ${
                      gender === 'female'
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
                        : "border-border hover:border-pink-300"
                    }`}
                  >
                    <span className="text-4xl">👩</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg">Mujer</div>
                      <div className="text-xs text-muted-foreground">
                        Incluye preguntas sobre embarazo y lactancia
                      </div>
                    </div>
                    {gender === 'female' && <Check className="w-5 h-5 text-pink-500" />}
                  </button>

                  {/* Opción: Hombre */}
                  <button
                    onClick={() => setGender('male')}
                    className={`flex items-center gap-3 p-6 rounded-lg border-2 transition-all ${
                      gender === 'male'
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        : "border-border hover:border-blue-300"
                    }`}
                  >
                    <span className="text-4xl">👨</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg">Hombre</div>
                      <div className="text-xs text-muted-foreground">
                        Recomendaciones adaptadas a fisiología masculina
                      </div>
                    </div>
                    {gender === 'male' && <Check className="w-5 h-5 text-blue-500" />}
                  </button>

                  {/* Opción: Otro / Prefiero no decir */}
                  <button
                    onClick={() => setGender('other')}
                    className={`flex items-center gap-3 p-6 rounded-lg border-2 transition-all md:col-span-2 ${
                      gender === 'other'
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                        : "border-border hover:border-purple-300"
                    }`}
                  >
                    <span className="text-4xl">🧑</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg">Otro / Prefiero no decir</div>
                      <div className="text-xs text-muted-foreground">
                        Recomendaciones generales sin preguntas específicas de género
                      </div>
                    </div>
                    {gender === 'other' && <Check className="w-5 h-5 text-purple-500" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Condiciones Médicas */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-2">¿Tienes alguna de estas condiciones médicas?</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona todas las que apliquen. Esto nos ayuda a recomendarte plantas seguras y efectivas.
                  </p>
                </div>

                {/* Opción: Ninguna */}
                <button
                  onClick={() => setSelectedConditions([])}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    selectedConditions.length === 0
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-border hover:border-green-300"
                  }`}
                >
                  <span className="text-2xl">✅</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Ninguna de estas</div>
                    <div className="text-xs text-muted-foreground">
                      No tengo ninguna condición médica crónica
                    </div>
                  </div>
                  {selectedConditions.length === 0 && <Check className="w-5 h-5 text-green-500" />}
                </button>

                {/* Mostrar mensaje si no hay condiciones cargadas - PERO PERMITIR CONTINUAR */}
                {conditions.length === 0 && (
                  <div className="text-center py-8 space-y-4">
                    <div className="text-4xl">�</div>
                    <p className="text-lg font-medium">
                      Aún no hay condiciones médicas configuradas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Puedes continuar y completar tu perfil más tarde cuando estén disponibles.
                    </p>
                    <Button 
                      onClick={() => setStep(3)}
                      variant="outline"
                      className="mt-4"
                    >
                      Continuar sin seleccionar condiciones
                    </Button>
                  </div>
                )}

                {Object.entries(groupedConditions).map(([category, categoryConditions]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm text-primary capitalize">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryConditions.map((condition) => (
                        <button
                          key={condition.id}
                          onClick={() => toggleCondition(condition.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                            selectedConditions.includes(condition.id)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-2xl">{condition.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{condition.name}</div>
                            <div className="text-xs text-muted-foreground">{condition.description}</div>
                          </div>
                          {selectedConditions.includes(condition.id) && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Step 3: Estado Especial (Solo para mujeres) */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-2">Información importante</h3>
                  <p className="text-sm text-muted-foreground">
                    {gender === 'female' 
                      ? 'Estas condiciones afectan qué plantas son seguras para ti'
                      : 'Esta información nos ayuda a personalizar las recomendaciones'}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Solo mostrar embarazo si es mujer */}
                  {gender === 'female' && (
                    <button
                      onClick={() => setIsPregnant(!isPregnant)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        isPregnant ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20" : "border-border hover:border-pink-300"
                      }`}
                    >
                      <Baby className={`w-8 h-8 ${isPregnant ? "text-pink-500" : "text-muted-foreground"}`} />
                      <div className="flex-1 text-left">
                        <div className="font-semibold">¿Estás embarazada?</div>
                        <div className="text-sm text-muted-foreground">
                          Solo te mostraremos plantas seguras durante el embarazo
                        </div>
                      </div>
                      {isPregnant && <Check className="w-6 h-6 text-pink-500" />}
                    </button>
                  )}

                  {/* Solo mostrar lactancia si es mujer */}
                  {gender === 'female' && (
                    <button
                      onClick={() => setIsLactating(!isLactating)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        isLactating ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-border hover:border-blue-300"
                      }`}
                    >
                      <Heart className={`w-8 h-8 ${isLactating ? "text-blue-500" : "text-muted-foreground"}`} />
                      <div className="flex-1 text-left">
                        <div className="font-semibold">¿Estás en periodo de lactancia?</div>
                        <div className="text-sm text-muted-foreground">
                          Filtraremos plantas seguras para la lactancia
                        </div>
                      </div>
                      {isLactating && <Check className="w-6 h-6 text-blue-500" />}
                    </button>
                  )}

                  {/* Mostrar para todos los géneros */}
                  <button
                    onClick={() => setHasChildren(!hasChildren)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      hasChildren ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" : "border-border hover:border-purple-300"
                    }`}
                  >
                    <Baby className={`w-8 h-8 ${hasChildren ? "text-purple-500" : "text-muted-foreground"}`} />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">¿Tienes niños pequeños?</div>
                      <div className="text-sm text-muted-foreground">
                        Te mostraremos plantas seguras para uso pediátrico
                      </div>
                    </div>
                    {hasChildren && <Check className="w-6 h-6 text-purple-500" />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Medicamentos y Alergias */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-2">Medicamentos y alergias (opcional)</h3>
                  <p className="text-sm text-muted-foreground">
                    Esto nos ayuda a advertirte sobre posibles interacciones. Puedes omitir esta sección si lo prefieres.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Pill className="w-4 h-4 inline mr-2" />
                      Medicamentos que tomas actualmente (opcional)
                    </label>
                    <textarea
                      value={currentMedications}
                      onChange={(e) => setCurrentMedications(e.target.value)}
                      placeholder="Ej: Aspirina, Metformina, Omeprazol (separados por comas) o escribe 'Ninguno'"
                      className="w-full h-24 p-3 rounded-lg border border-border bg-background resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Puedes dejarlo vacío si no tomas medicamentos regularmente
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-2" />
                      Alergias conocidas (opcional)
                    </label>
                    <textarea
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="Ej: Polen, Frutos secos, Látex (separados por comas) o escribe 'Ninguna'"
                      className="w-full h-24 p-3 rounded-lg border border-border bg-background resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Puedes dejarlo vacío si no tienes alergias conocidas
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Preferencia de uso (opcional)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'oral', label: 'Oral (té, cápsulas)', icon: '☕' },
                        { id: 'topica', label: 'Tópica (cremas)', icon: '🧴' },
                        { id: 'inhalacion', label: 'Inhalación', icon: '💨' }
                      ].map(route => (
                        <button
                          key={route.id}
                          onClick={() => toggleRoute(route.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            preferredRoute.includes(route.id)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="text-2xl mb-1">{route.icon}</div>
                          <div className="text-xs font-medium">{route.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Resumen */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-2">¡Todo listo!</h3>
                  <p className="text-sm text-muted-foreground">
                    Revisa tu información antes de continuar
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Mostrar género */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Género:</h4>
                    <Badge variant="secondary">
                      {gender === 'female' ? '👩 Mujer' : gender === 'male' ? '👨 Hombre' : '🧑 Otro / Prefiero no decir'}
                    </Badge>
                  </div>

                  {selectedConditions.length > 0 && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Condiciones seleccionadas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedConditions.map(id => {
                          const condition = conditions.find(c => c.id === id);
                          return condition && (
                            <Badge key={id} variant="secondary">
                              {condition.icon} {condition.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(isPregnant || isLactating || hasChildren) && (
                    <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
                      <h4 className="font-medium mb-2 text-pink-900 dark:text-pink-100">Estado especial:</h4>
                      <div className="space-y-1 text-sm">
                        {isPregnant && <div>✓ Embarazo</div>}
                        {isLactating && <div>✓ Lactancia</div>}
                        {hasChildren && <div>✓ Tiene niños</div>}
                      </div>
                    </div>
                  )}

                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🌿</div>
                    <p className="text-lg font-medium">
                      Ahora verás plantas personalizadas según tu perfil
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {step < 5 ? (
              <Button onClick={nextStep}>
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading}>
                {loading ? "Guardando..." : "Completar"}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
