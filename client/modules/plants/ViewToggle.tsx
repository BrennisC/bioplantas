import { motion } from "framer-motion";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewType = "grid" | "list";

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={view === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className="relative h-8 px-3"
      >
        <LayoutGrid className="w-4 h-4 mr-2" />
        Grid
        {view === "grid" && (
          <motion.div
            layoutId="activeView"
            className="absolute inset-0 bg-primary rounded-md -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Button>

      <Button
        variant={view === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="relative h-8 px-3"
      >
        <List className="w-4 h-4 mr-2" />
        Lista
        {view === "list" && (
          <motion.div
            layoutId="activeView"
            className="absolute inset-0 bg-primary rounded-md -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Button>
    </div>
  );
}
