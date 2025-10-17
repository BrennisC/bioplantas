import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/modules/user/NotificationCenter";
import SuggestPlantModal from "@/modules/user/SuggestPlantModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-foreground/80 hover:text-foreground hover:bg-muted"
  }`;

import { useAuth } from "@/modules/auth/useAuth";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    await logout();
    setLogoutDialogOpen(false);
  };

  // Función para navegar a secciones con scroll
  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      // Si no estamos en la página de inicio, navegar primero
      navigate('/');
      // Esperar a que se cargue la página y luego hacer scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Si ya estamos en la página de inicio, hacer scroll directamente
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchFavoritesCount();
      
      // Suscribirse a cambios en favoritos
      const channel = supabase
        .channel('favorites-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'favorites',
            filter: `user_id=eq.${session.user.id}`
          },
          () => {
            fetchFavoritesCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setFavoritesCount(0);
    }
  }, [session]);

  const fetchFavoritesCount = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      if (error) throw error;
      setFavoritesCount(count || 0);
    } catch (error) {
      console.error('Error fetching favorites count:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-background/70 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -15, scale: 0.9, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative"
          >
            <img 
              src="/images/xd.png" 
              alt="BioPlantas Logo" 
              className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
              onError={(e) => {
                // Fallback si la imagen no carga
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div 
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-herbal-600 to-green-600 text-white shadow-lg"
            >
              <Leaf className="h-6 w-6" />
            </div>
          </motion.div>

          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-herbal-700 to-green-600 bg-clip-text text-transparent">
            BioPlantas
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {!session ? (
            <>
              <button 
                onClick={() => scrollToSection('what-is')}
                className={navItemClass({ isActive: false })}
              >
                Qué es
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className={navItemClass({ isActive: false })}
              >
                Cómo funciona
              </button>
              <NavLink to="/login" className={navItemClass}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={navItemClass}>
                Registrarse
              </NavLink>
            </>
          ) : session.role === "admin" ? (
            <>
              <button onClick={handleLogout} className={navItemClass({ isActive: false }) as any}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/explorar" className={navItemClass}>
                Explorar
              </NavLink>
              <NavLink to="/favoritos" className={navItemClass}>
                <div className="flex items-center gap-1.5">
                  Favoritos
                  {favoritesCount > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                      {favoritesCount}
                    </Badge>
                  )}
                </div>
              </NavLink>
              
              <button 
                onClick={() => setSuggestModalOpen(true)}
                className={navItemClass({ isActive: false })}
              >
                Sugerir
              </button>
              
              <div className="flex items-center">
                <NotificationCenter />
              </div>
              
              <NavLink to="/perfil" className={navItemClass}>
                Perfil
              </NavLink>
              
              <button onClick={handleLogout} className={navItemClass({ isActive: false })}>
                Salir
              </button>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {session && session.role !== "admin" && (
            <NotificationCenter />
          )}
          
          {!session ? (
            <NavLink to="/login" className={navItemClass}>
              Ingresar
            </NavLink>
          ) : session.role === "admin" ? (
            <Button onClick={handleLogout} variant="ghost" size="sm">
              Salir
            </Button>
          ) : (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Menu className="w-5 h-5" />
                  {favoritesCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
                    >
                      {favoritesCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menú</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  <NavLink 
                    to="/explorar" 
                    className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Explorar Plantas
                  </NavLink>
                  
                  <NavLink 
                    to="/favoritos" 
                    className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Favoritos</span>
                    {favoritesCount > 0 && (
                      <Badge variant="secondary">
                        {favoritesCount}
                      </Badge>
                    )}
                  </NavLink>
                  
                  <button
                    onClick={() => {
                      setSuggestModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left w-full"
                  >
                    Sugerir Planta
                  </button>
                  
                  <NavLink 
                    to="/perfil" 
                    className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mi Perfil
                  </NavLink>
                  
                  <div className="border-t my-2" />
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-muted text-destructive transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Modal de Sugerencias */}
      <SuggestPlantModal 
        open={suggestModalOpen} 
        onClose={() => setSuggestModalOpen(false)} 
      />

      {/* Modal de confirmación para cerrar sesión */}
      <ConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={confirmLogout}
        title="¿Cerrar sesión?"
        description="¿Estás seguro de que quieres cerrar tu sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta."
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        variant="warning"
        icon="logout"
      />
    </header>
  );
}
