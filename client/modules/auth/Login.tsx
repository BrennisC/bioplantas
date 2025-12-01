import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login, session } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mostrar mensaje si la sesión expiró por inactividad
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'timeout') {
      toast({
        title: "Sesión expirada",
        description: "Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.",
        variant: "destructive"
      });
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      const userRole = result.role;
      
      console.log('🔐 Login exitoso:', { 
        userRole, 
        email: result.email,
        userId: result.userId 
      });
      
      toast({
        title: "✅ Inicio de sesión exitoso",
        description: userRole === 'admin' 
          ? "Redirigiendo al panel de administración..." 
          : "Bienvenido a BioPlantes",
      });
      
      // Redirigir según el rol INMEDIATAMENTE
      setTimeout(() => {
        if (userRole === 'admin') {
          console.log('👑 Redirigiendo admin a /dashboard');
          nav("/dashboard", { replace: true });
        } else {
          console.log('👤 Redirigiendo usuario a /explorar');
          nav("/explorar", { replace: true });
        }
      }, 300); // Reducido a 300ms para redirección más rápida
      
    } else {
      toast({
        title: "❌ Error al iniciar sesión",
        description: result.error || "Credenciales incorrectas",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
        <p className="text-sm text-muted-foreground mb-4">Ingresa para explorar todas las plantas</p>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Correo"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <div className="relative">
            <input
              className="input pr-10"
              placeholder="Contraseña"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button 
            className="btn w-full" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta? <a href="/register" className="text-primary hover:underline">Regístrate aquí</a>
        </p>
      </motion.div>
    </div>
  );
}
