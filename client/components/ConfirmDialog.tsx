import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { AlertTriangle, CheckCircle, Info, XCircle, LogOut, Trash2, AlertCircle } from "lucide-react";

export type ConfirmVariant = "danger" | "warning" | "info" | "success";
export type ConfirmIcon = "logout" | "delete" | "warning" | "info" | "success" | "error";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: ConfirmIcon;
  loading?: boolean;
}

const iconMap = {
  logout: LogOut,
  delete: Trash2,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  error: XCircle,
};

const variantStyles = {
  danger: {
    iconColor: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    buttonClass: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    buttonClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
  },
  info: {
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  success: {
    iconColor: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    buttonClass: "bg-green-600 hover:bg-green-700 text-white",
  },
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "warning",
  icon = "warning",
  loading = false,
}: ConfirmDialogProps) {
  const Icon = iconMap[icon];
  const styles = variantStyles[variant];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 rounded-full p-3 ${styles.bgColor}`}>
              <Icon className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
            
            {/* Content */}
            <div className="flex-1 space-y-2">
              <AlertDialogTitle className="text-left">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={loading} onClick={onClose}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            className={styles.buttonClass}
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook personalizado para usar el ConfirmDialog fácilmente
import { useState } from "react";

interface UseConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: ConfirmIcon;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<UseConfirmDialogOptions>({
    title: "",
    description: "",
  });
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = (opts: UseConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      setOnConfirmCallback(() => () => {
        resolve(true);
      });
    });
  };

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setLoading(false);
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      loading={loading}
      {...options}
    />
  );

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
    setLoading,
    closeDialog: handleClose,
  };
}
