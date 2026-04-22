"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export function ConciergeGreeting() {
  const { messages, append, status } = useChat({ api: "/api/chat" });
  const hasGreeted = useRef(false);

  useEffect(() => {
    // Guard: only fire once, and only when append is ready (function)
    if (!hasGreeted.current && typeof append === "function") {
      hasGreeted.current = true;
      append({
        role: "user",
        content: "Hola, acabo de llegar a Salon.IA. ¿Quién eres y cómo puedes ayudarme?",
      });
    }
  }, [append]);

  const isLoading = status === "streaming" || status === "submitted";

  // Only show the last assistant message
  const lastAiMessage = messages
    .filter((m) => m.role === "assistant")
    .pop();

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <AnimatePresence mode="wait">
        {lastAiMessage ? (
          <motion.div
            key={lastAiMessage.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl"
          >
            <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <Sparkles className="w-5 h-5 text-black" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-primary opacity-80">
                  Concierge Digital
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              </div>

              <p className="text-xl md:text-2xl font-medium leading-relaxed text-white/90 italic">
                &ldquo;{lastAiMessage.content}&rdquo;
              </p>

              {isLoading && (
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay }}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center p-12"
          >
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
