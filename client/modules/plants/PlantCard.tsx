import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  tags: string[];
}

interface Props {
  plant: Plant;
}

export default function PlantCard({ plant }: Props) {
  return (
    <motion.article
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:shadow-lg"
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10" />
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{plant.name}</h3>
          <p className="text-xs text-muted-foreground italic">{plant.scientificName}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center shadow group-hover:rotate-6 transition-transform">
          <Leaf className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{plant.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {plant.tags.map((t) => (
          <span key={t} className="text-xs px-2 py-1 rounded-full bg-muted text-foreground/80">
            {t}
          </span>
        ))}
      </div>
    </motion.article>
  );
}
