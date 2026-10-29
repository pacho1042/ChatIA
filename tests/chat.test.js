
/*
 * Importamos las funciones de Vitest que utilizaremos en las pruebas.
 *
 * describe: agrupa pruebas relacionadas.
 * it: define una prueba individual.
 * expect: comprueba si un resultado coincide con el esperado.
 * vi: permite crear funciones simuladas y controlar su comportamiento.
 * beforeEach: prepara el entorno antes de cada prueba.
 * afterEach: limpia las simulaciones al finalizar cada prueba.
 */
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';

// Importamos la función que dibuja el chat en el navegador.
import { renderChat } from '../src/views/chat.js';

/*
 * Agrupamos las cuatro pruebas del frontend del chat de Homero.
 * Utilizamos jsdom para simular el documento HTML sin abrir un navegador real.
 */
describe('Frontend del chat de Homero', () => {
  /*
   * Esta función se ejecuta antes de cada prueba.
   * Prepara el HTML y simula fetch para evitar llamadas reales a la API.
   */
  beforeEach(() => {

    // Creamos el contenedor donde renderChat() dibujará la interfaz.
    document.body.innerHTML = '<div id="app"></div>';

    /*
     * Simulamos fetch, que normalmente realiza solicitudes HTTP.
     * Así podemos controlar las respuestas del backend desde las pruebas.
     */
    vi.stubGlobal('fetch', vi.fn());
  });

  /*
   * Esta función se ejecuta después de cada prueba.
   * Restaura las funciones simuladas para evitar interferencias entre pruebas.
   */
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /*
   * PRUEBA 1:
   * Comprueba que el chat se dibuje correctamente y muestre
   * el saludo inicial, el título, el campo de texto y el botón de envío.
   */
  it('1. debería mostrar el saludo inicial y los elementos del chat', () => {

    // Ejecutamos la función que construye la interfaz.
    renderChat();

    // Verificamos que el título del chat sea HOMERO.
    expect(document.querySelector('.chatTitle').textContent)
      .toBe('HOMERO');

    // Comprobamos que el subtítulo indique que está en línea.
    expect(document.querySelector('.chatSubtitle').textContent)
      .toBe('En Línea');

    // Verificamos que exista el campo para escribir mensajes.
    expect(document.querySelector('.chatInput'))
      .not.toBeNull();

    // Comprobamos que el botón de envío muestre el texto esperado.
    expect(document.querySelector('.chatSend').textContent)
      .toBe('Enviar');

    // Verificamos que se muestre el saludo inicial de Homero.
    expect(document.querySelector('.chatMessages').textContent)
      .toContain('Hola, ¿en qué te ayudo?');
  });

  /*
   * PRUEBA 2:
   * Comprueba que el frontend envíe el mensaje al backend mediante POST
   * y que muestre en pantalla la respuesta recibida.
   */
  it('2. debería enviar el mensaje del usuario al backend', async () => {

    /*
     * Simulamos una respuesta exitosa del backend.
     * fetch devolverá una respuesta JSON con el texto de Homero.
     */
    fetch.mockResolvedValue({
      ok: true,
      status: 200,

      // Simulamos la cabecera que indica que la respuesta es JSON.
      headers: {
        get: () => 'application/json'
      },

      // Simulamos el contenido de la respuesta.
      json: async () => ({
        reply: '¡D’oh! Hola, amigo.'
      })
    });

    // Dibujamos el chat antes de interactuar con él.
    renderChat();

    // Obtenemos el campo donde el usuario escribe el mensaje.
    const input = document.querySelector('.chatInput');

    // Obtenemos el formulario que contiene el campo y el botón.
    const form = document.querySelector('.chatComposer');

    // Simulamos que el usuario escribe un mensaje.
    input.value = 'Hola Homero';

    /*
     * Simulamos el envío del formulario.
     * bubbles permite que el evento se propague por el DOM.
     * cancelable permite que handleSubmit() evite el envío tradicional.
     */
    form.dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    }));

    /*
     * Esperamos a que el frontend realice la solicitud.
     * La función de envío es asíncrona, por eso no comprobamos todo
     * inmediatamente después de disparar el evento.
     */
    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledOnce();
    });

    /*
     * Recuperamos los argumentos de la llamada a fetch:
     * url: dirección del endpoint.
     * options: método HTTP, cabeceras y cuerpo de la solicitud.
     */
    const [url, options] = fetch.mock.calls[0];

    // Verificamos que se utilice la ruta del backend.
    expect(url).toBe('/api/chat');

    // Comprobamos que la solicitud utilice el método POST.
    expect(options.method).toBe('POST');

    // Verificamos que el cuerpo se envíe como JSON.
    expect(options.headers['Content-Type'])
      .toBe('application/json');

    /*
     * Convertimos el cuerpo JSON en un objeto y verificamos
     * que contenga el mensaje escrito por el usuario.
     */
    expect(JSON.parse(options.body).messages[0]).toEqual({
      role: 'user',
      text: 'Hola Homero'
    });

    // Esperamos a que el frontend pinte la respuesta recibida.
    await vi.waitFor(() => {
      expect(document.querySelector('.chatMessages').textContent)
        .toContain('¡D’oh! Hola, amigo.');
    });
  });

  /*
   * PRUEBA 3:
   * Comprueba que no se envíe ninguna solicitud cuando el usuario
   * intenta enviar un mensaje vacío o compuesto únicamente por espacios.
   */
  it('3. debería ignorar el envío de un mensaje vacío', () => {

    // Dibujamos la interfaz del chat.
    renderChat();

    // Obtenemos el campo de texto y el formulario.
    const input = document.querySelector('.chatInput');
    const form = document.querySelector('.chatComposer');

    // Simulamos que el usuario escribe únicamente espacios.
    input.value = '   ';

    // Intentamos enviar el formulario.
    form.dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    }));

    /*
     * Si la validación funciona, handleSubmit() debe terminar
     * antes de llamar a fetch.
     */
    expect(fetch).not.toHaveBeenCalled();
  });

  /*
   * PRUEBA 4:
   * Comprueba que el frontend gestione un error del backend.
   * Debe mostrar el error, recuperar el mensaje escrito y habilitar
   * nuevamente el campo de texto.
   */
  it('4. debería mostrar un error y recuperar el mensaje si falla el backend', async () => {

    /*
     * Espiamos console.error para comprobar que se registre el error
     * sin llenar la consola durante la ejecución de las pruebas.
     */
    const errorSpy = vi.spyOn(console, 'error')
      .mockImplementation(() => {});

    // Simulamos una respuesta HTTP de error 500.
    fetch.mockResolvedValue({
      ok: false,
      status: 500,

      // El backend devuelve el error en formato JSON.
      headers: {
        get: () => 'application/json'
      },

      json: async () => ({
        error: 'Error interno del servidor'
      })
    });

    // Dibujamos el chat.
    renderChat();

    // Obtenemos el campo de texto y el formulario.
    const input = document.querySelector('.chatInput');
    const form = document.querySelector('.chatComposer');

    // Simulamos que el usuario escribe un mensaje.
    input.value = 'Hola Homero';

    // Simulamos el envío del mensaje.
    form.dispatchEvent(new Event('submit', {
      bubbles: true,
      cancelable: true
    }));

    /*
     * Esperamos a que finalice el manejo del error.
     * El frontend debe mostrar el error, recuperar el texto
     * original y habilitar nuevamente el campo.
     */
    await vi.waitFor(() => {

      // Comprobamos que el mensaje de error aparezca en el chat.
      expect(document.querySelector('.chatMessages').textContent)
        .toContain('Error: Error interno del servidor');

      // El texto original debe recuperarse para que el usuario reintente.
      expect(input.value).toBe('Hola Homero');

      // El campo debe volver a estar habilitado.
      expect(input.disabled).toBe(false);
    });

    // Verificamos que el frontend haya registrado el error en consola.
    expect(errorSpy).toHaveBeenCalled();
  });
});
