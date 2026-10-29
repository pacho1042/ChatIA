

import { HOMERO_SYSTEM_PROMPT } from '../src/utils.js';

const MAX_MESSAGES = 200;
const MAX_CHARS = 500;
const HISTORY_LIMIT = 20;
const TIMEOUT_MS = 25_000;

// Usa un modelo verificado y disponible en tu proyecto de Gemini.
const GEMINI_MODEL = 'gemini-3.6-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Método no permitido. Utiliza POST.'
    });
  }

  const startTime = Date.now();

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Falta configurar GEMINI_API_KEY.');
      return res.status(500).json({
        error: 'El servicio de Homero no está configurado correctamente.'
      });
    }

    const { messages } = req.body ?? {};

    if (
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > MAX_MESSAGES
    ) {
      return res.status(400).json({
        error: `Envía entre 1 y ${MAX_MESSAGES} mensajes.`
      });
    }

    // Validar el historial recibido.
    const normalizedMessages = [];

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

      normalizedMessages.push({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.text.trim() }]
      });
    }

    // El historial debe comenzar con un mensaje del usuario
    // y alternar entre usuario y asistente.
    if (
      normalizedMessages[0].role !== 'user' ||
      normalizedMessages.some((message, index) =>
        index > 0 &&
        message.role === normalizedMessages[index - 1].role
      )
    ) {
      return res.status(400).json({
        error: 'El historial de conversación no tiene un orden válido.'
      });
    }

    // Enviar únicamente los últimos mensajes para reducir
    // el tiempo de procesamiento y el consumo de tokens.
    const contents = normalizedMessages
      .slice(-HISTORY_LIMIT);

    // Si el recorte comienza con una respuesta del modelo,
    // descartarla para que el historial comience con el usuario.
    while (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    if (contents.length === 0) {
      return res.status(400).json({
        error: 'No hay mensajes válidos para enviar a Homero.'
      });
    }

    const requestBody = {
      system_instruction: {
        parts: [{ text: HOMERO_SYSTEM_PROMPT }]
      },
      contents,
      generationConfig: {
        maxOutputTokens: 512
      }
    };

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      TIMEOUT_MS
    );

    try {
      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Gemini devolvió un error:', {
          status: response.status,
          model: GEMINI_MODEL,
          durationMs: Date.now() - startTime,
          details: data?.error?.message
        });

        if (response.status === 429) {
          return res.status(503).json({
            error: 'Homero está ocupado. Inténtalo de nuevo en unos segundos.'
          });
        }

        if ([401, 403].includes(response.status)) {
          return res.status(502).json({
            error: 'No se pudo autenticar la solicitud con Gemini. Revisa la configuración del servidor.'
          });
        }

        if ([500, 502, 503, 504].includes(response.status)) {
          return res.status(503).json({
            error: 'Gemini no está disponible en este momento. Inténtalo de nuevo.'
          });
        }

        return res.status(502).json({
          error: 'No fue posible obtener una respuesta de Gemini.'
        });
      }

      const reply = data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim();

      if (!reply) {
        console.error('Gemini no devolvió texto:', {
          durationMs: Date.now() - startTime,
          finishReason: data?.candidates?.[0]?.finishReason
        });

        return res.status(502).json({
          error: 'Homero no devolvió una respuesta válida. Inténtalo de nuevo.'
        });
      }

      console.info('Respuesta de Gemini completada:', {
        model: GEMINI_MODEL,
        durationMs: Date.now() - startTime,
        inputMessages: contents.length
      });

      return res.status(200).json({ reply });

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Tiempo de espera agotado:', {
          model: GEMINI_MODEL,
          timeoutMs: TIMEOUT_MS,
          durationMs: Date.now() - startTime
        });

        return res.status(504).json({
          error: 'Homero está tardando demasiado. Inténtalo de nuevo.'
        });
      }

      console.error('Error de conexión con Gemini:', {
        message: error.message,
        durationMs: Date.now() - startTime
      });

      return res.status(502).json({
        error: 'No se pudo conectar con Gemini. Inténtalo de nuevo.'
      });

    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    console.error('Error interno en /api/chat:', error);

    return res.status(500).json({
      error: 'Ocurrió un error interno en el servidor.'
    });
  }
}
