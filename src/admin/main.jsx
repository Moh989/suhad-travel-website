import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './AdminApp.jsx';
import '../styles/tokens.css';
import './admin.css';

// اللوحة بنمط فاتح دائماً (الشعار ومعاينات الصور تُرى كما في الموقع النهاري).
document.documentElement.dataset.theme = 'light';

createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
);
