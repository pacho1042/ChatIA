export function renderNotFound() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <h1>404 - Página no encontrada</h1>
    <p>La ruta "${window.location.pathname}" no existe.</p>
    <p><a href="/">Volver al inicio</a></p>
  `;
}

