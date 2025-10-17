import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Plant {
  id: string;
  name: string;
  scientific_name: string;
  description: string;
  category?: string;
  properties?: string;
  image?: string;
  image_url?: string;
  scientific_article_url?: string;
  tags?: string[];
  ailments?: string[];
  usage_instructions?: string;
  warnings?: string;
  created_at?: string;
  updated_at?: string;
  // ⬅️ CAMPOS MÉDICOS AGREGADOS
  therapeutic_indications?: string;
  contraindications?: string;
  side_effects?: string;
  drug_interactions?: string;
  dosage_adults?: string;
  dosage_children?: string;
  administration_route?: string[];
  preparation_method?: string;
  safe_pregnancy?: boolean;
  safe_lactation?: boolean;
  safe_children?: boolean;
  evidence_level?: string;
  clinical_studies?: string;
  nursing_notes?: string;
  monitoring_parameters?: string[];
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  plant_id: string;
  created_at?: string;
}
