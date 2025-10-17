import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, UserCheck, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900">
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
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Términos y Condiciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Última actualización: 16 de octubre de 2025
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          
          {/* 1. Aceptación */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Al acceder y utilizar Cosmos Haven ("la Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones, 
              todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de todas las leyes locales aplicables.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio.
            </p>
          </section>

          {/* 2. Uso de la Plataforma */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              2. Uso de la Plataforma
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>2.1 Licencia de Uso:</strong> Se le otorga una licencia limitada, no exclusiva, no transferible y revocable para acceder y usar la Plataforma con fines personales y no comerciales.</p>
              <p><strong>2.2 Restricciones:</strong> Usted se compromete a NO:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Usar la Plataforma con fines ilegales o no autorizados</li>
                <li>Copiar, modificar, distribuir o vender cualquier contenido sin autorización</li>
                <li>Intentar acceder a áreas restringidas del sistema</li>
                <li>Transmitir virus, malware o código malicioso</li>
                <li>Realizar ingeniería inversa o descompilar el software</li>
                <li>Usar bots, scrapers o herramientas automatizadas sin permiso</li>
              </ul>
            </div>
          </section>

          {/* 3. Aviso Médico Importante */}
          <section className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-6 w-6" />
              3. Aviso Médico Importante
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                ⚠️ LA INFORMACIÓN PROPORCIONADA EN ESTA PLATAFORMA NO CONSTITUYE ASESORAMIENTO MÉDICO PROFESIONAL
              </p>
              <p><strong>3.1 Solo Información:</strong> Todo el contenido sobre plantas medicinales es solo para fines informativos y educativos.</p>
              <p><strong>3.2 No es Diagnóstico:</strong> La información NO debe usarse para diagnosticar, tratar, curar o prevenir ninguna enfermedad.</p>
              <p><strong>3.3 Consulte a Profesionales:</strong> Siempre consulte a un médico, farmacéutico o profesional de la salud calificado antes de:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Iniciar cualquier tratamiento con plantas medicinales</li>
                <li>Cambiar o suspender medicamentos prescritos</li>
                <li>Si está embarazada, amamantando o tiene condiciones médicas preexistentes</li>
                <li>Si está tomando otros medicamentos (riesgo de interacciones)</li>
              </ul>
            </div>
          </section>

          {/* 4. Cuentas de Usuario */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              4. Cuentas de Usuario
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>4.1 Registro:</strong> Para acceder a ciertas funciones, debe crear una cuenta proporcionando información precisa y actualizada.</p>
              <p><strong>4.2 Seguridad:</strong> Es responsable de mantener la confidencialidad de su contraseña y cuenta.</p>
              <p><strong>4.3 Actividades:</strong> Es responsable de todas las actividades que ocurran bajo su cuenta.</p>
              <p><strong>4.4 Edad Mínima:</strong> Debe tener al menos 18 años o la mayoría de edad en su jurisdicción para usar la Plataforma.</p>
            </div>
          </section>

          {/* 5. Contenido del Usuario */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Contenido del Usuario</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>5.1 Sus Derechos:</strong> Usted retiene todos los derechos sobre el contenido que publique (comentarios, valoraciones, sugerencias).</p>
              <p><strong>5.2 Licencia a la Plataforma:</strong> Al publicar contenido, nos otorga una licencia mundial, no exclusiva, libre de regalías para usar, reproducir, modificar y mostrar ese contenido en relación con la operación de la Plataforma.</p>
              <p><strong>5.3 Contenido Prohibido:</strong> No puede publicar contenido que:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Sea ilegal, difamatorio, obsceno o abusivo</li>
                <li>Viole derechos de propiedad intelectual</li>
                <li>Contenga virus o código malicioso</li>
                <li>Promueva actividades ilegales</li>
                <li>Incluya spam o publicidad no autorizada</li>
              </ul>
            </div>
          </section>

          {/* 6. Propiedad Intelectual */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Propiedad Intelectual</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>6.1 Derechos de la Plataforma:</strong> Todo el contenido de la Plataforma (textos, imágenes, logos, diseño, código) está protegido por derechos de autor, marcas registradas y otras leyes de propiedad intelectual.</p>
              <p><strong>6.2 Nuestra Propiedad:</strong> Cosmos Haven y todos los materiales relacionados son propiedad exclusiva de BioPlantas o sus licenciantes.</p>
              <p><strong>6.3 Uso Limitado:</strong> No puede usar nuestro contenido sin autorización expresa por escrito.</p>
            </div>
          </section>

          {/* 7. Privacidad y Datos */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              7. Privacidad y Protección de Datos
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>7.1 Política de Privacidad:</strong> El uso de sus datos personales se rige por nuestra <Link to="/privacy" className="text-primary hover:underline">Política de Privacidad</Link>.</p>
              <p><strong>7.2 Datos Médicos:</strong> Los datos de salud que proporcione (condiciones médicas, alergias) son tratados con estricta confidencialidad.</p>
              <p><strong>7.3 Seguridad:</strong> Implementamos medidas de seguridad para proteger sus datos, pero ningún sistema es 100% seguro.</p>
            </div>
          </section>

          {/* 8. Limitación de Responsabilidad */}
          <section className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-red-800 dark:text-red-300">
              <Scale className="h-6 w-6" />
              8. Limitación de Responsabilidad
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="font-semibold text-red-800 dark:text-red-300">
                ⚠️ NO SOMOS RESPONSABLES POR:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Reacciones adversas al uso de plantas medicinales</li>
                <li>Interacciones con medicamentos</li>
                <li>Daños resultantes del uso de la información de la Plataforma</li>
                <li>Pérdida de datos o interrupciones del servicio</li>
                <li>Exactitud, actualidad o integridad de la información</li>
                <li>Contenido de terceros o enlaces externos</li>
              </ul>
              <p className="font-semibold mt-4">
                La Plataforma se proporciona "TAL CUAL" sin garantías de ningún tipo.
              </p>
            </div>
          </section>

          {/* 9. Indemnización */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Indemnización</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Usted acepta indemnizar y eximir de responsabilidad a Cosmos Haven, BioPlantas y sus afiliados de cualquier reclamo, 
              pérdida, daño, responsabilidad y gasto (incluidos honorarios legales) que surjan de:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300 mt-3">
              <li>Su uso de la Plataforma</li>
              <li>Violación de estos Términos</li>
              <li>Violación de derechos de terceros</li>
              <li>Contenido que usted publique</li>
            </ul>
          </section>

          {/* 10. Modificaciones */}
          <section>
            <h2 className="text-2xl font-bold mb-4">10. Modificaciones del Servicio y Términos</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>10.1 Cambios en la Plataforma:</strong> Nos reservamos el derecho de modificar o descontinuar la Plataforma en cualquier momento.</p>
              <p><strong>10.2 Cambios en Términos:</strong> Podemos actualizar estos Términos ocasionalmente. Le notificaremos de cambios importantes.</p>
              <p><strong>10.3 Uso Continuado:</strong> Su uso continuado después de los cambios constituye aceptación de los nuevos términos.</p>
            </div>
          </section>

          {/* 11. Terminación */}
          <section>
            <h2 className="text-2xl font-bold mb-4">11. Terminación</h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>11.1 Por el Usuario:</strong> Puede cerrar su cuenta en cualquier momento desde la configuración de perfil.</p>
              <p><strong>11.2 Por Nosotros:</strong> Podemos suspender o terminar su acceso si viola estos Términos.</p>
              <p><strong>11.3 Efectos:</strong> Al terminar, pierde el acceso a su cuenta, pero algunas obligaciones (indemnización, limitación de responsabilidad) continúan vigentes.</p>
            </div>
          </section>

          {/* 12. Ley Aplicable */}
          <section>
            <h2 className="text-2xl font-bold mb-4">12. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Estos Términos se rigen por las leyes de [TU_PAÍS/REGIÓN]. Cualquier disputa se resolverá en los tribunales de [TU_JURISDICCIÓN].
            </p>
          </section>

          {/* 13. Contacto */}
          <section className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              13. Contacto
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos en:
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>📧 <strong>Email Legal:</strong> <a href="mailto:legal@cosmoshaven.com" className="text-primary hover:underline">legal@cosmoshaven.com</a></p>
              <p>💬 <strong>Soporte:</strong> <a href="mailto:soporte@cosmoshaven.com" className="text-primary hover:underline">soporte@cosmoshaven.com</a></p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Cosmos Haven - BioPlantas. Todos los derechos reservados.</p>
            <p className="mt-2">
              Versión 1.0 - Última actualización: 16 de octubre de 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
