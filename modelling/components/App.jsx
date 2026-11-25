import { useCallback, useEffect, useState } from 'react';
import AuthPage from './AuthPage';
import DiagramWorkspace from './DiagramWorkspace';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

export default function App() {
  const [authState, setAuthState] = useState('checking');
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [accountMessage, setAccountMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      setAuthState('checking');
      setAuthError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
        if (response.status === 401) {
          if (active) {
            setUser(null);
            setAuthState('signedOut');
          }
          return;
        }
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Could not restore your session.');
        if (active) {
          setUser(data.user);
          setAuthState('signedIn');
        }
      } catch {
        if (active) {
          setAuthError('The backend is unavailable. Start the backend and check its MongoDB connection, then retry.');
          setAuthState('unavailable');
        }
      }
    }
    restoreSession();
    return () => { active = false; };
  }, [retryCount]);

  const authenticate = useCallback(async (mode, credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${mode}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok || !data.success) return { success: false, error: data.error || 'Could not sign in.' };
      setUser(data.user);
      setAuthError('');
      setAccountMessage('');
      setAuthState('signedIn');
      return { success: true };
    } catch {
      return { success: false, error: 'The backend could not be reached. Check that it is running.' };
    }
  }, []);

  const logout = useCallback(async () => {
    setAccountMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('The server did not end the session. Please try again.');
      setUser(null);
      localStorage.removeItem('er-modeller:last-diagram-id');
      setAuthState('signedOut');
    } catch (error) {
      setAccountMessage(error.message || 'Could not log out.');
    }
  }, []);

  const handleUnauthorized = useCallback(() => {
    setUser(null);
    localStorage.removeItem('er-modeller:last-diagram-id');
    setAuthError('Your session expired. Log in again to continue.');
    setAuthState('signedOut');
  }, []);

  if (authState === 'checking') {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">Checking your session…</main>;
  }

  if (authState === 'signedIn' && user) {
    return <DiagramWorkspace user={user} onLogout={logout} onUnauthorized={handleUnauthorized} accountMessage={accountMessage} />;
  }

  return (
    <AuthPage
      onAuthenticate={authenticate}
      error={authError}
      onRetry={authState === 'unavailable' ? () => setRetryCount((count) => count + 1) : null}
    />
  );
}
