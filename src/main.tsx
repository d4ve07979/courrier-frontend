import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./index.css";

// Capturer les erreurs globales
window.addEventListener('error', (event) => {
  console.error('❌ Erreur globale:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejetée:', event.reason);
});

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('❌ Erreur lors du rendu:', error);
  // Afficher une erreur basique
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Erreur de chargement</h1>
      <p>L'application n'a pas pu se charger. Vérifiez la console pour plus de détails.</p>
      <p>Erreur: ${error}</p>
    </div>
  `;
}