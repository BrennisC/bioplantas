import { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/useAuth';
import { Button } from './ui/button';
import { Clock } from 'lucide-react';
import { INACTIVITY_TIMEOUT, WARNING_TIME, WARNING_TIME_MINUTES, ACTIVITY_EVENTS } from '@/config/session.config';

export default function SessionWarning() {
  const { session } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_TIME_MINUTES * 60); // en segundos

  useEffect(() => {
    if (!session) {
      setShowWarning(false);
      return;
    }

    let warningTimer: NodeJS.Timeout;
    let countdownInterval: ReturnType<typeof setInterval>;

    const resetWarningTimer = () => {
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      setShowWarning(false);

      // Mostrar advertencia 5 minutos antes del cierre
      warningTimer = setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(WARNING_TIME_MINUTES * 60);

        // Iniciar countdown
        countdownInterval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, INACTIVITY_TIMEOUT - WARNING_TIME);
    };

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, resetWarningTimer);
    });

    resetWarningTimer();

    return () => {
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, resetWarningTimer);
      });
    };
  }, [session]);

  const handleExtendSession = () => {
    // Disparar un evento para resetear el timer
    document.dispatchEvent(new MouseEvent('click'));
    setShowWarning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !session) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-amber-50 border-2 border-amber-500 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 mb-1">
              ⚠️ Tu sesión está por expirar
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              Tu sesión se cerrará automáticamente en <span className="font-mono font-bold">{formatTime(timeLeft)}</span> por inactividad.
            </p>
            <Button 
              onClick={handleExtendSession}
              size="sm"
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              Mantener sesión activa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
