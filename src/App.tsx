import type { FC } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './auth/useAuth';
import { SplashScreen } from './components/SplashScreen';
import { useSplashScreen } from './hooks/useSplashScreen';
import "./index.css";

const App: FC = () => {
  const { showSplash, hideSplash } = useSplashScreen();

  return (
    <AuthProvider>
      {showSplash ? (
        <SplashScreen onComplete={hideSplash} />
      ) : (
        <AppRoutes />
      )}
    </AuthProvider>
  );
};

export default App;