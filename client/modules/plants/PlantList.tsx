import { AnimatePresence, motion } from "framer-motion";
import PlantCard, { Plant } from "./PlantCard";

interface Props {
  plants: Plant[];
}

export default function PlantList({ plants }: Props) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
          }
        }}
      >
        {plants.map((p) => (
          <motion.div
            key={p.id}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
          >
            <PlantCard plant={p} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
