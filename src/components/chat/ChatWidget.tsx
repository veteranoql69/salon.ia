"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { TextStreamChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Loader2 } from "lucide-react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Vercel AI SDK hook. En la v3+ (y v6+) useChat usa transport para la configuración de red
  const { messages, sendMessage, status, error } = useChat({
    transport: new TextStreamChatTransport({
      api: "/api/chat",
      body: {
        // Para pruebas, pasamos 'anonymous' hasta tener integración real de usuarios
        customerSearchTerm: "anonymous"
      }
    }),
    onError: (err) => {
      console.error("Chat API error:", err);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (pathname === "/" || pathname === "/login" || pathname === "/onboarding") {
    return null;
  }

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: input }] });
    setInput("");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-[#131313]/80 backdrop-blur-[40px] border border-[#353535] rounded-3xl overflow-hidden"
            style={{
              boxShadow: "0 20px 40px -10px rgba(226, 226, 226, 0.04)",
            }}
          >
            {/* Header / Cinematic Glass Stack */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#353535]/50 bg-[#1b1b1b]/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffc174] to-[#f59e0b] flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Sparkles className="w-4 h-4 text-[#2a1700]" />
                </div>
                <div>
                  <h3 className="text-[#e2e2e2] font-manrope font-semibold text-sm">Salon.IA Concierge</h3>
                  <p className="text-[#d8c3ad] text-[11px] font-inter uppercase tracking-wider font-bold">Asistente Proactivo</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#d8c3ad] hover:text-[#ffc174] transition-colors p-2 rounded-full hover:bg-[#353535]/50 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Area de Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#353535] scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                  <Sparkles className="w-8 h-8 text-[#ffc174] opacity-50" />
                  <p className="text-[#d8c3ad] font-inter text-sm max-w-[200px]">
                    Bienvenido. Soy tu asistente personal de lujo. ¿En qué puedo ayudarte con tu negocio hoy?
                  </p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-5 py-3.5 text-sm font-inter leading-relaxed ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-[#ffc174] to-[#f59e0b] text-[#2a1700] rounded-2xl rounded-tr-sm"
                          : "bg-[#1b1b1b] text-[#e2e2e2] border border-[#353535] rounded-2xl rounded-tl-sm shadow-inner"
                      }`}
                    >
                      {m.parts?.map((part, index) => {
                        if (part.type === 'text') {
                          return <span key={index}>{part.text}</span>;
                        }
                        if (part.type === 'reasoning') {
                          return <span key={index} className="opacity-70 italic text-xs block mb-1">Pensando...</span>;
                        }
                        if (part.type === 'tool-invocation') {
                          return <span key={index} className="opacity-50 text-xs block italic mb-1">Consultando sistema...</span>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1b1b1b] text-[#d8c3ad] border border-[#353535] rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#ffc174]" />
                    <span className="text-xs font-inter">Analizando datos...</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-center my-2">
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs px-4 py-2 rounded-lg max-w-[90%] text-center">
                    Error: {error.message || "Fallo de conexión o respuesta del servidor."}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Área de Input (Sin lineas duras, Minimalista) */}
            <div className="p-4 bg-[#1b1b1b]/80 border-t border-[#353535]/50">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu consulta..."
                  className="w-full bg-[#0e0e0e] text-[#e2e2e2] placeholder:text-[#d8c3ad]/50 border border-[#353535] rounded-full px-5 py-3.5 text-sm font-inter focus:outline-none focus:border-[#ffc174] focus:ring-1 focus:ring-[#ffc174]/50 transition-all pr-12"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-1.5 p-2.5 bg-gradient-to-br from-[#ffc174] to-[#f59e0b] text-[#2a1700] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante Liquid Light */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#ffc174] to-[#f59e0b] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(245,158,11,0.3)] border border-[#ffddb8]/20"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#2a1700]" />
        ) : (
          <MessageSquare className="w-6 h-6 text-[#2a1700]" />
        )}
      </motion.button>
    </>
  );
}
