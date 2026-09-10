import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AuthPage from './components/AuthPage';
import { api } from './api';
import '../css/app.css';
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => { api('/auth/user').then(data => setUser(data.user)).catch(() => {}).finally(() => setLoading(false)); }, []);
    function authenticated(value) { setUser(value); window.history.replaceState({}, '', '/dashboard'); }
    if (loading) return <main className="loading" role="status">Loading your workspace…</main>;
    if (!user) return <AuthPage onAuthenticated={authenticated} />;
    return <main className="base"><h1>Welcome, {user.name}</h1><button className="button" onClick={async () => { await api('/auth/logout', { method: 'POST' }); setUser(null); }}>Sign out</button></main>;
}
createRoot(document.getElementById('app')).render(<React.StrictMode><App /></React.StrictMode>);

