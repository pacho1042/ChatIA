export function renderAbout() {
  const app = document.querySelector('#app');
  app.innerHTML = `<h1>Acerca Del Proyecto</h1>
                <p>Aplicación SPA construida con Vanilla JS conectada a la API de Google Gemini para interpretar el rol de Homero.</p>
                <div class="tecnologias">
                    <span>HTML5</span>
                    <span>CSS3</span>
                    <span>Vanilla JS</span>
                    <span>Serverless (Vercel)</span>
                    <span>Gemini AI</span> 
                </div>`;
          
}