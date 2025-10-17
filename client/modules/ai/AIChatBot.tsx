import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, X } from "lucide-react";
import AIChatDrawer from "./AIChatDrawer";

/**
 * Botón flotante de IA que abre el chat drawer
 * Se muestra en la esquina inferior derecha
 */
export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Ocultar tooltip después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Botón flotante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute bottom-full right-0 mb-2 whitespace-nowrap"
                >
                  <div className="bg-popover text-popover-foreground px-4 py-2 rounded-lg shadow-lg border relative">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">
                        ¡Pregúntame sobre plantas!
                      </span>
                    </div>
                    <button
                      onClick={() => setShowTooltip(false)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* Arrow */}
                    <div className="absolute top-full right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-border" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón principal */}
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="w-20 h-20 rounded-full shadow-2xl bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-4 border-white dark:border-gray-800 relative group transition-transform hover:scale-110 ring-4 ring-green-300/50"
            >
              {/* Animación de pulso */}
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
              
              {/* Icono */}
              <div className="relative z-10 flex flex-col items-center">
                <MessageCircle className="w-8 h-8 text-white" strokeWidth={2} />
                <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse drop-shadow-lg" />
              </div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Drawer */}
      <AIChatDrawer open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
