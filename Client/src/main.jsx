import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

// Toast configuration
const toastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#1f2937',
    color: '#fff',
    borderRadius: '12px',
    padding: '12px 20px',
    fontSize: '14px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
  loading: {
    iconTheme: {
      primary: '#8b5cf6',
      secondary: '#fff',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster toastOptions={toastOptions} />
    </BrowserRouter>
  </React.StrictMode>
);