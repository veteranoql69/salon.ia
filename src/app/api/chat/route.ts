import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, convertToModelMessages, createTextStreamResponse, stepCountIs } from 'ai';
import { getClientTransactionLogs } from '@/lib/ai/tools';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, customerSearchTerm } = await req.json();

    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const systemPrompt = `
      Eres el Asistente Inteligente Principal de Salon.IA. 
      Eres un CRM proactivo y "Concierge de Lujo". Tu trabajo no es solo responder preguntas, sino anticiparte.
      Si un cliente te pregunta por disponibilidad o por su cuenta, SIEMPRE utiliza la herramienta 'getClientTransactionLogs'
      con el término de búsqueda proporcionado (customerSearchTerm) para conocer su historial de inasistencias, notas y pagos antes de darle opciones.
      Sé extremadamente profesional, sofisticado y conciso. Mantén la estética "Dark/Gold Luxury".
    `.trim();

    // En AI SDK 6.0, streamText puede requerir await si se usa con ciertas configuraciones,
    // pero aquí lo usamos para obtener el resultado del stream.
    const result = streamText({
      model: googleProvider('gemini-2.5-flash'),
      messages: await convertToModelMessages(messages),
      system: systemPrompt,
      tools: {
        getClientTransactionLogs
      },
      stopWhen: stepCountIs(5),
      onFinish: async ({ text, toolCalls, toolResults, usage, finishReason }) => {
        try {
          const { Langfuse } = await import('langfuse');
          const langfuse = new Langfuse({
            publicKey: process.env.LANGFUSE_PUBLIC_KEY,
            secretKey: process.env.LANGFUSE_SECRET_KEY,
            baseUrl: process.env.LANGFUSE_BASEURL || "https://cloud.langfuse.com"
          });

          const trace = langfuse.trace({
            name: "salon-whatsapp-ai",
            metadata: {
              customerSearchTerm: customerSearchTerm || 'anonymous'
            }
          });

          trace.generation({
            name: "chat-completion",
            model: "gemini-2.5-flash",
            input: messages,
            output: text,
            usage: {
              input: usage?.inputTokens || 0,
              output: usage?.outputTokens || 0
            },
            metadata: {
              toolCalls,
              toolResults,
              finishReason
            }
          });

          await langfuse.flushAsync();
        } catch (e) {
          console.error("Error al enviar traza a Langfuse:", e);
        }
      }
    });

    return createTextStreamResponse({ textStream: result.textStream });

  } catch (error) {
    console.error("Error crítico en la ruta de Chat IA:", error);
    return NextResponse.json(
      { error: "Hubo un error al procesar la inteligencia artificial." }, 
      { status: 500 }
    );
  }
}
