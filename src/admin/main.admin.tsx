import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminApp } from './App';
import './tokens.css';
import './theme.css';

async function bootstrap() {
  // Note: mocks removed — the app will always use the configured backend.

  const container = document.getElementById('admin-root');
  if (!container) {
    throw new Error('Admin root element not found');
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <AdminApp />
    </React.StrictMode>,
  );
}

bootstrap();
