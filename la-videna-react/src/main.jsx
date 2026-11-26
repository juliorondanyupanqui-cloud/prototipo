import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ReservasProvider } from './context/ReservasContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ReservasProvider>
        <App />
      </ReservasProvider>
    </AuthProvider>
  </StrictMode>,
);
