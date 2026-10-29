
import { HOMERO_SYSTEM_PROMPT } from '../src/utils.js';

// Límites para controlar el tamaño de las solicitudes.
const MAX_MESSAGES = 40;
const MAX_CHARS = 500;

// Modelos de respaldo: verifica que estén disponibles en tu proyecto
// de Gemini antes de desplegar esta lista.
const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-4-argon',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite'
 
  /*'gemini-4-argon',
  'gemini-2.5-flash',
  'gemini-2.5-pro'*/
];

/**
 * Endpoint que recibe el historial del chat y devuelve la respuesta
 * generada por Gemini con las instrucciones de personalidad de Homero.
 */
export default async function handler(req, res) {
  // Solo se permiten solicitudes POST.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      error: 'Método no permitido. Utiliza POST.'
    });
  }

  try {
    // La clave debe estar configurada como variable de entorno en Vercel.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Falta configurar GEMINI_API_KEY.');

      return res.status(500).json({
        error: 'El servicio de Homero no está configurado correctamente.'
      });
    }

    const { messages } = req.body ?? {};

    // Comprueba que el historial tenga un tamaño permitido.
    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > MAX_MESSAGES
    ) {
      return res.status(400).json({
        error: `Envía entre 1 y ${MAX_MESSAGES} mensajes.`
      });
    }

    // Valida los mensajes y los convierte al formato requerido por Gemini.
    const contents = [];

    for (const message of messages) {
      if (
        !message ||
        !['user', 'homer', 'assistant', 'model'].includes(message.role) ||
        typeof message.text !== 'string' ||
        !message.text.trim() ||
        message.text.length > MAX_CHARS
      ) {
        return res.status(400).json({
          error: 'Uno de los mensajes tiene un formato inválido.'
        });
      }

      contents.push({
        // Gemini utiliza "user" y "model" como roles.
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.text.trim() }]
      });
    }

    // El historial debe comenzar con el usuario y alternar entre roles.
    if (
      contents[0].role !== 'user' ||
      contents.some((message, index) =>
        index > 0 && message.role === contents[index - 1].role
      )
    ) {
      return res.status(400).json({
        error: 'El historial de conversación no tiene un orden válido.'
      });
    }

    // Las instrucciones del personaje se mantienen en el servidor.
    const requestBody = {
      system_instruction: {
        parts: [{ text: HOMERO_SYSTEM_PROMPT }]
      },
      contents
    };

    let lastStatus = 503;

    // Intenta cada modelo disponible hasta obtener una respuesta válida.
    for (const model of GEMINI_MODELS) {
      let geminiResponse;

      try {
        geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify(requestBody)
          }
        );
      } catch (error) {
        // Un fallo de red permite probar el siguiente modelo.
        console.error(`Error de conexión con ${model}:`, error.message);
        continue;
      }

      const data = await geminiResponse.json().catch(() => null);

      if (geminiResponse.ok) {
        const reply = data?.candidates?.[0]?.content?.parts
          ?.map(part => part.text || '')
          .join('')
          .trim();

        if (!reply) {
          return res.status(502).json({
            error: 'Homero no devolvió una respuesta válida.'
          });
        }

        return res.status(200).json({ reply });
      }

      lastStatus = geminiResponse.status;

      console.error(`Gemini falló con ${model}:`, {
        status: geminiResponse.status,
        details: data
      });

      // Solo se prueba otro modelo ante fallos temporales o modelo no encontrado.
      if (![404, 429, 500, 503].includes(geminiResponse.status)) {
        break;
      }
    }

    // No se exponen detalles internos de la API al usuario.
    const status = [400, 401, 403].includes(lastStatus)
      ? lastStatus
      : 503;

    return res.status(status).json({
      error: '¡D’oh! No pude responder ahora. Inténtalo de nuevo.'
    });

  } catch (error) {
    console.error('Error interno en /api/chat:', error);

    return res.status(500).json({
      error: 'Ocurrió un error interno en el servidor.'
    });
  }
}
