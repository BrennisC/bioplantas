import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Constantes de configuración
const RATE_LIMIT_MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MINUTES = 10;

// Interfaces
interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  admin_code?: string;
}

interface RateLimitResult {
  allowed: boolean;
  failedAttempts: number;
}

// Función para hashear el código admin (SHA-256)
async function hashAdminCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verificar rate limiting
async function checkRateLimit(
  supabase: any,
  email: string,
  ipAddress: string
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc('check_admin_registration_rate_limit', {
    p_email: email,
    p_ip_address: ipAddress,
    p_max_attempts: RATE_LIMIT_MAX_ATTEMPTS,
    p_window_minutes: RATE_LIMIT_WINDOW_MINUTES
  });

  if (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, failedAttempts: 0 }; // Permitir en caso de error
  }

  // Contar intentos fallidos recientes
  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - RATE_LIMIT_WINDOW_MINUTES);

  const { data: attempts } = await supabase
    .from('admin_registration_attempts')
    .select('id')
    .or(`email.eq.${email},ip_address.eq.${ipAddress}`)
    .eq('success', false)
    .gte('attempted_at', windowStart.toISOString());

  const failedAttempts = attempts?.length || 0;
  const allowed = data === true;

  return { allowed, failedAttempts };
}

// Registrar intento de admin
async function logAdminAttempt(
  supabase: any,
  email: string,
  ipAddress: string,
  userAgent: string,
  success: boolean
): Promise<void> {
  await supabase.rpc('log_admin_registration_attempt', {
    p_email: email,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
    p_success: success
  });
}

// Validar entrada
function validateInput(body: RegisterRequest): { valid: boolean; error?: string } {
  if (!body.email || !body.password) {
    return { valid: false, error: 'Email y contraseña son requeridos' };
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return { valid: false, error: 'Email inválido' };
  }

  // Validar longitud de contraseña
  if (body.password.length < 6) {
    return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  return { valid: true };
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Obtener IP y User-Agent
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Parsear body
    const body: RegisterRequest = await req.json();

    // Validar entrada
    const validation = validateInput(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determinar rol
    let role = 'user';
    let isAdminAttempt = false;

    if (body.admin_code) {
      isAdminAttempt = true;

      // Verificar rate limiting
      const rateLimitCheck = await checkRateLimit(supabase, body.email, ipAddress);
      
      if (!rateLimitCheck.allowed) {
        await logAdminAttempt(supabase, body.email, ipAddress, userAgent, false);
        
        return new Response(
          JSON.stringify({ 
            error: `Demasiados intentos fallidos. Intenta de nuevo en ${RATE_LIMIT_WINDOW_MINUTES} minutos.`,
            remainingAttempts: 0
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Obtener hash del código admin desde variables de entorno
      const adminSecretHash = Deno.env.get('ADMIN_SECRET_HASH');
      
      if (!adminSecretHash) {
        console.error('ADMIN_SECRET_HASH no está configurado');
        return new Response(
          JSON.stringify({ error: 'Error de configuración del servidor' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Hash del código proporcionado
      const providedCodeHash = await hashAdminCode(body.admin_code);

      // Verificar si el código es correcto
      if (providedCodeHash === adminSecretHash) {
        role = 'admin';
        await logAdminAttempt(supabase, body.email, ipAddress, userAgent, true);
      } else {
        // Código incorrecto
        await logAdminAttempt(supabase, body.email, ipAddress, userAgent, false);
        
        const remainingAttempts = RATE_LIMIT_MAX_ATTEMPTS - rateLimitCheck.failedAttempts - 1;
        
        return new Response(
          JSON.stringify({ 
            error: 'Código de administrador incorrecto',
            remainingAttempts: Math.max(0, remainingAttempts)
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Registrar usuario con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirmar email en desarrollo
      user_metadata: {
        full_name: body.full_name || '',
        role: role
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Actualizar el rol en la tabla users
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: role, full_name: body.full_name })
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      // No fallar si el update falla, el trigger debería crear el usuario
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: role
        },
        message: role === 'admin' 
          ? '¡Cuenta de administrador creada exitosamente!' 
          : 'Cuenta creada exitosamente'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
