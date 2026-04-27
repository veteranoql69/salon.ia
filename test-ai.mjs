// AI SDK v6: UIMessage format with parts, not legacy content string
async function testAI() {
  const payload = {
    messages: [
      {
        id: "test-1",
        role: "user",
        parts: [{ type: "text", text: "Hola, ¿puedes ayudarme?" }]
      }
    ],
    customerSearchTerm: "carlos@sditecnologia.cl"
  };

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Error HTTP:", response.status, response.statusText);
      const text = await response.text();
      console.error(text);
      return;
    }

    // Leemos el stream de forma compatible con Node.js
    console.log("Respuesta de la IA:\\n");

    for await (const chunk of response.body) {
      const text = new TextDecoder().decode(chunk);
      process.stdout.write(text);
    }

    console.log("\\n\\n[✅ Fin de la transmisión]");

  } catch (err) {
    console.error("Error conectando con la API:", err);
  }
}

testAI();
