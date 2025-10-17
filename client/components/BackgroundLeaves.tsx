import { motion } from "framer-motion";

const leaves = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  delay: Math.random() * 4,
  x: Math.random() * 100,
  size: Math.random() * 20 + 12,
  opacity: Math.random() * 0.4 + 0.2,
}));

export default function BackgroundLeaves() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {leaves.map((leaf) => (
        <motion.svg
          key={leaf.id}
          width={leaf.size}
          height={leaf.size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute text-primary"
          style={{ left: `${leaf.x}%`, top: `-10%` }}
          initial={{ y: -50, rotate: -15, opacity: 0 }}
          animate={{ y: "110%", rotate: 25, opacity: leaf.opacity }}
          transition={{ duration: 18 + leaf.delay, repeat: Infinity, ease: "linear", delay: leaf.delay }}
        >
          <path d="M12 2C13.5 5 17 6 17 9.5C17 13 14 16 12 22C10 16 7 13 7 9.5C7 6 10.5 5 12 2Z" fill="currentColor" />
        </motion.svg>
      ))}
    </div>
  );
}
