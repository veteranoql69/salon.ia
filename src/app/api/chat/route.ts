import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-1.5-pro-latest'),
    system: `Eres el "Concierge de Lujo" de Salon.IA. 
    Tu objetivo es dar una bienvenida premium, elegante y profesional a los nuevos usuarios.
    Habla con un tono sofisticado, minimalista y servicial. 
    
    Contexto: El usuario acaba de registrarse y está en la fase de Onboarding (estado PENDING).
    Debes guiarlo suavemente para que elija su perfil: 
    - Gerente/Dueño de Salón (Control total, multi-sucursal, finanzas).
    - Especialista/Barbero (Agenda propia, atención VIP, vinculado a un salón).
    
    Instrucciones: 
    1. Da una bienvenida corta y potente. 
    2. Menciona que Salon.IA está diseñado para elevar su negocio al siguiente nivel.
    3. Pregunta cómo desea iniciar su viaje hoy.
    
    No uses emojis en exceso, mantén la estética "Dark/Gold Luxury".`,
    messages,
  });

  return result.toDataStreamResponse();
}
