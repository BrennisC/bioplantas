import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { INACTIVITY_TIMEOUT, ACTIVITY_EVENTS } from "@/config/session.config";

export type Role = "user" | "admin";
interface Session { 
  email: string; 
  role: Role;
  id: string;
  user: SupabaseUser | null;
}

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: Role }>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user);
      } else {
        setSession(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sistema de cierre de sesión automático por inactividad
  useEffect(() => {
    if (!session) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      inactivityTimer = setTimeout(async () => {
        console.log('⏰ Sesión cerrada por inactividad');
        await supabase.auth.signOut();
        setSession(null);
        
        // Mostrar notificación al usuario
        if (typeof window !== 'undefined') {
          window.location.href = '/login?reason=timeout';
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Eventos que resetean el timer de inactividad
    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Iniciar el timer
    resetTimer();

    // Cleanup
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [session]);

  const fetchUserProfile = async (userId: string, user: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setSession({
        email: user.email!,
        role: (data?.role as Role) || 'user',
        id: userId,
        user
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setSession({
        email: user.email!,
        role: 'user',
        id: userId,
        user
      });
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(() => ({
    session,
    loading,
    login: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Obtener el rol del usuario
        if (data.user) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          console.log('👤 Datos del usuario:', { userId: data.user.id, userData, userError });

          if (!userError && userData) {
            return { success: true, role: userData.role as Role };
          }
        }

        return { success: true, role: 'user' };
      } catch (error: any) {
        console.error('Login error:', error);
        return { success: false, error: error.message || 'Error al iniciar sesión' };
      }
    },
    register: async (email: string, password: string, firstName: string, lastName: string, role: Role = "user") => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role,
              first_name: firstName,
              last_name: lastName
            }
          }
        });

        if (error) throw error;

        // Insertar el usuario en la tabla profiles con el rol y nombres
        if (data.user) {
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              role: role,
              first_name: firstName,
              last_name: lastName
            }, {
              onConflict: 'id'
            });

          console.log('✍️ Usuario insertado:', { userId: data.user.id, role, firstName, lastName, upsertError });

          if (upsertError) {
            console.error('Error inserting user:', upsertError);
          }
        }

        return { success: true };
      } catch (error: any) {
        console.error('Register error:', error);
        return { success: false, error: error.message || 'Error al registrarse' };
      }
    },
    logout: async () => {
      await supabase.auth.signOut();
      setSession(null);
    },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
