/**
 * PWA Service Worker registration utility.
 * Registra o SW apenas em produção (HTTPS ou localhost).
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            console.log('[PWA] Atualização disponível. Recarregue para aplicar.');
          }
        });
      });

      console.log('[PWA] Service Worker registrado:', registration.scope);
    } catch (err) {
      console.warn('[PWA] Falha ao registrar Service Worker:', err);
    }
  });
}
