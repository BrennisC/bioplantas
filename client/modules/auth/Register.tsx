import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield } from "lucide-react";

export default function Register() {
  const { register, login } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showAdminField, setShowAdminField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa tu nombre y apellido",
        variant: "destructive"
      });
      return;
    }
    
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

    if (password !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor verifica que ambas contraseñas sean iguales",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    console.log('📝 Estado del formulario:', {
      showAdminField,
      adminCode: adminCode.trim(),
      adminCodeLength: adminCode.trim().length
    });
    
    // Verificar código admin si se proporcionó
    let roleToAssign: "user" | "admin" = "user";
    
    if (showAdminField && adminCode.trim()) {
      console.log('🔍 Verificando código admin...');
      // Validación temporal del código en frontend
      // TODO: Mover esta validación a Edge Function para mayor seguridad
      if (adminCode.trim() === "juniorSPE.2004") {
        roleToAssign = "admin";
        console.log('✅ Código admin válido, asignando rol: admin');
        toast({
          title: "✅ Código válido",
          description: "Registrando como administrador...",
        });
      } else {
        console.log('❌ Código admin incorrecto:', adminCode.trim());
        toast({
          title: "Código incorrecto",
          description: "El código de administrador no es válido",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    } else {
      console.log('ℹ️ Registrando como usuario normal (sin código admin)');
    }
    
    console.log('🎯 Registrando usuario con rol:', roleToAssign);
    
    // Registro con el rol determinado y nombres/apellidos
    const result = await register(email, password, firstName.trim(), lastName.trim(), roleToAssign);
    
    if (result.success) {
      toast({
        title: "¡Cuenta creada exitosamente!",
        description: roleToAssign === "admin" 
          ? "Tu cuenta de administrador ha sido creada. Ahora inicia sesión." 
          : "Tu cuenta ha sido creada. Ahora inicia sesión.",
      });
      
      // Redirigir siempre a login después de registrarse
      nav("/login", { replace: true });
    } else {
      toast({
        title: "Error al registrarse",
        description: result.error || "No se pudo crear la cuenta",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Regístrate para desbloquear la galería completa
        </p>
        
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              placeholder="Nombres *"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
            />
            <input
              className="input"
              placeholder="Apellidos *"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <input
            className="input"
            placeholder="Correo *"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          
          <div className="relative">
            <input
              className="input pr-10"
              placeholder="Contraseña (mínimo 6 caracteres)"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="relative">
            <input
              className="input pr-10"
              placeholder="Confirmar contraseña"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Toggle para mostrar campo de código admin */}
          <div className="pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => setShowAdminField(!showAdminField)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Shield size={16} />
              {showAdminField ? "Registrarme como usuario normal" : "¿Tienes un código de administrador?"}
            </button>
          </div>

          {/* Campo de código admin (opcional) */}
          {showAdminField && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <input
                className="input"
                placeholder="Código de administrador (opcional)"
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Si tienes un código de administrador, ingrésalo aquí. De lo contrario, déjalo vacío.
              </p>
            </motion.div>
          )}
          
          <button 
            className="btn w-full" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <a href="/login" className="text-primary hover:underline">Inicia sesión aquí</a>
        </p>
      </motion.div>
    </div>
  );
}
