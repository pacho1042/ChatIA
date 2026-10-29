import { router } from './router.js';
import { setupLinkInterception } from './navigation.js';

// Listener para Back/Forward
window.addEventListener('popstate', () => {
  router(); // Re-renderizar según nueva URL
});

// Configurar intercepción
setupLinkInterception();

// Render inicial (IMPORTANTE)
router();


