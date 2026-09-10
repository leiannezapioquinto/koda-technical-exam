import { useEffect, useRef, useState } from 'react';
import { Building2, ChevronLeft, FolderKanban, LoaderCircle, Check, X } from 'lucide-react';
import { api } from '../api';
import { formatDate } from '../projectUtils';
import { CLIENTS_PATH, clientPath, currentClient } from '../navigation';
import ProjectTable from './ProjectTable';
import ProjectForm from './ProjectForm';
import DeleteProject from './DeleteProject';
export default function ClientList() {
    const [clients, setClients] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [selected, setSelected] = useState(currentClient);
    useEffect(() => {
        const navigated = () => setSelected(currentClient());
        window.addEventListener('popstate', navigated);
        return () => window.removeEventListener('popstate', navigated);
    }, []);
    function open(name) { window.history.pushState({}, '', clientPath(name)); setSelected(name); }
    function back() { window.history.pushState({}, '', CLIENTS_PATH); setSelected(null); setRefresh(value => value + 1); }
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setError('');
        api('/clients', { signal: controller.signal })
            .then(data => { if (!controller.signal.aborted) setClients(data.data); })
            .catch(error => { if (!controller.signal.aborted) setError(error.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [refresh]);
    if (selected) return <ClientProjects clientName={selected} onBack={back} />;
    return <>
        <div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Clients</h1></div></div>
        <section className="panel project-panel" aria-label="Clients">
            <div className="panel-heading"><div><h2>All clients <span className="count">{clients?.length ?? '—'}</span></h2></div><span className="list-label"><Building2 size={16} />Client list</span></div>
            {error ? <div className="list-error" role="alert"><p>{error}</p><button className="button" onClick={() => setRefresh(value => value + 1)}>Try again</button></div> :
            loading ? <div className="list-loading" role="status"><LoaderCircle size={22} className="spin" />Loading clients…</div> :
            !clients?.length ? <div className="empty-state"><Building2 size={40} /><h2>No clients yet</h2><p className="muted">Clients appear here once you add your first project.</p></div> :
            <div className="table-scroll"><table className="project-table"><thead><tr><th scope="col">Client</th><th scope="col">Projects</th><th scope="col">Last activity</th></tr></thead>
                <tbody>{clients.map((client, index) => <tr key={client.client_name}>
                    <td><div className="project-cell"><span className={'project-avatar tone-' + index % 4}>{client.client_name.slice(0, 1).toUpperCase()}</span><div><a className="project-name" href={clientPath(client.client_name)} onClick={event => { event.preventDefault(); open(client.client_name); }}>{client.client_name}</a></div></div></td>
                    <td data-label="Projects"><span className="count">{client.project_count}</span></td>
                    <td className="date-cell" data-label="Last activity">{client.last_activity_at ? formatDate(client.last_activity_at) : '—'}</td>
                </tr>)}</tbody></table></div>}
        </section>
    </>;
}
function ClientProjects({ clientName, onBack }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [editor, setEditor] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [opening, setOpening] = useState(false);
    const [sort, setSort] = useState({ sort: 'created_at', direction: 'desc' });
    const requestSequence = useRef(0);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setError('');
        const params = new URLSearchParams({ client: clientName, sort: sort.sort, direction: sort.direction });
        api('/projects?' + params, { signal: controller.signal })
            .then(data => { if (!controller.signal.aborted) setResult(data); })
            .catch(error => { if (!controller.signal.aborted) setError(error.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [clientName, sort, refresh]);
    useEffect(() => { if (!notice) return; const timeout = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timeout); }, [notice]);
    async function edit(project) {
        const sequence = ++requestSequence.current;
        setOpening(true); setError('');
        try {
            const data = await api('/projects/' + project.id);
            if (sequence === requestSequence.current) setEditor(data.data);
        } catch (error) { setError(error.message); }
        finally { if (sequence === requestSequence.current) setOpening(false); }
    }
    return <>
        <div className="page-heading"><div><a className="text-button" href={CLIENTS_PATH} onClick={event => { event.preventDefault(); onBack(); }}><ChevronLeft size={13} />All clients</a><h1>{clientName}</h1></div></div>
        <section className="panel project-panel" aria-label={'Projects for ' + clientName}>
            <div className="panel-heading"><div><h2>Projects <span className="count">{result?.meta.total ?? '—'}</span></h2></div><span className="list-label"><FolderKanban size={16} />Project list</span></div>
            {error ? <div className="list-error" role="alert"><p>{error}</p><button className="button" onClick={() => setRefresh(value => value + 1)}>Try again</button></div> :
            loading ? <div className="list-loading" role="status"><LoaderCircle size={22} className="spin" />Loading projects…</div> :
            !result?.data.length ? <div className="empty-state"><FolderKanban size={40} /><h2>No projects for this client</h2><p className="muted">This client has no projects left.</p><button className="button" onClick={onBack}>Back to clients</button></div> :
            <ProjectTable projects={result.data} filters={{ sort: sort.sort, direction: sort.direction }} onSort={field => setSort(previous => ({ sort: field, direction: previous.sort === field && previous.direction === 'asc' ? 'desc' : 'asc' }))} onEdit={edit} onDelete={setDeleting} busy={opening} />}
        </section>
        {opening && <div className="toast" role="status"><LoaderCircle size={16} className="spin" />Opening project…</div>}
        {notice && <div className="toast" role="status"><Check size={18} />{notice}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={16} /></button></div>}
        {editor && <ProjectForm project={editor.id ? editor : null} onClose={() => setEditor(null)} onSaved={message => { setEditor(null); setNotice(message); setRefresh(value => value + 1); }} />}
        {deleting && <DeleteProject project={deleting} onClose={() => setDeleting(null)} onDeleted={() => { setDeleting(null); setNotice('Project deleted.'); setRefresh(value => value + 1); }} />}
    </>;
}
