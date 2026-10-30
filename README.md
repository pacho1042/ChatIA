# 💬 ChatIA — Chat con Homero Simpson 🍩

Aplicación web de chat en la que el usuario puede conversar con una versión ficticia de **Homero Simpson**. El proyecto separa la interfaz del frontend y el endpoint del backend, y utiliza la API de Gemini para generar las respuestas del personaje.

> 🚀 **Aplicación desplegada:**  https://chat-ia-steel.vercel.app/
>**Evidencia de SPA Desplegada**  https://acesse.one/sxx44ui
---

## 1. 🍩 Descripción del personaje elegido

**Homero Simpson** es un personaje ficticio de la serie animada *Los Simpson*. Es conocido por su humor, sus ocurrencias, su forma despreocupada de afrontar los problemas y expresiones características como «¡D'oh!».

En ChatIA se busca ofrecer una conversación entretenida inspirada en su personalidad. Las respuestas se generan mediante un modelo de inteligencia artificial al que el backend proporciona instrucciones de personaje. La aplicación es unicamente de caracter academico.

---

## 2. 🛠️ Tecnologías utilizadas

- 🎨 **HTML y CSS:** estructura y presentación visual de la aplicación.
- ⚡ **JavaScript:** lógica del frontend y organización modular del código.
- 📦 **Vite:** servidor de desarrollo ultra rápido para el frontend.
- ☁️ **Funciones de Vercel:** ejecución del endpoint Serverless del backend.
- 🤖 **Gemini API:** generación de respuestas de IA adaptadas al personaje.
- 🧪 **Vitest:** ejecución de pruebas unitarias y de integración automatizadas.
- 🌐 **jsdom:** simulación del entorno DOM para probar el frontend sin navegador.

---

## 3. 📂 Estructura del proyecto

El proyecto contiene estos archivos y carpetas:

```text
ChatIA/
├── .vercel/
├── api/
│   └── chat.js
├── css/
│   └── styles.css
├── img/
│   ├── avatarhome.jfif
│   └── homerob.jpg
├── src/
│   ├── views/
│   │   ├── about.js
│   │   ├── chat.js
│   │   ├── home.js
│   │   └── notFound.js
│   ├── main.js
│   ├── navigation.js
│   ├── router.js
│   └── utils.js
├── tests/
│   ├── api-chat.test.js
│   └── chat.test.js
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
|___vercel.json
└── vitest.config.js
```

### 📍 Descripción de módulos clave:
- `src/views/chat.js`: presenta la interfaz del chat, envía mensajes y muestra respuestas.
- `src/utils.js`: contiene utilidades y las instrucciones del personaje utilizadas por el backend.
- `api/chat.js`: valida las solicitudes, prepara el historial y se comunica con Gemini.
- `tests/chat.test.js`: contiene pruebas del frontend.
- `tests/api-chat.test.js`: contiene pruebas del endpoint del backend.
- `.env`: guarda variables de entorno locales. **No debe subirse al repositorio.**
- `.env.example`: sirve como plantilla de configuración, sin secretos reales.

---

## 4. 📋 Requisitos previos

1. 🟢 **Node.js** (preferiblemente versión LTS compatible con las dependencias).
2. 📦 **npm** (normalmente incluido con Node.js).
3. 🔑 Una clave de API de **Gemini**.
4. ☁️ Una cuenta en **Vercel** para ejecutar el proyecto con `vercel dev` y desplegarlo.
5. 🐙 **Git** para el control de versiones.

---

## 5. 🚀 Instalación y ejecución local

### Paso 1. Abrir la carpeta del proyecto 📁
Desde una terminal, ubícate en la raíz del proyecto donde está `package.json`:

```bash
cd ruta/a/ChatIA
```

### Paso 2. Instalar las dependencias 📥
```bash
npm install
```
Este comando instala las dependencias declaradas en `package.json`, incluidas Vite, Vitest y jsdom.

### Paso 3. Configurar las variables de entorno 🔑
Crea o revisa el archivo `.env` en la raíz del proyecto. Debe incluir la clave de Gemini:

```dotenv
GEMINI_API_KEY=PEGA_AQUI_TU_CLAVE_DE_GEMINI
```

Sustituye el texto de ejemplo por tu clave real. No incluyas comillas innecesarias ni espacios alrededor del signo `=`.

