import { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RecommendRequest {
  userId: string;
  preferences?: {
    climate?: string; // "tropical" | "seco" | "templado" | "frío"
    lightLevel?: string; // "pleno sol" | "sombra parcial" | "sombra"
    space?: string; // "interior" | "exterior" | "balcón"
    experienceLevel?: string; // "principiante" | "intermedio" | "experto"
    maintenanceLevel?: string; // "bajo" | "medio" | "alto"
    purposes?: string[]; // ["decorativa", "medicinal", "aromática", "comestible"]
  };
  additionalInfo?: string; // Texto libre del usuario
}

async function getAllPlantsForRecommendation() {
  const { data: plants } = await supabase
    .from("plants")
    .select("id, name, scientific_name, category, description, tags")
    .limit(100);

  if (!plants) return [];

  return plants.map((p) => ({
    id: p.id,
    name: p.name,
    scientific_name: p.scientific_name || "",
    category: p.category || "",
    description: p.description?.substring(0, 200) || "", // Limitar para tokens
    tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
  }));
}

export const handleRecommendPlants: RequestHandler = async (req, res) => {
  try {
    const { userId, preferences = {}, additionalInfo = "" } = req.body as RecommendRequest;

    if (!userId) {
      return res.status(400).json({
        error: "userId es requerido",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "API key de Gemini no configurada",
      });
    }

    // Obtener todas las plantas del catálogo
    const plants = await getAllPlantsForRecommendation();

    if (plants.length === 0) {
      return res.status(404).json({
        error: "No hay plantas disponibles en el catálogo",
      });
    }

    // Preparar lista de plantas para el contexto
    const plantsList = plants
      .map(
        (p, idx) =>
          `${idx + 1}. ${p.name} (${p.scientific_name}) - ${p.category}
   Descripción: ${p.description}
   Tags: ${p.tags}
   ID: ${p.id}`
      )
      .join("\n\n");

    // Construir prompt con preferencias del usuario
    const preferencesText = Object.entries(preferences)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        }
        return `${key}: ${value}`;
      })
      .join("\n");

    const prompt = `Eres un experto botánico recomendando plantas de nuestro catálogo.

CATÁLOGO DE PLANTAS DISPONIBLES:
${plantsList}

PREFERENCIAS DEL USUARIO:
${preferencesText}

INFORMACIÓN ADICIONAL:
${additionalInfo || "Ninguna"}

INSTRUCCIONES:
1. Analiza las preferencias del usuario
2. Selecciona las 3-5 plantas MÁS ADECUADAS del catálogo
3. Responde en formato JSON siguiendo esta estructura:

{
  "recommendations": [
    {
      "plantId": "uuid-de-la-planta",
      "plantName": "Nombre de la planta",
      "matchScore": 0.95,
      "reasons": [
        "Razón 1 por la que es buena opción",
        "Razón 2",
        "Razón 3"
      ],
      "careAdvice": "Consejo específico de cuidado para este usuario"
    }
  ],
  "generalAdvice": "Consejo general basado en las preferencias del usuario",
  "summary": "Breve resumen de por qué estas plantas son ideales"
}

IMPORTANTE:
- Solo recomienda plantas que EXISTEN en el catálogo (usa los IDs exactos)
- Ordena por matchScore de mayor a menor
- Justifica cada recomendación
- Sé específico y práctico
- Responde SOLO con el JSON, sin texto adicional`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2000,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    let responseText = response.text();

    // Limpiar respuesta
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parsear JSON
    let recommendationsData;
    try {
      recommendationsData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing recommendations:", responseText);
      return res.status(500).json({
        error: "Error al procesar las recomendaciones",
        details: "Formato de respuesta inválido",
      });
    }

    // Validar que las plantas recomendadas existen
    const validRecommendations = recommendationsData.recommendations.filter(
      (rec: any) => plants.some((p) => p.id === rec.plantId)
    );

    // Enriquecer recomendaciones con datos completos de las plantas
    const enrichedRecommendations = await Promise.all(
      validRecommendations.map(async (rec: any) => {
        const { data: plantDetails } = await supabase
          .from("plants")
          .select("*")
          .eq("id", rec.plantId)
          .single();

        return {
          ...rec,
          plantDetails: plantDetails || null,
        };
      })
    );

    return res.json({
      recommendations: enrichedRecommendations,
      generalAdvice: recommendationsData.generalAdvice,
      summary: recommendationsData.summary,
      totalPlants: plants.length,
      success: true,
    });

  } catch (error: any) {
    console.error("Error en Recommend Plants:", error);

    if (error.message?.includes("API key")) {
      return res.status(500).json({
        error: "Error de configuración del API key",
      });
    }

    if (error.message?.includes("quota")) {
      return res.status(429).json({
        error: "Se ha alcanzado el límite de uso de la API. Intenta más tarde.",
      });
    }

    return res.status(500).json({
      error: "Error al generar recomendaciones",
      details: error.message,
    });
  }
};
