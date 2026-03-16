import { useState, useEffect } from 'react';
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage';
import Loading from './components/Loading';
import { authService } from './services/api';
import Bottum from "./components/Bottum"




function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    handleOAuthCallback();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.checkAuth();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      setIsAuthenticating(true);
      try {
        await authService.handleCallback(code);
        setIsAuthenticated(true);
        window.history.replaceState({}, document.title, '/');
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  const handleLogin = () => {
    try {
      authService.login();
    } catch (error) {
      console.error("Error initiating login:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading || isAuthenticating) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} loading={isAuthenticating} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Main Content */}
      <div className="flex-grow">
        <DashboardPage onLogout={handleLogout} />
      </div>

      {/* Footer */
        <Bottum/>
      }
      

    </div>
  );
}

export default App;