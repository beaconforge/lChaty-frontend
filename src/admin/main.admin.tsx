import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminApp } from './App';
import './tokens.css';
import './theme.css';

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { enableMocks } = await import('./api/mocks');
    enableMocks();
  }

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
