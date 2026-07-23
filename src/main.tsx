import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { UIProvider } from './context/UIContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { ProductProvider } from './context/ProductContext.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';
import './index.css';

// Prevent QuotaExceededError from crashing the app due to local storage limits or private browsing
try {
  const originalSetItem = window.localStorage.setItem;
  window.localStorage.setItem = function (key, value) {
    try {
      originalSetItem.call(window.localStorage, key, value);
    } catch (e) {
      console.warn("localStorage.setItem failed silently (quota/private browsing limit):", e);
    }
  };
} catch (e) {
  console.warn("Could not patch localStorage.setItem:", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <UIProvider>
                <App />
              </UIProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
);
