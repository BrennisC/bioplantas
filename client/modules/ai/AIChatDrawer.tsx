import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/modules/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  Send,
  Camera,
  X,
  Loader2,
  Bot,
  User,
  Image as ImageIcon,
  Lightbulb,
} from "lucide-react";
// import ReactMarkdown from "react-markdown"; // CAUSA PANTALLA EN BLANCO

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isImage?: boolean;
  imagePreview?: string;
}

interface AIChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function AIChatDrawer({ open, onClose }: AIChatDrawerProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mensaje de bienvenida
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "¡Hola! 👋 Soy **Cosmos AI**, tu asistente experto en plantas. Puedo ayudarte con:\n\n" +
            "🌿 Consultas sobre cuidados de plantas\n" +
            "📸 Identificación de plantas por imagen\n" +
            "💡 Recomendaciones personalizadas\n\n" +
            "¿En qué puedo ayudarte hoy?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [open]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe superar 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedImage) return;
    if (!session) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para usar el chat",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim() || "Identifica esta planta",
      timestamp: new Date(),
      isImage: !!selectedImage,
      imagePreview: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Si hay imagen, usar endpoint de identificación
      if (selectedImage) {
        const response = await fetch("/api/ai/identify-plant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: selectedImage,
            userId: session.id,
            mimeType: imageFile?.type || "image/jpeg",
          }),
        });

        if (!response.ok) {
          throw new Error("Error al identificar la planta");
        }

        const data = await response.json();
        const identification = data.identification;
        const similarPlants = data.similarPlantsInCatalog || [];

        let responseText = `🌿 **Identificación de Planta**\n\n`;
        responseText += `**${identification.plantName}**\n`;
        responseText += `*${identification.scientificName}*\n\n`;
        responseText += `**Nivel de confianza:** ${(identification.confidence * 100).toFixed(0)}%\n\n`;
        responseText += `**Descripción:** ${identification.description}\n\n`;
        responseText += `**Nivel de cuidado:** ${identification.careLevel}\n\n`;
        responseText += `**Características:**\n`;
        identification.characteristics?.forEach((char: string) => {
          responseText += `• ${char}\n`;
        });
        responseText += `\n**Recomendaciones:** ${identification.recommendations}\n`;

        if (similarPlants.length > 0) {
          responseText += `\n\n💚 **Plantas similares en nuestro catálogo:**\n`;
          similarPlants.forEach((plant: any) => {
            responseText += `• ${plant.name} (${Math.round(plant.similarity * 100)}% coincidencia)\n`;
          });
        }

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: responseText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setSelectedImage(null);
        setImageFile(null);
      } else {
        // Chat normal
        const conversationHistory = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            sessionId,
            userId: session.id,
            conversationHistory,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al enviar el mensaje");
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar tu mensaje",
        variant: "destructive",
      });

      // Mensaje de error en el chat
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold">Cosmos AI</div>
              <div className="text-xs text-muted-foreground font-normal">
                Asistente de Plantas
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Área de mensajes */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.imagePreview && (
                      <img
                        src={message.imagePreview}
                        alt="Uploaded"
                        className="rounded-lg mb-2 max-w-full"
                      />
                    )}
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Preview de imagen seleccionada */}
        {selectedImage && (
          <div className="px-4 py-2 border-t bg-muted/50">
            <div className="relative inline-block">
              <img
                src={selectedImage}
                alt="Preview"
                className="h-20 rounded-lg border"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImageFile(null);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Input de mensaje */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Camera className="w-4 h-4" />
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="flex-1"
            />

            <Button onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !selectedImage)}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Powered by Google Gemini 🌟
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
