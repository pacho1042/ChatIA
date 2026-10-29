import { navigateTo } from './router.js';

export function setupLinkInterception() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Filtros de exclusión
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const isNewTab = link.target === '_blank';
    const isExternal = link.origin !== window.location.origin;
    
    if (isModified || isNewTab || isExternal) return;
    if (!href.startsWith('/')) return; // Solo rutas absolutas

    event.preventDefault();
    navigateTo(href);
  });
}