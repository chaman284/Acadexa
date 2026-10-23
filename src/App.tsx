import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { SplashScreen } from './components/ui/SplashScreen';

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [appVisible, setAppVisible] = useState(false);

  const handleSplashComplete = () => {
    setSplashDone(true);
    // Small delay before making app visible to allow DOM to paint first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAppVisible(true));
    });
  };

  return (
    <>
      {/* Splash renders on top — blocks everything until done */}
      {!splashDone && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* App only mounts after splash completes — no flash possible */}
      {splashDone && (
        <div
          style={{
            opacity: appVisible ? 1 : 0,
            transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </div>
      )}
    </>
  );
}

export default App;
