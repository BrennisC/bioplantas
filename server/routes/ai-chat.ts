import { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  message: string;
  sessionId: string;
  userId: string;
  conversationHistory?: ChatMessage[];
}

// Sistema de rate limiting simple (en producción usar Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reiniciar límite: 20 mensajes por hora
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hora
    });
    return true;
  }

  if (userLimit.count >= 20) {
    return false;
  }

  userLimit.count++;
  return true;
}

async function getPlantContext(): Promise<string> {
  // Obtener resumen del catálogo de plantas para dar contexto a Gemini
  const { data: plants, error } = await supabase
    .from("plants")
    .select("id, name, scientific_name, category, description")
    .limit(50); // Limitar para no exceder tokens

  if (error || !plants) {
    return "No hay información del catálogo disponible.";
  }

  const plantList = plants
    .map(
      (p) =>
        `- ${p.name} (${p.scientific_name || "N/A"}): ${p.category || "Sin categoría"}`
    )
    .join("\n");

  return `
Catálogo de Plantas Disponibles en Cosmos Haven:
${plantList}

Cuando el usuario pregunte sobre plantas específicas, consulta este catálogo.
Si una planta no está en el catálogo, puedes dar información general pero menciona que no está disponible en nuestro catálogo actual.
`;
}

export const handleAIChat: RequestHandler = async (req, res) => {
  try {
    const { message, sessionId, userId, conversationHistory = [] } = req.body as ChatRequest;

    // Validaciones
    if (!message || !sessionId || !userId) {
      return res.status(400).json({ 
        error: "Faltan campos requeridos: message, sessionId, userId" 
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "API key de Gemini no configurada" 
      });
    }

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        error: "Has alcanzado el límite de mensajes por hora. Intenta más tarde.",
      });
    }

    // Obtener contexto del catálogo
    const plantContext = await getPlantContext();

    // Preparar el modelo
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Más rápido y económico que Pro
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    // Construir el prompt con contexto del sistema
    const systemPrompt = `Eres un asistente experto en plantas llamado "Cosmos AI" de la aplicación Cosmos Haven.
Tu propósito es ayudar a los usuarios con:
1. Consultas sobre cuidados de plantas
2. Recomendaciones personalizadas según sus necesidades
3. Identificación de problemas en plantas
4. Información sobre el catálogo de plantas disponibles

${plantContext}

Instrucciones importantes:
- Sé amigable, conciso y útil
- Si mencionan una planta del catálogo, referencia su nombre exacto
- Da consejos prácticos y específicos
- Si no sabes algo, admítelo honestamente
- Usa emojis ocasionalmente para hacer la conversación más amena 🌿
- Responde en español
`;

    // Construir historial de conversación para contexto
    const chatHistory = conversationHistory
      .slice(-10) // Solo últimos 10 mensajes para no exceder tokens
      .map((msg) => `${msg.role === "user" ? "Usuario" : "Asistente"}: ${msg.content}`)
      .join("\n\n");

    const fullPrompt = `${systemPrompt}

Historial de conversación:
${chatHistory}

Usuario: ${message}

Asistente:`;

    // Generar respuesta con Gemini
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const assistantMessage = response.text();

    // Guardar mensaje del usuario en la base de datos
    await supabase.from("ai_conversations").insert({
      user_id: userId,
      session_id: sessionId,
      role: "user",
      content: message,
      context: { timestamp: new Date().toISOString() },
    });

    // Guardar respuesta del asistente
    await supabase.from("ai_conversations").insert({
      user_id: userId,
      session_id: sessionId,
      role: "assistant",
      content: assistantMessage,
      context: { 
        model: "gemini-1.5-flash",
        timestamp: new Date().toISOString() 
      },
    });

    // Responder al cliente
    return res.json({
      message: assistantMessage,
      sessionId,
      success: true,
    });

  } catch (error: any) {
    console.error("Error en AI Chat:", error);
    
    // Manejar errores específicos de Gemini
    if (error.message?.includes("API key")) {
      return res.status(500).json({ 
        error: "Error de configuración del API key" 
      });
    }
    
    if (error.message?.includes("quota")) {
      return res.status(429).json({ 
        error: "Se ha alcanzado el límite de uso de la API. Intenta más tarde." 
      });
    }

    return res.status(500).json({ 
      error: "Error al procesar la solicitud de chat",
      details: error.message 
    });
  }
};
