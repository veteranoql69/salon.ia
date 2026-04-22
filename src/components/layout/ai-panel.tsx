'use client'

import { useState, useEffect } from "react"
import { Sparkles, ChevronRight, ChevronLeft, Activity, Info, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AIPanel() {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [logs, setLogs] = useState<{ id: string; text: string; time: string; type: 'insight' | 'activity' }[]>([])

  useEffect(() => {
    // Simulated AI Activity
    setLogs([
      { id: '1', text: 'Analizando tendencias de agenda...', time: '12:45', type: 'activity' },
      { id: '2', text: 'Optimizando ocupación de sillones...', time: '12:40', type: 'insight' },
      { id: '3', text: 'Nueva reserva VIP detectada', time: '12:35', type: 'activity' },
    ])
  }, [])

  return (
    <div 
      className={`fixed top-0 right-0 h-full bg-black/40 backdrop-blur-2xl border-l border-white/5 z-40 transition-all duration-500 ease-in-out shadow-[-20px_0_40px_rgba(0,0,0,0.4)] ${isCollapsed ? 'w-16' : 'w-80'}`}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="h-16 flex items-center justify-center border-b border-white/5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-full hover:bg-white/5 transition-all duration-300"
          >
            {isCollapsed ? (
              <div className="relative">
                <Sparkles className="w-5 h-5 text-primary animate-pulse-gold" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
              </div>
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="flex-1 flex flex-col p-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">
                AI Concierge
              </h2>
            </div>

            <div className="space-y-6 flex-1 overflow-hidden">
              <section>
                <div className="flex items-center gap-2 mb-4 opacity-50">
                  <Activity className="w-4 h-4" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Actividad Reciente</h3>
                </div>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="group relative pl-4 border-l border-white/10 hover:border-primary/50 transition-colors py-1">
                        <div className={`absolute left-[-5px] top-2 w-2 h-2 rounded-full border border-background shadow-[0_0_10px_rgba(245,158,11,0.5)] ${log.type === 'insight' ? 'bg-primary' : 'bg-cyan-400'}`} />
                        <p className="text-xs text-foreground/80 leading-relaxed">{log.text}</p>
                        <span className="text-[9px] text-muted-foreground uppercase mt-1 block font-mono">[{log.time}]</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </section>

              <section className="mt-auto pt-6 border-t border-white/5">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 relative overflow-hidden group">
                  <Zap className="absolute -right-2 -bottom-2 w-16 h-16 text-primary/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Insight Proactivo</span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-snug">
                    "Detectado un hueco de 45 min el martes. ¿Desea que la IA sugiera una promoción personalizada?"
                  </p>
                  <Button variant="link" className="p-0 h-auto text-[10px] uppercase font-bold text-primary mt-3 hover:no-underline hover:translate-x-1 transition-transform">
                    Optimizar ahora →
                  </Button>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Vertical Text when Collapsed */}
        {isCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <span className="rotate-90 text-[10px] font-black uppercase tracking-[0.5em] text-primary/30 whitespace-nowrap">
              Luxury Concierge
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
