import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/header.css';
import './styles/hero.css';
import './styles/about.css';
import './styles/services.css';
import './styles/destinations.css';
import './styles/cta.css';
import './styles/planner.css';
import './styles/footer.css';

async function start() {
  // أثناء التطوير فقط: يقرأ المحتوى المحفوظ من واجهة PHP (في النشر يحقنه index.php مباشرة).
  if (import.meta.env.DEV && !window.__SITE_CONTENT__) {
    try {
      const response = await fetch('api/content.php');
      if (response.ok) window.__SITE_CONTENT__ = await response.json();
    } catch {
      /* واجهة PHP غير مشغّلة: يُعرض المحتوى الافتراضي */
    }
  }
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

start();
