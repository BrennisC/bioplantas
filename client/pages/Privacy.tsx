import { ArrowLeft, Shield, Lock, Eye, Database, Cookie, Mail, UserX } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver al inicio</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Política de Privacidad
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Última actualización: 16 de octubre de 2025
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          
          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Introducción</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              En Cosmos Haven valoramos y respetamos su privacidad. Esta Política de Privacidad explica cómo recopilamos, 
              usamos, compartimos y protegemos su información personal cuando utiliza nuestra plataforma.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Al usar Cosmos Haven, usted acepta las prácticas descritas en esta política.
            </p>
          </section>

          {/* 1. Información que Recopilamos */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              1. Información que Recopilamos
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-semibold mb-2">1.1 Información de Cuenta:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Nombre completo</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Contraseña (encriptada)</li>
                  <li>Foto de perfil (opcional)</li>
                  <li>Biografía (opcional)</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p className="font-semibold mb-2 text-amber-800 dark:text-amber-300">1.2 Información Médica Sensible:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Condiciones médicas que padece</li>
                  <li>Estado de embarazo o lactancia</li>
                  <li>Presencia de niños en el hogar</li>
                  <li>Medicamentos que está tomando</li>
                  <li>Alergias conocidas</li>
                  <li>Historial de búsquedas de plantas medicinales</li>
                </ul>
                <p className="mt-3 text-sm font-semibold text-amber-800 dark:text-amber-300">
                  ⚠️ Esta información es altamente confidencial y está protegida con medidas de seguridad especiales.
                </p>
              </div>

              <div>
                <p className="font-semibold mb-2">1.3 Información de Uso:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Páginas visitadas y tiempo de permanencia</li>
                  <li>Plantas favoritas y guardadas</li>
                  <li>Comentarios y valoraciones publicadas</li>
                  <li>Interacciones con el chatbot de IA</li>
                  <li>Búsquedas realizadas</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-2">1.4 Información Técnica:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Sistema operativo</li>
                  <li>Cookies y tecnologías similares</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. Cómo Usamos su Información */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              2. Cómo Usamos su Información
            </h2>
            
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>2.1 Personalización:</strong> Utilizamos sus datos médicos para recomendar plantas seguras según sus condiciones de salud.</p>
              <p><strong>2.2 Funcionamiento del Servicio:</strong> Para crear y gestionar su cuenta, procesar sus solicitudes y proporcionar soporte.</p>
              <p><strong>2.3 Comunicaciones:</strong> Enviar notificaciones importantes, actualizaciones del servicio y responder consultas.</p>
              <p><strong>2.4 Mejoras:</strong> Analizar el uso de la plataforma para mejorar funcionalidades y experiencia de usuario.</p>
              <p><strong>2.5 Seguridad:</strong> Detectar y prevenir fraude, abuso o actividades ilegales.</p>
              <p><strong>2.6 IA y Chatbot:</strong> Sus consultas al chatbot pueden usarse para mejorar el modelo de IA (anonimizadas).</p>
            </div>
          </section>

          {/* 3. Protección de Datos Médicos */}
          <section className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-800 dark:text-red-300">
              <Lock className="h-6 w-6" />
              3. Protección Especial de Datos Médicos
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="font-semibold">Sus datos de salud están protegidos con:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Encriptación:</strong> Cifrado de extremo a extremo en almacenamiento y transmisión (TLS/SSL)</li>
                <li><strong>Acceso Limitado:</strong> Solo personal autorizado puede acceder a datos médicos</li>
                <li><strong>Anonimización:</strong> Análisis estadísticos se realizan con datos anonimizados</li>
                <li><strong>Políticas RLS:</strong> Row Level Security en base de datos (solo usted ve sus datos médicos)</li>
                <li><strong>Cumplimiento Legal:</strong> Seguimos estándares GDPR y HIPAA donde aplique</li>
              </ul>
              <p className="mt-4 font-semibold text-red-800 dark:text-red-300">
                ⚠️ NUNCA vendemos, alquilamos o compartimos sus datos médicos con terceros con fines comerciales.
              </p>
            </div>
          </section>

          {/* 4. Compartir Información */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. Compartir Información con Terceros</h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p><strong>4.1 Proveedores de Servicios:</strong> Compartimos datos con proveedores que nos ayudan a operar la plataforma:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mb-4">
                <li><strong>Supabase:</strong> Hosting de base de datos (con encriptación)</li>
                <li><strong>Google Gemini AI:</strong> Procesamiento de consultas del chatbot (anonimizadas)</li>
                <li><strong>Servicios de Email:</strong> Envío de notificaciones y confirmaciones</li>
                <li><strong>Analytics:</strong> Análisis de uso (datos anonimizados)</li>
              </ul>
              
              <p><strong>4.2 Requisitos Legales:</strong> Podemos divulgar información si:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mb-4">
                <li>Es requerido por ley o proceso legal</li>
                <li>Es necesario para proteger derechos, seguridad o propiedad</li>
                <li>Hay sospecha de actividad ilegal</li>
              </ul>

              <p><strong>4.3 Consentimiento:</strong> Para cualquier otro uso, solicitaremos su consentimiento explícito.</p>
            </div>
          </section>

          {/* 5. Cookies */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Cookie className="h-6 w-6 text-primary" />
              5. Cookies y Tecnologías de Seguimiento
            </h2>
            
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>Utilizamos cookies y tecnologías similares para:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 mb-4">
                <li><strong>Cookies Esenciales:</strong> Mantener sesión activa y funcionalidad básica</li>
                <li><strong>Cookies de Preferencias:</strong> Recordar idioma, tema oscuro/claro</li>
                <li><strong>Cookies de Análisis:</strong> Entender cómo usa la plataforma</li>
              </ul>
              
              <p><strong>Control de Cookies:</strong> Puede desactivar cookies en la configuración de su navegador, pero esto puede afectar la funcionalidad.</p>
            </div>
          </section>

          {/* 6. Sus Derechos */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              6. Sus Derechos de Privacidad
            </h2>
            
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>Usted tiene derecho a:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                <li><strong>Corrección:</strong> Actualizar información incorrecta o incompleta</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de su cuenta y datos</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                <li><strong>Objeción:</strong> Oponerse al procesamiento de sus datos</li>
                <li><strong>Limitación:</strong> Solicitar restricción del procesamiento</li>
                <li><strong>Revocación:</strong> Retirar consentimiento en cualquier momento</li>
              </ul>

              <p className="mt-4">
                Para ejercer estos derechos, contacte: <a href="mailto:privacidad@cosmoshaven.com" className="text-primary hover:underline font-semibold">privacidad@cosmoshaven.com</a>
              </p>
            </div>
          </section>

          {/* 7. Retención de Datos */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Retención de Datos</h2>
            
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>7.1 Cuenta Activa:</strong> Mantenemos sus datos mientras su cuenta esté activa.</p>
              <p><strong>7.2 Eliminación:</strong> Al cerrar su cuenta, eliminamos sus datos personales en 30 días (excepto lo requerido legalmente).</p>
              <p><strong>7.3 Datos Anonimizados:</strong> Podemos retener datos estadísticos anonimizados indefinidamente.</p>
              <p><strong>7.4 Obligaciones Legales:</strong> Algunos datos pueden retenerse por requisitos legales, fiscales o contables.</p>
            </div>
          </section>

          {/* 8. Seguridad */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              8. Medidas de Seguridad
            </h2>
            
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>Implementamos medidas técnicas y organizativas para proteger sus datos:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Encriptación SSL/TLS para todas las comunicaciones</li>
                <li>Contraseñas hasheadas con bcrypt</li>
                <li>Autenticación segura (Supabase Auth)</li>
                <li>Row Level Security en base de datos</li>
                <li>Auditorías de seguridad regulares</li>
                <li>Copias de seguridad automáticas</li>
                <li>Acceso basado en roles y permisos</li>
              </ul>
              
              <p className="mt-4 font-semibold">
                Sin embargo, ningún sistema es 100% seguro. Usted es responsable de mantener su contraseña confidencial.
              </p>
            </div>
          </section>

          {/* 9. Menores de Edad */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Privacidad de Menores</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Cosmos Haven no está dirigido a menores de 18 años. No recopilamos intencionalmente información de menores. 
              Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.
            </p>
          </section>

          {/* 10. Transferencias Internacionales */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Transferencias Internacionales de Datos</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Sus datos pueden ser procesados en servidores ubicados fuera de su país. Nos aseguramos de que:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
              <li>Existan salvaguardas adecuadas (cláusulas contractuales estándar)</li>
              <li>Se cumplan estándares de protección equivalentes</li>
              <li>Se respeten las leyes de privacidad aplicables</li>
            </ul>
          </section>

          {/* 11. Cambios en la Política */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Cambios en esta Política</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>11.1 Actualizaciones:</strong> Podemos actualizar esta política ocasionalmente.</p>
              <p><strong>11.2 Notificación:</strong> Le notificaremos cambios significativos por email o mediante aviso en la plataforma.</p>
              <p><strong>11.3 Fecha de Vigencia:</strong> Los cambios entran en vigor desde la fecha de publicación.</p>
              <p><strong>11.4 Revisión:</strong> Recomendamos revisar esta política periódicamente.</p>
            </div>
          </section>

          {/* 12. Contacto */}
          <section className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              12. Contacto - Delegado de Protección de Datos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Si tiene preguntas sobre esta Política de Privacidad o el tratamiento de sus datos personales:
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>📧 <strong>Email de Privacidad:</strong> <a href="mailto:privacidad@cosmoshaven.com" className="text-primary hover:underline">privacidad@cosmoshaven.com</a></p>
              <p>🔒 <strong>Delegado de Protección de Datos:</strong> <a href="mailto:dpo@cosmoshaven.com" className="text-primary hover:underline">dpo@cosmoshaven.com</a></p>
              <p>💬 <strong>Soporte General:</strong> <a href="mailto:soporte@cosmoshaven.com" className="text-primary hover:underline">soporte@cosmoshaven.com</a></p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Cosmos Haven - BioPlantas. Todos los derechos reservados.</p>
            <p className="mt-2">
              Versión 1.0 - Última actualización: 16 de octubre de 2025
            </p>
            <p className="mt-2">
              Esta política cumple con GDPR (EU), CCPA (California) y leyes de privacidad aplicables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
