import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PlantSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultsCount?: number;
}

export default function PlantSearchBar({
  value,
  onChange,
  placeholder = "Buscar por nombre común o científico...",
  resultsCount
}: PlantSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (value) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const handleClear = () => {
    onChange("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div
        className={`relative transition-all duration-200 ${
          isFocused ? 'scale-[1.01]' : 'scale-100'
        }`}
      >
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Input */}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`h-14 pl-12 pr-24 text-base rounded-xl border-2 transition-all duration-200 ${
            isFocused
              ? 'border-primary shadow-lg shadow-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        />

        {/* Clear Button & Results Count */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <AnimatePresence>
            {resultsCount !== undefined && value && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md"
              >
                {resultsCount} {resultsCount === 1 ? 'resultado' : 'resultados'}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {value && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Tips */}
      <AnimatePresence>
        {isFocused && !value && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 text-xs text-muted-foreground"
          >
            💡 <span className="font-medium">Tip:</span> Puedes buscar por nombre común (ej: "manzanilla"), 
            nombre científico (ej: "Matricaria chamomilla") o propiedades.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
