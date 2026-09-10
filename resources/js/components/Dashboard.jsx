import { useEffect, useState } from 'react';
import { LayoutDashboard, FolderKanban, LogOut, Layers3, Timer, CircleCheck, Pause, ChevronRight } from 'lucide-react';
import { api } from '../api';
export default function Dashboard({ user, onSignOut }) {
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => { api('/dashboard/summary').then(setSummary).catch(error => setError(error.message)); }, []);
    return <Workspace user={user} onSignOut={onSignOut}>
        <div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Project overview</h1><p className="muted">Keep your client work moving forward.</p></div></div>
        {error && <div role="alert" className="alert">{error}</div>}
        <SummaryCards summary={summary} />
        <section className="panel empty-state"><FolderKanban size={40} /><h2>A fresh start for your projects</h2><p className="muted">Your client projects will appear here.</p></section>
    </Workspace>;
}
export function Workspace({ user, onSignOut, children }) {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    return <div className="workspace">
        <aside className="sidebar"><a href="/dashboard" className="brand"><img src="/logo.svg" alt="" />Projexia<span className="brand-dot">.</span></a>
            <div className="workspace-label"><span className="workspace-avatar">P</span><div><strong>My workspace</strong><small>Project management</small></div></div>
            <span className="nav-label">WORKSPACE</span><a href="/dashboard" className="nav-item active"><LayoutDashboard size={19} />Overview<ChevronRight size={15} /></a>
            <div className="sidebar-bottom"><span className="tiny-logo"><Layers3 size={18} /></span><p>A clear view.<br /><strong>A better workflow.</strong></p><small>PROJEXIA WORKSPACE</small></div>
        </aside>
        <div className="workspace-main"><header className="topbar"><span className="breadcrumb">Workspace <ChevronRight size={14} /><strong>Overview</strong></span><div className="user-menu"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><span className="user-name">{user.name}</span><button className="icon-button" disabled={busy} title="Sign out" aria-label="Sign out" onClick={async () => { setBusy(true); try { await onSignOut(); } catch (error) { setError(error.message); } finally { setBusy(false); } }}><LogOut size={18} /></button></div></header>
        <main className="content">{error && <div className="alert" role="alert">{error}</div>}{children}</main><footer className="footer">Projexia <span>Clarity for every project.</span></footer></div>
    </div>;
}
export function SummaryCards({ summary }) {
    const cards = [['Total projects', 'total', Layers3, 'purple'], ['In progress', 'in_progress', Timer, 'blue'], ['Completed', 'completed', CircleCheck, 'green'], ['On hold', 'on_hold', Pause, 'amber']];
    return <section className="stats" aria-label="Project summary">{cards.map(([label, key, Icon, color]) => <div className="stat" key={key}><div><span>{label}</span><strong>{summary ? summary[key] : '—'}</strong></div><span className={'stat-icon ' + color}><Icon size={22} /></span></div>)}</section>;
}

