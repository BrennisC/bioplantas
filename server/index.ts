import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleAIChat } from "./routes/ai-chat";
import { handleIdentifyPlant } from "./routes/ai-identify";
import { handleRecommendPlants } from "./routes/ai-recommend";

// Verificar configuración de IA al iniciar
function checkAIConfiguration() {
  const warnings = [];
  
  if (!process.env.GEMINI_API_KEY) {
    warnings.push('❌ GEMINI_API_KEY no configurada');
  } else {
    console.log('✅ GEMINI_API_KEY configurada');
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    warnings.push('❌ SUPABASE_SERVICE_ROLE_KEY no configurada o es placeholder');
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY configurada');
  }
  
  if (warnings.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('🚨 ADVERTENCIA: SISTEMA DE IA NO FUNCIONARÁ');
    console.log('='.repeat(60));
    warnings.forEach(w => console.log(w));
    console.log('\n📖 Lee: PROBLEMAS_Y_SOLUCIONES.md');
    console.log('📖 O ejecuta: node scripts/test-ai-config.js');
    console.log('='.repeat(60) + '\n');
  } else {
    console.log('🤖 Sistema de IA completamente configurado\n');
  }
}

export function createServer() {
  const app = express();

  // Verificar configuración
  checkAIConfiguration();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" })); // Aumentar límite para imágenes base64
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // AI Routes
  app.post("/api/ai/chat", handleAIChat);
  app.post("/api/ai/identify-plant", handleIdentifyPlant);
  app.post("/api/ai/recommend", handleRecommendPlants);

  return app;
}
