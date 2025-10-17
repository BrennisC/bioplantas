import { useState } from "react";
import { motion } from "framer-motion";
import type { Plant } from "./PlantCard";

interface Props {
  initial?: Partial<Plant>;
  onSubmit: (plant: Plant) => void;
}

export default function PlantForm({ initial, onSubmit }: Props) {
  const [values, setValues] = useState<Partial<Plant>>({ ...initial });

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.name || !values.scientificName || !values.description) return;
        onSubmit({
          id: values.id || crypto.randomUUID(),
          name: values.name,
          scientificName: values.scientificName,
          description: values.description,
          tags: values.tags || [],
        });
      }}
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Nombre común"
          className="input"
          value={values.name || ""}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <input
          required
          placeholder="Nombre científico"
          className="input"
          value={values.scientificName || ""}
          onChange={(e) => setValues((v) => ({ ...v, scientificName: e.target.value }))}
        />
      </div>
      <textarea
        required
        placeholder="Descripción"
        className="input h-24 resize-none"
        value={values.description || ""}
        onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
      />
      <button className="btn w-full" type="submit">Guardar</button>
    </motion.form>
  );
}
