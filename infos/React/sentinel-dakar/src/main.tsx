import { createRoot } from 'react-dom/client'
import "leaflet/dist/leaflet.css";
import App from './App.tsx'
import './index.css'

const rootEl = document.getElementById("root");
// Debug log pour vérifier le montage
console.log("[Debug] Root element present:", !!rootEl);
if (rootEl) {
  createRoot(rootEl).render(<App />);
} else {
  console.error("[Debug] #root introuvable dans index.html");
}
