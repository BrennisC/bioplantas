import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Search,
  Grid3x3,
  List,
  Download,
  Eye,
  Filter,
  X,
  Leaf,
  FileImage,
  AlertCircle
} from "lucide-react";
import Modal from "@/components/Modal";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string;
  used_in?: string[];
}

export default function MediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      
      // Listar archivos en el bucket plant-images
      const { data: filesList, error: listError } = await supabase
        .storage
        .from('plant-images')
        .list('', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) throw listError;

      // Obtener URLs públicas para cada archivo
      const filesWithUrls: MediaFile[] = await Promise.all(
        filesList.map(async (file) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('plant-images')
            .getPublicUrl(file.name);

          // Buscar en qué plantas se usa esta imagen
          const { data: plants } = await supabase
            .from('plants')
            .select('name')
            .eq('image_url', publicUrl);

          return {
            name: file.name,
            path: file.name,
            url: publicUrl,
            size: file.metadata?.size || 0,
            created_at: file.created_at || new Date().toISOString(),
            used_in: plants?.map(p => p.name) || []
          };
        })
      );

      setFiles(filesWithUrls);

    } catch (error: any) {
      console.error('Error loading files:', error);
      toast({
        title: "Error al cargar archivos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = event.target.files;
    if (!uploadFiles || uploadFiles.length === 0) return;

    try {
      setUploading(true);

      const uploadPromises = Array.from(uploadFiles).map(async (file) => {
        // Generar nombre único
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Subir archivo
        const { error: uploadError } = await supabase
          .storage
          .from('plant-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        return fileName;
      });

      await Promise.all(uploadPromises);

      toast({
        title: "✅ Archivos subidos",
        description: `Se subieron ${uploadFiles.length} ${uploadFiles.length === 1 ? 'archivo' : 'archivos'}`,
      });

      // Recargar lista
      await loadFiles();

    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error al subir archivos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const deleteFile = async (file: MediaFile) => {
    if (file.used_in && file.used_in.length > 0) {
      const confirm = window.confirm(
        `⚠️ Esta imagen está siendo usada en ${file.used_in.length} planta(s):\n\n${file.used_in.join(', ')}\n\n¿Estás seguro de eliminarla? Las plantas quedarán sin imagen.`
      );
      if (!confirm) return;
    } else {
      if (!window.confirm("¿Estás seguro de eliminar esta imagen?")) return;
    }

    try {
      const { error } = await supabase
        .storage
        .from('plant-images')
        .remove([file.path]);

      if (error) throw error;

      // Si la imagen se usaba en plantas, limpiar esas referencias
      if (file.used_in && file.used_in.length > 0) {
        await supabase
          .from('plants')
          .update({ image_url: null })
          .eq('image_url', file.url);
      }

      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada del almacenamiento",
      });

      await loadFiles();

    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const downloadFile = async (file: MediaFile) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Descargando imagen",
        description: file.name,
      });
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error al descargar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const usedImages = files.filter(f => f.used_in && f.used_in.length > 0).length;
  const unusedImages = files.length - usedImages;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando multimedia...</p>
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
            <ImageIcon className="h-7 w-7" />
            Gestión de Multimedia
          </h2>
          <p className="text-muted-foreground mt-1">
            Administra las imágenes del sitio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="btn cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Subiendo...' : 'Subir Imágenes'}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-lg">
              <FileImage className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Imágenes</p>
              <p className="text-3xl font-bold">{files.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Archivos en storage</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500/10 text-green-500 p-3 rounded-lg">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En Uso</p>
              <p className="text-3xl font-bold">{usedImages}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Usadas en plantas</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sin Usar</p>
              <p className="text-3xl font-bold">{unusedImages}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Disponibles</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500/10 text-purple-500 p-3 rounded-lg">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Espacio Total</p>
              <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Almacenamiento usado</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar imágenes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">
            {searchQuery ? "No se encontraron imágenes" : "No hay imágenes"}
          </p>
          {!searchQuery && (
            <label className="btn mt-4 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Subir primera imagen
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="relative aspect-square bg-muted">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedFile(file);
                      setPreviewOpen(true);
                    }}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => downloadFile(file)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                    title="Descargar"
                  >
                    <Download className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteFile(file)}
                    className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-sm"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>

                {file.used_in && file.used_in.length > 0 && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    {file.used_in.length}
                  </div>
                )}
              </div>

              <div className="p-3">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                  }}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatDate(file.created_at)}</span>
                    {file.used_in && file.used_in.length > 0 && (
                      <span className="flex items-center gap-1 text-green-500">
                        <Leaf className="h-3 w-3" />
                        {file.used_in.length} planta{file.used_in.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedFile(file);
                      setPreviewOpen(true);
                    }}
                    className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => downloadFile(file)}
                    className="p-2 rounded-lg hover:bg-green-500/10 text-green-500"
                    title="Descargar"
                  >
                    <Download className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteFile(file)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        {selectedFile && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                Detalles de Imagen
              </h3>
            </div>

            <div className="space-y-4">
              <img
                src={selectedFile.url}
                alt={selectedFile.name}
                className="w-full rounded-lg"
              />

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium break-all">{selectedFile.name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Tamaño</p>
                  <p className="font-medium">{formatFileSize(selectedFile.size)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Fecha de subida</p>
                  <p className="font-medium">{formatDate(selectedFile.created_at)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">URL pública</p>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                    {selectedFile.url}
                  </p>
                </div>

                {selectedFile.used_in && selectedFile.used_in.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Usado en {selectedFile.used_in.length} planta{selectedFile.used_in.length !== 1 ? 's' : ''}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFile.used_in.map((plantName, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20"
                        >
                          <Leaf className="h-3 w-3" />
                          {plantName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => downloadFile(selectedFile)}
                  className="btn flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </button>
                <button
                  onClick={() => {
                    deleteFile(selectedFile);
                    setPreviewOpen(false);
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
