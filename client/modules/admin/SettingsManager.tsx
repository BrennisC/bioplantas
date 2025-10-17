import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { 
  Settings, 
  Globe, 
  Palette, 
  Shield,
  Mail,
  FileText,
  Save,
  Info,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun,
  Monitor
} from "lucide-react";

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  show_comments: boolean;
  allow_registration: boolean;
  maintenance_mode: boolean;
  terms_of_service: string;
  privacy_policy: string;
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "BioPlantas",
    site_description: "Descubre el poder curativo de las plantas medicinales",
    contact_email: "contacto@bioplantas.com",
    show_comments: true,
    allow_registration: true,
    maintenance_mode: false,
    terms_of_service: "",
    privacy_policy: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "features" | "legal">("general");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // En producción, esto vendría de una tabla "site_settings" en Supabase
      // Por ahora usamos valores por defecto que se pueden editar
      
      // Intentar cargar desde localStorage como demo
      const savedSettings = localStorage.getItem('site_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error al cargar configuración",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // En producción, guardarías en Supabase:
      // await supabase.from('site_settings').upsert(settings);
      
      // Por ahora guardamos en localStorage como demo
      localStorage.setItem('site_settings', JSON.stringify(settings));

      toast({
        title: "✅ Configuración guardada",
        description: "Los cambios se han aplicado correctamente",
      });

    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "general", label: "General", icon: Globe },
    { key: "appearance", label: "Apariencia", icon: Palette },
    { key: "features", label: "Funcionalidades", icon: Settings },
    { key: "legal", label: "Legal", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-7 w-7" />
            Configuración del Sitio
          </h2>
          <p className="text-muted-foreground mt-1">
            Personaliza la configuración general de BioPlantas
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={saveSettings}
          disabled={saving}
          className="btn flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </motion.button>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-500 mb-1">Configuración persistente</p>
            <p className="text-muted-foreground">
              En producción, estos valores se guardarían en una tabla <code className="bg-muted px-1 rounded">site_settings</code> en Supabase.
              Por ahora se guardan en localStorage como demostración.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Información General
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nombre del Sitio</label>
                <input
                  className="input w-full mt-1"
                  placeholder="BioPlantas"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se mostrará en la barra de título y encabezados
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <textarea
                  className="input w-full mt-1 min-h-[80px]"
                  placeholder="Descripción del sitio..."
                  value={settings.site_description}
                  onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Aparece en resultados de búsqueda y redes sociales
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email de Contacto
                </label>
                <input
                  type="email"
                  className="input w-full mt-1"
                  placeholder="contacto@bioplantas.com"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Para consultas y soporte de usuarios
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-500" />
              Tema de Apariencia
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecciona el tema visual del sitio. El modo sistema se ajustará automáticamente según las preferencias de tu dispositivo.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {/* Light Theme */}
                <button
                  onClick={() => setTheme("light")}
                  className={`relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    theme === "light"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                      : "border-border hover:border-indigo-300"
                  }`}
                >
                  <Sun className={`h-8 w-8 ${theme === "light" ? "text-indigo-500" : "text-muted-foreground"}`} />
                  <div className="text-center">
                    <p className="font-medium text-sm">Claro</p>
                    <p className="text-xs text-muted-foreground mt-1">Tema brillante</p>
                  </div>
                  {theme === "light" && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                </button>

                {/* Dark Theme */}
                <button
                  onClick={() => setTheme("dark")}
                  className={`relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    theme === "dark"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                      : "border-border hover:border-indigo-300"
                  }`}
                >
                  <Moon className={`h-8 w-8 ${theme === "dark" ? "text-indigo-500" : "text-muted-foreground"}`} />
                  <div className="text-center">
                    <p className="font-medium text-sm">Oscuro</p>
                    <p className="text-xs text-muted-foreground mt-1">Tema nocturno</p>
                  </div>
                  {theme === "dark" && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                </button>

                {/* System Theme */}
                <button
                  onClick={() => setTheme("system")}
                  className={`relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    theme === "system"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                      : "border-border hover:border-indigo-300"
                  }`}
                >
                  <Monitor className={`h-8 w-8 ${theme === "system" ? "text-indigo-500" : "text-muted-foreground"}`} />
                  <div className="text-center">
                    <p className="font-medium text-sm">Sistema</p>
                    <p className="text-xs text-muted-foreground mt-1">Auto ajuste</p>
                  </div>
                  {theme === "system" && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features Tab */}
      {activeTab === "features" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              Funcionalidades del Sitio
            </h3>

            <div className="space-y-4">
              {/* Show Comments Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className={`h-4 w-4 ${settings.show_comments ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <p className="font-medium">Mostrar Comentarios</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Permite que los usuarios vean y agreguen comentarios en las plantas
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, show_comments: !settings.show_comments })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.show_comments ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.show_comments ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Allow Registration Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className={`h-4 w-4 ${settings.allow_registration ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <p className="font-medium">Permitir Registro</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Habilita el registro de nuevos usuarios en el sitio
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, allow_registration: !settings.allow_registration })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.allow_registration ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.allow_registration ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className={`h-4 w-4 ${settings.maintenance_mode ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    <p className="font-medium">Modo Mantenimiento</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Muestra una página de mantenimiento a usuarios no administradores
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.maintenance_mode ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.maintenance_mode && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-500 mb-1">⚠️ Modo mantenimiento activo</p>
                      <p className="text-muted-foreground">
                        Los usuarios verán un mensaje de mantenimiento. Solo los administradores pueden acceder al sitio.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Legal Tab */}
      {activeTab === "legal" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Documentos Legales
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  Términos y Condiciones
                </label>
                <textarea
                  className="input w-full min-h-[200px] font-mono text-sm"
                  placeholder="Escribe los términos y condiciones del sitio..."
                  value={settings.terms_of_service}
                  onChange={(e) => setSettings({ ...settings, terms_of_service: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Define las reglas de uso del sitio web
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4" />
                  Política de Privacidad
                </label>
                <textarea
                  className="input w-full min-h-[200px] font-mono text-sm"
                  placeholder="Escribe la política de privacidad..."
                  value={settings.privacy_policy}
                  onChange={(e) => setSettings({ ...settings, privacy_policy: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Explica cómo se manejan los datos de usuarios
                </p>
              </div>

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-500 mb-1">Nota importante</p>
                    <p className="text-muted-foreground">
                      Es recomendable consultar con un abogado para redactar estos documentos de manera apropiada
                      según las leyes de tu país o región.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`rounded-xl border p-6 ${settings.show_comments ? 'border-green-500/20 bg-green-500/5' : 'border-border bg-card'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${settings.show_comments ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
              {settings.show_comments ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comentarios</p>
              <p className="text-xl font-bold">{settings.show_comments ? 'Activos' : 'Desactivados'}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl border p-6 ${settings.allow_registration ? 'border-green-500/20 bg-green-500/5' : 'border-border bg-card'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${settings.allow_registration ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registro</p>
              <p className="text-xl font-bold">{settings.allow_registration ? 'Permitido' : 'Bloqueado'}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl border p-6 ${settings.maintenance_mode ? 'border-amber-500/20 bg-amber-500/5' : 'border-border bg-card'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${settings.maintenance_mode ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mantenimiento</p>
              <p className="text-xl font-bold">{settings.maintenance_mode ? 'Activo' : 'Normal'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
