// Script de verificación del sistema de IA
// Ejecutar con: node scripts/test-ai-config.js

import 'dotenv/config';

console.log('\n🔍 Verificando Configuración del Sistema de IA\n');
console.log('='.repeat(50));

// 1. Verificar Gemini API Key
console.log('\n1. GEMINI_API_KEY:');
if (process.env.GEMINI_API_KEY) {
  console.log('   ✅ Configurada');
  console.log(`   📝 Primeros caracteres: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);
} else {
  console.log('   ❌ NO CONFIGURADA - Agrega GEMINI_API_KEY en .env');
}

// 2. Verificar Supabase URL
console.log('\n2. VITE_SUPABASE_URL:');
if (process.env.VITE_SUPABASE_URL) {
  console.log('   ✅ Configurada');
  console.log(`   📝 URL: ${process.env.VITE_SUPABASE_URL}`);
} else {
  console.log('   ❌ NO CONFIGURADA');
}

// 3. Verificar Service Role Key
console.log('\n3. SUPABASE_SERVICE_ROLE_KEY:');
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.log('   ⚠️  PLACEHOLDER - Necesitas reemplazarlo con tu key real');
    console.log('   📍 Ve a: Supabase Dashboard → Settings → API → service_role');
  } else {
    console.log('   ✅ Configurada');
    console.log(`   📝 Primeros caracteres: ${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
  }
} else {
  console.log('   ❌ NO CONFIGURADA');
  console.log('   📍 Ve a: Supabase Dashboard → Settings → API → service_role');
}

// Resumen
console.log('\n' + '='.repeat(50));
console.log('\n📋 RESUMEN:');

const allConfigured = 
  process.env.GEMINI_API_KEY && 
  process.env.VITE_SUPABASE_URL && 
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY !== 'YOUR_SERVICE_ROLE_KEY_HERE';

if (allConfigured) {
  console.log('\n✅ ¡Todo configurado correctamente!');
  console.log('   Puedes ejecutar: pnpm dev');
} else {
  console.log('\n❌ Faltan configuraciones:');
  if (!process.env.GEMINI_API_KEY) {
    console.log('   • GEMINI_API_KEY');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.log('   • SUPABASE_SERVICE_ROLE_KEY');
  }
  console.log('\n📖 Lee: QUICK_AI_SETUP.md para más información');
}

console.log('\n');
