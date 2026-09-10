import { useEffect, useState } from 'react';
import { LayoutDashboard, LogOut, Layers3, ChevronRight, Building2 } from 'lucide-react';
import ProjectList from './ProjectList';
import ClientList from './ClientList';
import { CLIENTS_PATH, currentView } from '../navigation';
export default function Dashboard({ user, onSignOut }) { return <Workspace user={user} onSignOut={onSignOut} />; }
export function Workspace({ user, onSignOut, children }) {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [view, setView] = useState(currentView);
    const views = [['overview', 'Overview', LayoutDashboard, '/dashboard'], ['clients', 'Clients', Building2, CLIENTS_PATH]];
    const label = views.find(([name]) => name === view)[1];
    useEffect(() => {
        const navigated = () => setView(currentView());
        window.addEventListener('popstate', navigated);
        return () => window.removeEventListener('popstate', navigated);
    }, []);
    function open(name, path) {
        if (window.location.pathname + window.location.search !== path) { window.history.pushState({}, '', path); }
        setView(name);
    }
    return <div className="workspace">
        <aside className="sidebar"><a href="/dashboard" className="brand"><img src="/logo.svg" alt="" />Projexia<span className="brand-dot">.</span></a>
            <span className="nav-label">WORKSPACE</span>
            {views.map(([name, text, Icon, path]) => <a key={name} href={path} className={'nav-item' + (view === name ? ' active' : '')} aria-current={view === name ? 'page' : undefined} onClick={event => { event.preventDefault(); open(name, path); }}><Icon size={19} />{text}<ChevronRight size={15} /></a>)}
            <div className="sidebar-bottom"><span className="tiny-logo"><Layers3 size={18} /></span><p>A clear view.<br /><strong>A better workflow.</strong></p><small>PROJEXIA WORKSPACE</small></div>
        </aside>
        <div className="workspace-main"><header className="topbar"><span className="breadcrumb">Workspace <ChevronRight size={14} /><strong>{label}</strong></span><div className="user-menu"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><span className="user-name">{user.name}</span><button className="icon-button" disabled={busy} title="Sign out" aria-label="Sign out" onClick={async () => { setBusy(true); try { await onSignOut(); } catch (error) { setError(error.message); } finally { setBusy(false); } }}><LogOut size={18} /></button></div></header>
        <main className="content">{error && <div className="alert" role="alert">{error}</div>}{children ?? (view === 'clients' ? <ClientList /> : <ProjectList />)}</main><footer className="footer">Projexia</footer></div>
    </div>;
}
