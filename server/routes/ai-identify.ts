import { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface IdentifyPlantRequest {
  imageBase64: string;
  userId: string;
  mimeType?: string;
}

interface PlantMatch {
  id: string;
  name: string;
  scientific_name: string;
  similarity: number;
  image: string;
}

/**
 * Busca plantas similares en el catálogo basándose en el nombre identificado
 */
async function findSimilarPlantsInCatalog(
  identifiedName: string,
  scientificName?: string
): Promise<PlantMatch[]> {
  const { data: plants } = await supabase
    .from("plants")
    .select("id, name, scientific_name, image")
    .limit(100);

  if (!plants) return [];

  // Búsqueda simple por coincidencia de texto
  const matches: PlantMatch[] = [];
  const searchTerms = [
    identifiedName.toLowerCase(),
    scientificName?.toLowerCase() || "",
  ].filter(Boolean);

  plants.forEach((plant) => {
    const plantName = plant.name.toLowerCase();
    const plantScientific = plant.scientific_name?.toLowerCase() || "";

    let similarity = 0;

    // Calcular similitud simple
    searchTerms.forEach((term) => {
      if (plantName.includes(term) || term.includes(plantName)) {
        similarity += 0.5;
      }
      if (plantScientific.includes(term) || term.includes(plantScientific)) {
        similarity += 0.5;
      }
    });

    if (similarity > 0) {
      matches.push({
        id: plant.id,
        name: plant.name,
        scientific_name: plant.scientific_name || "",
        similarity: Math.min(similarity, 1),
        image: plant.image || "",
      });
    }
  });

  return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}

export const handleIdentifyPlant: RequestHandler = async (req, res) => {
  try {
    const { imageBase64, userId, mimeType = "image/jpeg" } = req.body as IdentifyPlantRequest;

    // Validaciones
    if (!imageBase64 || !userId) {
      return res.status(400).json({
        error: "Faltan campos requeridos: imageBase64, userId",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "API key de Gemini no configurada",
      });
    }

    // Preparar el modelo con capacidad de visión
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" // Soporta texto e imágenes
    });

    const prompt = `Analiza esta imagen de una planta y proporciona la siguiente información en formato JSON:

{
  "plantName": "Nombre común de la planta",
  "scientificName": "Nombre científico (género y especie)",
  "confidence": 0.95,
  "description": "Descripción breve de la planta identificada",
  "careLevel": "fácil/moderado/difícil",
  "characteristics": ["característica 1", "característica 2", "característica 3"],
  "recommendations": "Recomendaciones breves de cuidado"
}

Si no puedes identificar la planta con seguridad, indica confidence menor a 0.5 y explica por qué.
Responde SOLO con el JSON, sin texto adicional.`;

    // Convertir base64 a formato que Gemini entiende
    const imageParts = [
      {
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: mimeType,
        },
      },
    ];

    // Generar respuesta con imagen
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;
    let responseText = response.text();

    // Limpiar la respuesta para asegurar JSON válido
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parsear respuesta JSON
    let identificationData;
    try {
      identificationData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", responseText);
      return res.status(500).json({
        error: "Error al procesar la respuesta de identificación",
        details: "Formato de respuesta inválido",
      });
    }

    // Buscar plantas similares en el catálogo
    const similarPlants = await findSimilarPlantsInCatalog(
      identificationData.plantName,
      identificationData.scientificName
    );

    const matchedPlantId = similarPlants.length > 0 ? similarPlants[0].id : null;

    // Guardar en la base de datos
    const { data: savedIdentification, error: saveError } = await supabase
      .from("ai_plant_identifications")
      .insert({
        user_id: userId,
        image_url: `data:${mimeType};base64,${imageBase64.substring(0, 100)}...`, // Guardar solo preview
        identified_plant_name: identificationData.plantName,
        confidence_score: identificationData.confidence,
        matched_plant_id: matchedPlantId,
        gemini_response: identificationData,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving identification:", saveError);
    }

    // Responder al cliente
    return res.json({
      identification: identificationData,
      similarPlantsInCatalog: similarPlants,
      matchedPlantId,
      identificationId: savedIdentification?.id,
      success: true,
    });

  } catch (error: any) {
    console.error("Error en Identify Plant:", error);

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
      error: "Error al identificar la planta",
      details: error.message,
    });
  }
};
