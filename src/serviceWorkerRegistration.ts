export function register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
  
        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log('✅ Service Worker 등록 성공:', registration);
          })
          .catch((error) => {
            console.error('🚫 Service Worker 등록 실패:', error);
          });
      });
    }
}
  
export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.unregister();
      });
    }
}
  
  