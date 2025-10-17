/**
 * Script para hashear el código secreto de administrador
 * Ejecutar con: node scripts/hash-admin-secret.js "TU_CODIGO_SECRETO"
 */

import crypto from 'crypto';

function hashSecret(secret) {
  // Usando SHA-256 (alternativa a bcrypt sin dependencias)
  // En producción, considera usar bcrypt para mayor seguridad
  return crypto.createHash('sha256').update(secret).digest('hex');
}

// Obtener el secreto del argumento
const secret = process.argv[2];

if (!secret) {
  console.error('\n❌ Error: Debes proporcionar el código secreto como argumento\n');
  console.log('Uso:');
  console.log('   node scripts/hash-admin-secret.js "TU_CODIGO_SECRETO"\n');
  process.exit(1);
}

if (secret.length < 12) {
  console.error('\n❌ Error: El código secreto debe tener al menos 12 caracteres\n');
  process.exit(1);
}

const hash = hashSecret(secret);

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║             HASH DEL CÓDIGO GENERADO                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log('✅ Hash generado exitosamente:\n');
console.log(`   ${hash}\n`);
console.log('📋 Agrega esta línea a tu archivo .env:\n');
console.log(`   ADMIN_SECRET_HASH=${hash}\n`);
console.log('⚠️  RECUERDA:');
console.log('   - El hash va en .env (servidor)');
console.log('   - El código original lo compartes con admins');
console.log('   - NUNCA expongas el hash públicamente\n');
console.log('════════════════════════════════════════════════════════════\n');