#### 🔒 Seguridad:
- 🚫 **No publiques** la clave de API en el frontend.
- 🚫 **No subas** `.env` al repositorio.
- 🛡️ Comprueba que `.env` esté incluido en `.gitignore`.
- ⚠️ Si una clave real se publica accidentalmente, revócala y genera otra de inmediato.
- 📄 `.env.example` debe contener solamente nombres de variables y valores de ejemplo, nunca secretos.

Ejemplo de `.env.example`:
```dotenv
GEMINI_API_KEY=tu_clave_de_gemini
```

### Paso 4. Instalar la CLI de Vercel ⚙️
Si todavía no tienes la CLI de Vercel:

```bash
npm install -g vercel
```

Después, inicia sesión:

```bash
vercel login
```

### Paso 5. Ejecutar el proyecto con Vercel 💻
Desde la raíz del proyecto:

```bash
vercel dev
```

Sigue las indicaciones de la CLI si solicita vincular el proyecto con Vercel. Abre en el navegador la dirección local que muestre la terminal, habitualmente `http://localhost:3000`.

> 💡 **Nota:** Se recomienda `vercel dev` porque el frontend utiliza la ruta `/api/chat` y el backend está definido como una función en `api/chat.js`. El script `dev` estándar de `package.json` solo ejecuta Vite y no garantiza la ejecución del backend.

---

## 6. 🧪 Ejecución de pruebas

El proyecto utiliza Vitest. Las pruebas simulan respuestas HTTP y no necesitan llamar realmente a Gemini.

### 🏃 Ejecutar todas las pruebas una sola vez
```bash
npm run test -- --run
```
O también:
```bash
npx vitest run
```

### 🖥️ Ejecutar solo las pruebas del frontend
```bash
npx vitest run tests/chat.test.js
```
**Estas pruebas verifican:**
- 🎨 El renderizado del título, el saludo y los controles del chat.
- 📤 El envío de mensajes al endpoint `/api/chat`.
- 🛑 La prevención del envío de mensajes vacíos.
- 🔄 El manejo de errores y la recuperación del mensaje escrito.

### ⚙️ Ejecutar solo las pruebas del backend
```bash
npx vitest run tests/api-chat.test.js
```
**Estas pruebas verifican:**
- 🚫 El rechazo de métodos HTTP no permitidos.
- 🔍 La validación de los mensajes recibidos.
- 🔄 La transformación de los mensajes al formato de Gemini.
- ✅ El procesamiento de una respuesta simulada de Gemini.
- 🛡️ El manejo de errores y los intentos con modelos de respaldo.

### ⚙️ Configuración de Vitest
El archivo `vitest.config.js` debe configurar el entorno de pruebas para utilizar jsdom y localizar los archivos `*.test.js`. Si una prueba falla, revisa las rutas de los imports, los nombres reales de los archivos y que las dependencias estén instaladas.

---

## 🐙 Repositorio en GitHub

El código fuente de **ChatIA — Chat con Homero Simpson** se puede consultar y gestionar desde GitHub.

🔗 **Enlace al repositorio:** `https://github.com/pacho1042/ChatIA.git`

### 📥 Clonar el proyecto desde GitHub
```bash
git clone https://github.com/pacho1042/ChatIA.git
cd REPOSITORIO
npm install
```

Después, crea el archivo `.env`, configura `GEMINI_API_KEY` y arranca el proyecto con:

```bash
vercel dev
```

### 📤 Publicar cambios en GitHub
Después de modificar y probar el proyecto, guarda los cambios con Git:

```bash
git add .
git commit -m "Describe los cambios realizados"
git push
```

⚠️ Antes de ejecutar `git add .`, confirma que `.env` esté excluido mediante `.gitignore`. **Nunca publiques la clave de Gemini en GitHub.**

---

## 7. 🌐 Despliegue en Vercel

### Paso 1. Subir el proyecto a un repositorio 📤
Guarda los cambios y sube el proyecto a un repositorio Git (GitHub/GitLab).

