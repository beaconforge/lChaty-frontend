import React from 'react';
import ReactDOM from 'react-dom/client';
import { UserApp } from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UserApp />
  </React.StrictMode>,
);
