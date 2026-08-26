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
  if (typeof window !== 'undefined' && window.Storage) {
    const proto = Storage.prototype;
    const originalSetItem = proto.setItem;
    proto.setItem = function (key: string, value: string) {
      try {
        originalSetItem.apply(this, [key, value]);
      } catch (e) {
        console.warn("Storage.setItem quota limit exceeded:", e);
      }
    };
  }
} catch (e) {
  console.warn("Could not patch Storage.prototype.setItem:", e);
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
