/**
 * Script para generar un código secreto aleatorio para administradores
 * Ejecutar con: node scripts/generate-admin-secret.js
 */

import crypto from 'crypto';

function generateSecureSecret(length = 16) {
  // Genera un secreto aleatorio seguro
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let secret = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    secret += chars[randomIndex];
  }
  
  return secret;
}

// Generar el secreto
const adminSecret = generateSecureSecret(16);

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║          CÓDIGO SECRETO DE ADMINISTRADOR GENERADO         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log('🔑 Tu código secreto de administrador es:\n');
console.log(`   ${adminSecret}\n`);
console.log('⚠️  IMPORTANTE:');
console.log('   1. Guarda este código en un lugar SEGURO');
console.log('   2. Compártelo SOLO con personas que deben ser administradores');
console.log('   3. Cópialo para usarlo en el siguiente paso');
console.log('   4. NO lo guardes en el código fuente\n');
console.log('📋 Siguiente paso:');
console.log(`   node scripts/hash-admin-secret.js "${adminSecret}"\n`);
console.log('════════════════════════════════════════════════════════════\n');
