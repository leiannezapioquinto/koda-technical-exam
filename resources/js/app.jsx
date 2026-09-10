import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { api } from './api';
import '../css/app.css';
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        api('/auth/user').then(data => setUser(data.user)).catch(error => { if (error.status !== 401) setError('Unable to load your workspace. Please refresh to try again.'); }).finally(() => setLoading(false));
        const expired = () => { setUser(null); window.history.replaceState({}, '', '/login'); };
        window.addEventListener('session-expired', expired);
        return () => window.removeEventListener('session-expired', expired);
    }, []);
    function authenticated(value) { setUser(value); window.history.replaceState({}, '', '/dashboard'); }
    async function signOut() { await api('/auth/logout', { method: 'POST' }); setUser(null); window.history.replaceState({}, '', '/login'); }
    if (loading) return <main className="loading" role="status">Loading your workspace…</main>;
    if (error) return <main className="loading" role="alert">{error}</main>;
    if (!user) return <AuthPage onAuthenticated={authenticated} />;
    return <Dashboard user={user} onSignOut={signOut} />;
}
createRoot(document.getElementById('app')).render(<React.StrictMode><App /></React.StrictMode>);

