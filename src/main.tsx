import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Import your new providers
import { AuthProvider } from './context/AuthContext.tsx';
import { FinanceProvider } from './context/FinanceContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Wrap the App component so the whole app can access the contexts */}
    <AuthProvider>
      <FinanceProvider>
        <App />
      </FinanceProvider>
    </AuthProvider>
  </StrictMode>
);