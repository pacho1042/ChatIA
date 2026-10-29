const MAX_CHARS = 500;

// Estado a nivel de módulo: sobrevive al cambio de ruta, porque el módulo
// se carga una sola vez aunque renderChat() se llame de nuevo
const conversationHistory = [];
let isWaitingReply = false;

// Elementos de la vista que está pintada ahora mismo
let view = null;

// Limpia el texto que escribe el usuario antes de usarlo
function cleanMessage(text) {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // caracteres de control
    .replace(/\s+/g, ' ')                                          // espacios y saltos repetidos → uno
    .trim()
    .slice(0, MAX_CHARS);
}

function addMessage(role, text) {
  const messageEl = document.createElement('div');
  messageEl.classList.add(
    'message',
    role === 'user' ? 'message--user' : 'message--character'
  );

  // textContent evita que el texto se interprete como HTML
  messageEl.textContent = text;
  view.messagesEl.appendChild(messageEl);
  view.messagesEl.scrollTop = view.messagesEl.scrollHeight;

  return messageEl;
}

// Bloquea el formulario y muestra "Escribiendo…" mientras llega la respuesta
function setWaiting(isWaiting) {
  isWaitingReply = isWaiting;
  view.inputEl.disabled = isWaiting;
  view.sendBtn.disabled = isWaiting;

  if (isWaiting) {
    view.loadingEl = addMessage('homer', 'Escribiendo…');
  } else {
    view.loadingEl?.remove();
    view.loadingEl = null;
    view.inputEl.focus();
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (isWaitingReply) return;

  const text = cleanMessage(view.inputEl.value);
  if (!text) return;

  conversationHistory.push({ role: 'user', text });
  addMessage('user', text);

  view.inputEl.value = '';
  setWaiting(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });

    // Si el servidor devuelve HTML en vez de JSON, la función /api/chat no se está ejecutando
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        `/api/chat respondió "${contentType || 'sin tipo'}" (estado ${response.status}) en vez de JSON. ¿Está corriendo el backend?`
      );
    }

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(
        errorPayload?.error || `Error en la red: ${response.status}`
      );
    }

    const { reply } = await response.json();

    // La respuesta se guarda siempre, aunque el usuario haya cambiado de vista;
    // al volver al chat se pintará desde el historial
    conversationHistory.push({ role: 'homer', text: reply });
    addMessage('homer', reply);
  } catch (error) {
    console.error('Error al conectar con la API:', error);

    // Se saca el mensaje fallido del historial para no enviar dos mensajes
    // seguidos del usuario, y se devuelve el texto al campo para reintentar
    if (conversationHistory.at(-1)?.role === 'user') {
      conversationHistory.pop();
    }
    view.inputEl.value = text;

    addMessage('homer', `Error: ${error.message}`);
  } finally {
    setWaiting(false);
  }
}

export function renderChat() {
  const app = document.querySelector('#app');

  app.innerHTML = `
    <div class="chatApp">
      <header class="chatHeader">
        <h2 class="chatTitle">HOMERO</h2>
        <p class="chatSubtitle">En Línea</p>
        <img class="card__avatar" src="/img/avatarhome.jfif" alt="Avatar de Homero">
      </header>

      <main class="chatMessages" aria-label="Mensajes">
        <div class="message message--character">Hola, ¿en qué te ayudo?</div>
      </main>

      <form class="chatComposer">
        <input class="chatInput" type="text" placeholder="Escribe un mensaje…" aria-label="Escribe tu mensaje" autocomplete="off" maxlength="${MAX_CHARS}">
        <button class="chatSend" type="submit">Enviar</button>
      </form>
    </div>
  `;

  // Los elementos se buscan después de pintar el HTML, porque no existen antes
  view = {
    messagesEl: app.querySelector('.chatMessages'),
    inputEl: app.querySelector('.chatInput'),
    sendBtn: app.querySelector('.chatSend'),
    loadingEl: null
  };

  // Se repinta la conversación guardada (el saludo inicial es solo visual:
  // no está en el historial porque Gemini debe empezar con un mensaje del usuario)
  for (const message of conversationHistory) {
    addMessage(message.role, message.text);
  }

  // Si el usuario salió mientras se esperaba la respuesta, se vuelve a mostrar el "Escribiendo…"
  if (isWaitingReply) setWaiting(true);

  app.querySelector('.chatComposer').addEventListener('submit', handleSubmit);
}