### Paso 2. Importar el repositorio en Vercel ☁️
1. Inicia sesión en [Vercel](https://vercel.com/).
2. Selecciona la opción para añadir un nuevo proyecto.
3. Importa el repositorio que contiene ChatIA.
4. Revisa la configuración detectada por Vercel y confirma el despliegue.

### Paso 3. Configurar la variable de entorno 🔑
En la configuración del proyecto de Vercel (*Settings > Environment Variables*), agrega:
- **Nombre:** `GEMINI_API_KEY`
- **Valor:** Tu clave real de Gemini.
- **Entornos:** Production, Preview y Development.

### Paso 4. Comprobar el despliegue ✅
Cuando Vercel termine, abre la URL asignada y verifica:
1. 🖥️ Que cargue la interfaz del chat.
2. 💬 Que se pueda enviar un mensaje.
3. 🔄 Que `/api/chat` responda correctamente.
4. 🔐 Que `GEMINI_API_KEY` esté configurada.
5. 📄 Que los registros de Vercel (*Logs*) no indiquen errores.

🌐 **URL pública:** `https://chat-ia-steel.vercel.app/`

---

## 8. 🤖 Registro del uso de Inteligencia Artificial en el proyecto

Los siguientes ejemplos documentan los prompts y usos de IA aplicados durante el desarrollo de ChatIA:

### 📄 Prompt 1. Diseñar el chat del personaje
- **Contexto:** Se está desarrollando una aplicación web llamada ChatIA para conversar con Homero Simpson.
- **Objetivo:** Definir una interfaz de chat sencilla y fácil de utilizar.
- **Instrucciones:** Proponer una estructura HTML y clases CSS para el encabezado, área de mensajes y formulario.
- **Resultado:** Estructura visual base implementada para la aplicación.

### 📄 Prompt 2. Crear el comportamiento del frontend
- **Contexto:** La interfaz está en JS y debe enviar mensajes desde un formulario.
- **Objetivo:** Programar el flujo de envío y visualización.
- **Instrucciones:** Implementar función de renderizado, listener del evento `submit` y petición `fetch` a `/api/chat`.
- **Resultado:** Lógica cliente-servidor funcional.

### 📄 Prompt 3. Mantener el historial de conversación
- **Contexto:** Homero necesita contexto para mantener conversaciones coherentes.
- **Objetivo:** Guardar el historial de mensajes durante la sesión.
- **Instrucciones:** Guardar mensajes en memoria y enviarlos en cada solicitud al backend.
- **Resultado:** Historial en memoria implementado.

### 📄 Prompt 4. Limpiar y validar la entrada del usuario
- **Contexto:** El usuario puede enviar datos erróneos o muy largos.
- **Objetivo:** Normalizar entradas y evitar peticiones innecesarias.
- **Instrucciones:** Crear función de limpieza (trim, saneamiento de control, límite a 500 caracteres).
- **Resultado:** Filtro previo al envío en el frontend.

### 📄 Prompt 5. Crear el endpoint del backend
- **Contexto:** Comunicación con Gemini sin exponer claves secretas.
- **Objetivo:** Crear el endpoint Serverless `/api/chat`.
- **Instrucciones:** Función en `api/chat.js` que procese POST y use `GEMINI_API_KEY`.
- **Resultado:** Endpoint seguro en Serverless Vercel.

### 📄 Prompt 6. Validar el historial recibido por el backend
- **Contexto:** Proteger el backend contra peticiones malformadas.
- **Objetivo:** Rechazar datos inválidos con código HTTP 400.
- **Instrucciones:** Validar roles alternados, tipo array y tamaño del texto.
- **Resultado:** Capa de validación robusta en backend.

### 📄 Prompt 7. Crear modelos de respaldo de Gemini
- **Contexto:** Prever indisponibilidad temporal de modelos de IA.
- **Objetivo:** Fallback automático entre modelos.
- **Instrucciones:** Probar secuencialmente una lista de modelos ante erroree.
- **Resultado:** Sistema de reintentos con modelos de reserva.

### 📄 Prompt 8. Crear pruebas automatizadas del frontend
- **Contexto:** Validar interfaz sin consumir cuota de API real.
- **Objetivo:** Cobertura de pruebas en cliente con Vitest.
- **Instrucciones:** Mocks con `jsdom` y `vi.fn()` para simular `fetch`.
- **Resultado:** Test runner configurado para `tests/chat.test.js`.

### 📄 Prompt 9. Crear pruebas automatizadas del backend
- **Contexto:** Validar lógica Serverless sin red real.
- **Objetivo:** Pruebas de integración del backend.
- **Instrucciones:** Mock de objetos `req` y `res`.
- **Resultado:** Test runner para `tests/api-chat.test.js`.

---

## 9. 🛡️ Consideraciones de seguridad y mantenimiento

- 🔒 Mantén la clave de Gemini exclusivamente en variables de entorno del backend.
- 🧹 Valida toda entrada que llegue al endpoint antes de procesarla.
- 🚫 No registres claves de API ni datos sensibles en los logs.
- 🔄 Verifica periódicamente la disponibilidad de los modelos de Gemini.
- 🧪 Ejecuta las pruebas automatizadas antes de realizar cada despliegue.

---
