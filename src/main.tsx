import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log("App initializing...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Failed to find root element");
} else {
  console.log("Root element found, rendering...");
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
