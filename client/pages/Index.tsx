import { useState, useEffect } from 'react';
import { Search, Leaf, BookOpen, Zap, Shield, Users, Heart, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/modules/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const { session } = useAuth();
  const navigate = useNavigate();

  // Array de imágenes para el carrusel
  const backgroundImages = [
    '/images/logo2ndex.png',
    '/images/fondo_index.jpg',
    '/images/index3.jpg', // Puedes agregar más imágenes aquí
    '/images/index4.jpeg',
  ];

  // Estado para el índice de la imagen actual
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Efecto para cambiar la imagen cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 3000); // Cambiar cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Si el usuario está logueado, redirigir a explorar con la búsqueda
      if (session) {
        navigate(`/explorar?search=${encodeURIComponent(searchQuery)}`);
      } else {
        // Mock search results para usuarios no logueados
        const mockRemedies = ['Manzanilla', 'Jengibre', 'Cúrcuma', 'Té Verde', 'Lavanda'];
        const results = mockRemedies.filter(remedy =>
          remedy.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results.length > 0 ? results : ['No se encontraron resultados']);
      }
    }
  };

  // Función para scroll suave a secciones
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Images Carousel */}
        {backgroundImages.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url('${image}')`,
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentImageIndex ? 1 : 0,
              scale: index === currentImageIndex ? 1 : 1.1,
            }}
            transition={{ 
              duration: 1.5,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20"></div>

        {/* Content */}        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          {/* Hero Content Container with transparent background */}
          <div className="w-full max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl p-10 sm:p-14 backdrop-blur-md bg-white/10 border-2 border-white/20 shadow-2xl relative"
            >
              {/* Decorative botanical elements */}
              <div className="absolute -top-8 -right-8 text-6xl opacity-70 filter drop-shadow-lg">🌿</div>
              <div className="absolute -bottom-8 -left-8 text-6xl opacity-70 filter drop-shadow-lg">🪴</div>

              {/* Main heading */}
              <div className="relative z-10 text-center">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
                  El poder curativo de la naturaleza
                  <span className="block mt-2 bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">
                    a tu alcance
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-white/95 mb-10 leading-relaxed drop-shadow-xl font-light">
                  Descubre información verificada sobre plantas medicinales y sus beneficios para tu bienestar integral.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!session ? (
                    <>
                      <button 
                        onClick={() => {
                          console.log('Navegando a /register...');
                          navigate('/register');
                        }}
                        className="inline-flex items-center justify-center gap-2 bg-white text-herbal-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Comenzar gratis
                        <ArrowRight className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => scrollToSection('what-is')}
                        className="inline-flex items-center justify-center gap-2 bg-herbal-600/80 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-herbal-700 hover:shadow-xl transition-all duration-300 border-2 border-white/30"
                      >
                        Conocer más
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => navigate('/explorar')}
                      className="inline-flex items-center justify-center gap-2 bg-white text-herbal-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Explorar plantas
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentImageIndex 
                  ? 'w-8 h-3 bg-white' 
                  : 'w-3 h-3 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white clip-path-wave"></div>
      </section>

      {/* What is Section */}
      <section id="what-is" className="py-20 sm:py-28 bg-gradient-to-b from-white to-herbal-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-herbal-100 rounded-full text-herbal-700 font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              Descubre BioPlantas
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-herbal-900 mb-6">
              Tu biblioteca de plantas<br />
              <span className="bg-gradient-to-r from-herbal-600 to-green-600 bg-clip-text text-transparent">
                medicinales inteligente
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              BioPlantas es tu compañero digital para explorar el fascinante mundo de las plantas medicinales. 
              Accede a información científica verificada, comparte tus experiencias y descubre remedios naturales para tu bienestar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Leaf,
                title: 'Base de Datos Extensa',
                description: 'Más de 500 plantas medicinales con información detallada sobre propiedades, usos y contraindicaciones.',
                color: 'from-green-500 to-emerald-600'
              },
              {
                icon: Shield,
                title: 'Información Verificada',
                description: 'Contenido respaldado por investigación científica y conocimiento tradicional documentado.',
                color: 'from-blue-500 to-cyan-600'
              },
              {
                icon: Users,
                title: 'Comunidad Activa',
                description: 'Comparte experiencias, lee comentarios y aprende de otros usuarios apasionados por las plantas.',
                color: 'from-purple-500 to-pink-600'
              },
              {
                icon: Heart,
                title: 'Favoritos Personalizados',
                description: 'Guarda tus plantas favoritas y crea tu propia colección de remedios naturales.',
                color: 'from-red-500 to-rose-600'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-herbal-300 hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-herbal-50/50 via-transparent to-green-50/30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 font-medium mb-4"
            >
              <Zap className="w-4 h-4" />
              Simple y Efectivo
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
              Cómo funciona
              <span className="bg-gradient-to-r from-herbal-600 to-green-600 bg-clip-text text-transparent"> BioPlantas</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En solo tres pasos simples, accede a un mundo de conocimiento sobre plantas medicinales
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                step: '01',
                title: 'Regístrate Gratis',
                description: 'Crea tu cuenta en segundos. Solo necesitas tu email y una contraseña segura.',
                icon: Users,
                features: ['Sin costo', 'Acceso inmediato', 'Perfil personalizado'],
                color: 'from-blue-500 to-cyan-500'
              },
              {
                step: '02',
                title: 'Explora y Aprende',
                description: 'Navega por nuestra extensa base de datos y descubre plantas medicinales con información detallada.',
                icon: Search,
                features: ['Búsqueda avanzada', 'Filtros por síntomas', 'Imágenes de calidad'],
                color: 'from-herbal-500 to-green-500'
              },
              {
                step: '03',
                title: 'Guarda y Comparte',
                description: 'Marca tus plantas favoritas, comparte tus experiencias y conecta con otros usuarios.',
                icon: Heart,
                features: ['Lista de favoritos', 'Comentarios', 'Sugerencias'],
                color: 'from-purple-500 to-pink-500'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-herbal-300 hover:shadow-2xl transition-all duration-300 h-full">
                  {/* Step number badge */}
                  <div className={`absolute -top-4 -left-4 w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center font-black text-lg shadow-lg`}>
                    {item.step}
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-6 mt-4`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>
                  
                  {/* Features list */}
                  <ul className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-herbal-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Arrow connector (desktop only) */}
                {index < 2 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <ArrowRight className="w-8 h-8 text-herbal-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {!session ? (
              <button 
                onClick={() => {
                  console.log('Navegando a /register desde CTA...');
                  navigate('/register');
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-herbal-600 to-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Comenzar ahora gratis
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/explorar')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-herbal-600 to-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Explorar plantas
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-herbal-900 mb-4">
              Comienza tu búsqueda
            </h2>
            <p className="text-lg text-gray-600">
              Explora nuestra colección de plantas medicinales y remedios naturales
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca una planta o un remedio..."
                className="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 focus:border-herbal-600 focus:outline-none transition text-gray-900 placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-herbal-600 text-white px-8 py-4 rounded-full hover:bg-herbal-700 transition font-bold flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
              >
                <Search className="w-5 h-5" />
                Buscar
              </button>
            </div>

            {searchResults.length > 0 && !session && (
              <div className="bg-herbal-50 rounded-lg p-6 border border-herbal-200">
                <h3 className="font-bold text-herbal-900 mb-3">Resultados:</h3>
                <ul className="space-y-2">
                  {searchResults.map((result, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-gray-800 hover:text-herbal-600 transition cursor-pointer"
                    >
                      <Leaf className="w-4 h-4 text-herbal-600" />
                      <span>{result}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-herbal-200">
                  <p className="text-sm text-gray-600 text-center">
                    <button onClick={() => navigate('/register')} className="text-herbal-600 font-semibold hover:underline">Regístrate</button> o <button onClick={() => navigate('/login')} className="text-herbal-600 font-semibold hover:underline">inicia sesión</button> para ver información completa
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-herbal-900 via-herbal-800 to-green-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img 
                    src="/images/xd.png" 
                    alt="BioPlantas Logo" 
                    className="w-12 h-12 rounded-full shadow-lg"
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-12 h-12 bg-gradient-to-br from-herbal-400 to-green-400 rounded-full items-center justify-center shadow-lg">
                    <Leaf className="w-7 h-7 text-white" />
                  </div>
                </div>
                <span className="font-bold text-xl">BioPlantas</span>
              </div>
              <p className="text-herbal-200 text-sm leading-relaxed mb-4">
                Tu biblioteca digital de plantas medicinales. Conectando la sabiduría ancestral con la ciencia moderna.
              </p>
              <div className="flex gap-3">
                {/* Aquí podrías agregar iconos de redes sociales */}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-herbal-100">Explora</h4>
              <ul className="space-y-3 text-sm text-herbal-200">
                <li>
                  <button 
                    onClick={() => scrollToSection('what-is')} 
                    className="hover:text-white transition flex items-center gap-2 text-left w-full"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Qué es BioPlantas
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('how-it-works')} 
                    className="hover:text-white transition flex items-center gap-2 text-left w-full"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Cómo funciona
                  </button>
                </li>
                <li><a href="/explorar" className="hover:text-white transition flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Explorar plantas
                </a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-herbal-100">Legal</h4>
              <ul className="space-y-3 text-sm text-herbal-200">
                <li><a href="/privacy" className="hover:text-white transition flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Privacidad
                </a></li>
                <li><a href="/terms" className="hover:text-white transition flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Términos y condiciones
                </a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-herbal-100">Contacto</h4>
              <p className="text-sm text-herbal-200 mb-2">
                ¿Tienes preguntas o sugerencias?
              </p>
              <a href="mailto:info@bioplantas.com" className="text-sm text-herbal-300 hover:text-white transition">
                info@bioplantas.com
              </a>
            </div>
          </div>
          <div className="border-t border-herbal-700 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-center text-sm text-herbal-300">
                © 2024 BioPlantas. Todos los derechos reservados.
              </p>
              <p className="text-center text-xs text-herbal-400">
                Hecho con <Heart className="w-3 h-3 inline text-red-400" /> para los amantes de la naturaleza
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
