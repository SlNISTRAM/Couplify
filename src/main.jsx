import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for PWA with auto-update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado', registration);
        
        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Nueva versión encontrada, actualizando...');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed and ready
              console.log('✨ Nueva versión lista. Recargando...');
              
              // Tell the new service worker to skip waiting
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              
              // Reload the page to get the new version
              window.location.reload();
            }
          });
        });
      })
      .catch(err => console.error('❌ Error registrando SW', err));
    
    // Reload when the service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('🔄 Service Worker actualizado, recargando página...');
        window.location.reload();
      }
    });
  });
}
