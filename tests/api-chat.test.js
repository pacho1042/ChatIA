
/*
 * Importamos las funciones de Vitest que necesitamos para crear y ejecutar
 * las pruebas.
 *
 * describe: agrupa pruebas relacionadas.
 * it: define una prueba individual.
 * expect: permite comprobar si un resultado es el esperado.
 * vi: permite crear simulaciones (mocks) y reemplazar funciones reales.
 * beforeEach: ejecuta una preparación antes de cada prueba.
 * afterEach: limpia las simulaciones después de cada prueba.
 */
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';

// Importamos la función principal del endpoint que queremos probar.
import handler from '../api/chat.js';

/*
 * Agrupamos las pruebas correspondientes al backend del chat de Homero.
 * Estas pruebas ejecutan el handler directamente, sin levantar un servidor.
 */
describe('Backend del chat de Homero (/api/chat)', () => {

  // Representa la solicitud que recibe el backend.
  let req;

  // Representa la respuesta que el backend devuelve al cliente.
  let res;

  // Guarda el código HTTP devuelto, por ejemplo 200, 400 o 500.
  let responseStatus;

  // Guarda el contenido JSON de la respuesta.
  let responseData;

  // Guarda las cabeceras HTTP que configura el backend.
  let headers;

  /*
   * Esta preparación se ejecuta antes de cada prueba.
   * Así, cada prueba comienza con una solicitud y una respuesta nuevas.
   */
  beforeEach(() => {

    // Reiniciamos las variables que almacenan la respuesta.
    responseStatus = null;
    responseData = null;
    headers = {};

    // Simulamos una solicitud POST con un mensaje válido del usuario.
    req = {
      method: 'POST',
      body: {
        messages: [
          { role: 'user', text: 'Hola Homero' }
        ]
      }
    };

    /*
     * Simulamos el objeto de respuesta de Vercel.
     * vi.fn() crea funciones simuladas para comprobar cómo se utilizan.
     */
    res = {

      // Simula la configuración de una cabecera HTTP.
      setHeader: vi.fn((name, value) => {
        headers[name] = value;
      }),

      // Simula el envío de un código de estado HTTP.
      status: vi.fn((status) => {
        responseStatus = status;

        // Devolvemos res para permitir encadenar .status().json().
        return res;
      }),

      // Simula el envío de una respuesta JSON al cliente.
      json: vi.fn((data) => {
        responseData = data;
        return res;
      })
    };

    /*
     * Configuramos una clave ficticia para Gemini.
     * No utilizamos una clave real ni consumimos la API.
     */
    vi.stubEnv('GEMINI_API_KEY', 'clave-de-prueba');

    /*
     * Reemplazamos fetch por una función simulada.
     * Esto evita realizar solicitudes reales a la API de Gemini.
     */
    vi.stubGlobal('fetch', vi.fn());

    // Evitamos que los errores esperados llenen la consola durante las pruebas.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  /*
   * Esta limpieza se ejecuta después de cada prueba.
   * Restaura las variables de entorno y las funciones simuladas.
   */
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  /*
   * PRUEBA 1:
   * Verifica que el backend rechace solicitudes que no utilicen POST.
   */
  it('1. debería rechazar solicitudes que no sean POST', async () => {

    // Cambiamos el método de la solicitud a GET.
    req.method = 'GET';

    // Ejecutamos el endpoint con la solicitud simulada.
    await handler(req, res);

    // Comprobamos que el backend responda con el estado 405.
    expect(responseStatus).toBe(405);

    // Comprobamos el mensaje de error devuelto.
    expect(responseData).toEqual({
      error: 'Método no permitido. Utiliza POST.'
    });

    // Verificamos que el backend indique que solo acepta POST.
    expect(headers.Allow).toBe('POST');

    // Verificamos que no se intente llamar a Gemini.
    expect(fetch).not.toHaveBeenCalled();
  });

  /*
   * PRUEBA 2:
   * Verifica que el backend rechace un historial con mensajes inválidos.
   */
  it('2. debería rechazar un historial con mensajes inválidos', async () => {

    // Reemplazamos el mensaje válido por uno cuyo texto está vacío.
    req.body.messages = [
      { role: 'user', text: '' }
    ];

    // Ejecutamos el endpoint con el historial inválido.
    await handler(req, res);

    // El backend debe responder con el estado 400 (solicitud incorrecta).
    expect(responseStatus).toBe(400);

    // Comprobamos el mensaje de validación esperado.
    expect(responseData).toEqual({
      error: 'Uno de los mensajes tiene un formato inválido.'
    });

    // La validación debe detener el proceso antes de llamar a Gemini.
    expect(fetch).not.toHaveBeenCalled();
  });

  /*
   * PRUEBA 3:
   * Simula una respuesta exitosa de Gemini y verifica que el backend
   * transforme esa respuesta al formato JSON esperado por el frontend.
   */
  it('3. debería devolver la respuesta de Gemini correctamente', async () => {

    /*
     * Configuramos fetch para simular una respuesta HTTP exitosa.
     * La estructura del JSON imita el formato esperado de Gemini.
     */
    fetch.mockResolvedValue({
      ok: true,
      status: 200,

      // Simulamos el método json() de la respuesta HTTP.
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                { text: '¡D’oh! Hola, amigo.' }
              ]
            }
          }
        ]
      })
    });

    // Ejecutamos el backend con el mensaje válido inicial.
    await handler(req, res);

    // Comprobamos que el backend responda con estado 200.
    expect(responseStatus).toBe(200);

    // Verificamos que el texto de Gemini llegue en la propiedad reply.
    expect(responseData).toEqual({
      reply: '¡D’oh! Hola, amigo.'
    });

    // Comprobamos que solo se haya llamado a Gemini una vez.
    expect(fetch).toHaveBeenCalledOnce();

    /*
     * Recuperamos los argumentos de la primera llamada a fetch:
     * url: dirección de la API de Gemini.
     * options: método, cabeceras y cuerpo de la solicitud.
     */
    const [url, options] = fetch.mock.calls[0];

    // Convertimos el cuerpo JSON enviado a Gemini en un objeto JavaScript.
    const body = JSON.parse(options.body);

    // Comprobamos que la URL corresponda al endpoint de generación.
    expect(url).toContain('generateContent');

    // Verificamos que la solicitud a Gemini utilice POST.
    expect(options.method).toBe('POST');

    // Comprobamos que se envíe la clave ficticia en la cabecera correcta.
    expect(options.headers['x-goog-api-key'])
      .toBe('clave-de-prueba');

    // Verificamos que el mensaje del usuario se convierta al formato de Gemini.
    expect(body.contents).toEqual([
      {
        role: 'user',
        parts: [{ text: 'Hola Homero' }]
      }
    ]);

    /*
     * Comprobamos que también se envíen las instrucciones del personaje.
     * toBeTruthy() verifica que el texto de instrucciones exista y no esté vacío.
     */
    expect(body.system_instruction.parts[0].text)
      .toBeTruthy();
  });

  /*
   * PRUEBA 4:
   * Verifica qué ocurre cuando todos los modelos configurados de Gemini
   * responden con un error temporal 503.
   */
  it('4. debería devolver error 503 si Gemini falla con todos los modelos', async () => {

    /*
     * Simulamos que Gemini devuelve un error de servicio no disponible.
     * El backend debe intentar el siguiente modelo de respaldo.
     */
    fetch.mockResolvedValue({
      ok: false,
      status: 503,

      // Simulamos el cuerpo JSON de error de Gemini.
      json: async () => ({
        error: {
          message: 'Servicio temporalmente no disponible'
        }
      })
    });

    // Ejecutamos el endpoint.
    await handler(req, res);

    // Comprobamos que el backend devuelva el estado 503.
    expect(responseStatus).toBe(503);

    // Verificamos que se muestre un mensaje genérico al usuario.
    // No se exponen los detalles internos de Gemini.
    expect(responseData).toEqual({
      error: '¡D’oh! No pude responder ahora. Inténtalo de nuevo.'
    });

    /*
     * El backend tiene tres modelos configurados.
     * Como todos responden con 503, debe intentar los tres.
     */
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
