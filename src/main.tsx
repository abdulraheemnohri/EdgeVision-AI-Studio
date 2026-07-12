import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { Toaster } from './components/ui/Toaster';
import App from './app/App';
import { initAIRuntime } from './ai';
import './index.css';

// Initialize LiteRT.js runtime when the app starts
const initializeRuntime = async () => {
  try {
    console.log('🚀 Initializing LiteRT.js runtime...');
    
    // Initialize with WASM files from public/wasm/ directory
    // These files are provided by @litertjs/core package
    await initAIRuntime('/wasm/', true);
    
    console.log('✅ LiteRT.js runtime initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize LiteRT.js runtime:', error);
    // Continue without runtime - user will see error messages in UI
  }
};

// Initialize the runtime before rendering the app
initializeRuntime().then(() => {
  // Render the app once runtime is initialized
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="edgevision-theme">
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
});

// Also render immediately to show loading state
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="edgevision-theme">
      <BrowserRouter>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Initializing AI Runtime...</p>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);