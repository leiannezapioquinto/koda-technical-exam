import { useState } from 'react';
import { LayoutDashboard, LogOut, Layers3, ChevronRight } from 'lucide-react';
import ProjectList from './ProjectList';
export default function Dashboard({ user, onSignOut }) { return <Workspace user={user} onSignOut={onSignOut}><ProjectList /></Workspace>; }
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

