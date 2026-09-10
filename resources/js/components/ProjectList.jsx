import { useEffect, useRef, useState } from 'react';
import { Plus, Search, SlidersHorizontal, FolderKanban, ChevronLeft, ChevronRight, X, Check, LoaderCircle } from 'lucide-react';
import { api } from '../api';
import config, { DEFAULT_FILTERS } from '../projectConfig';
import SummaryCards from './SummaryCards';
import ProjectForm from './ProjectForm';
import ProjectTable from './ProjectTable';
import DeleteProject from './DeleteProject';
export default function ProjectList() {
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [search, setSearch] = useState('');
    const [result, setResult] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [editor, setEditor] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [opening, setOpening] = useState(false);
    const requestSequence = useRef(0);
    useEffect(() => {
        const timeout = setTimeout(() => setFilters(previous => previous.search === search ? previous : { ...previous, search, page: 1 }), 300);
        return () => clearTimeout(timeout);
    }, [search]);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setError('');
        const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== ''));
        Promise.all([api('/projects?' + params, { signal: controller.signal }), api('/dashboard/summary', { signal: controller.signal })])
            .then(([projects, totals]) => {
                if (controller.signal.aborted) return;
                if (projects.meta.current_page > projects.meta.last_page) { setFilters(previous => ({ ...previous, page: projects.meta.last_page })); return; }
                setResult(projects); setSummary(totals);
            }).catch(error => { if (!controller.signal.aborted) setError(error.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [filters, refresh]);
    useEffect(() => { if (!notice) return; const timeout = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timeout); }, [notice]);
    function filter(name, value) { setFilters(previous => ({ ...previous, [name]: value, page: 1 })); }
    function reset() { setSearch(''); setFilters(DEFAULT_FILTERS); }
    async function edit(project) {
        const sequence = ++requestSequence.current;
        setOpening(true); setError('');
        try {
            const data = await api('/projects/' + project.id);
            if (sequence === requestSequence.current) setEditor(data.data);
        } catch (error) { setError(error.message); }
        finally { if (sequence === requestSequence.current) setOpening(false); }
    }
    const filtered = !!(filters.search || filters.status || filters.priority);
    return <>
        <div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Project overview</h1><p className="muted">Keep your client work moving forward.</p></div><button className="button primary" onClick={() => setEditor({})}><Plus size={18} />New project</button></div>
        <SummaryCards summary={summary} />
        <section className="panel project-panel" aria-label="Projects">
            <div className="panel-heading"><div><h2>All projects <span className="count">{result?.meta.total ?? '—'}</span></h2><p>Every project. One clear view.</p></div><span className="list-label"><FolderKanban size={16} />Project list</span></div>
            <div className="toolbar">
                <label className="search-box"><Search size={17} /><span className="sr-only">Search projects</span><input type="search" placeholder="Search projects or clients…" value={search} onChange={event => setSearch(event.target.value)} maxLength={config.searchMaxLength} /></label>
                <div className="filter-controls"><SlidersHorizontal className="filter-icon" size={16} /><label><span className="sr-only">Filter by status</span><select value={filters.status} onChange={event => filter('status', event.target.value)}><option value="">All statuses</option>{config.statuses.map(value => <option key={value}>{value}</option>)}</select></label><label><span className="sr-only">Filter by priority</span><select value={filters.priority} onChange={event => filter('priority', event.target.value)}><option value="">All priorities</option>{config.priorities.map(value => <option key={value}>{value}</option>)}</select></label>
                <label><span className="sr-only">Sort projects</span><select value={filters.sort + ':' + filters.direction} onChange={event => { const [sort, direction] = event.target.value.split(':'); setFilters(previous => ({ ...previous, sort, direction, page: 1 })); }}>
                    <option value="created_at:desc">Newest first</option><option value="created_at:asc">Oldest first</option><option value="project_name:asc">Project A–Z</option><option value="project_name:desc">Project Z–A</option><option value="client_name:asc">Client A–Z</option><option value="client_name:desc">Client Z–A</option><option value="due_date:asc">Due date: earliest</option><option value="due_date:desc">Due date: latest</option><option value="start_date:asc">Start date: earliest</option><option value="start_date:desc">Start date: latest</option><option value="priority:desc">Priority: high first</option><option value="priority:asc">Priority: low first</option><option value="status:asc">Status A–Z</option><option value="status:desc">Status Z–A</option>
                </select></label></div>
            </div>
            {filtered && <div className="active-filters"><span>Filtered results</span><button className="text-button" onClick={reset}>Clear filters<X size={13} /></button></div>}
            {error ? <div className="list-error" role="alert"><p>{error}</p><button className="button" onClick={() => setRefresh(value => value + 1)}>Try again</button></div> :
            loading ? <div className="list-loading" role="status"><LoaderCircle size={22} className="spin" />Loading projects…</div> :
            !result?.data.length ? <div className="empty-state"><FolderKanban size={40} /><h2>{filtered ? 'No matching projects' : 'Your next project starts here'}</h2><p className="muted">{filtered ? 'Try another search or clear your filters.' : 'Add your first client project to get started.'}</p><button className="button" onClick={filtered ? reset : () => setEditor({})}>{filtered ? 'Clear filters' : 'Create project'}</button></div> :
            <ProjectTable projects={result.data} filters={filters} onSort={sort => setFilters(previous => ({ ...previous, sort, direction: previous.sort === sort && previous.direction === 'asc' ? 'desc' : 'asc', page: 1 }))} onEdit={edit} onDelete={setDeleting} busy={opening} />}
            <div className="pagination"><span>{result && !loading && !error ? result.meta.total ? 'Showing ' + result.meta.from + '–' + result.meta.to + ' of ' + result.meta.total + ' projects' : '0 projects' : ' '}</span><div><span className="page-size">{config.pageSize} per page</span><button className="button page-button" aria-label="Previous page" disabled={loading || !result || filters.page <= 1} onClick={() => filterPage(filters.page - 1)}><ChevronLeft size={16} /></button><span className="page-number">{filters.page} <span className="muted">/ {result?.meta.last_page || 1}</span></span><button className="button page-button" aria-label="Next page" disabled={loading || !result || filters.page >= result.meta.last_page} onClick={() => filterPage(filters.page + 1)}><ChevronRight size={16} /></button></div></div>
        </section>
        {opening && <div className="toast" role="status"><LoaderCircle size={16} className="spin" />Opening project…</div>}
        {notice && <div className="toast" role="status"><Check size={18} />{notice}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={16} /></button></div>}
        {editor && <ProjectForm project={editor.id ? editor : null} onClose={() => setEditor(null)} onSaved={message => { setEditor(null); setNotice(message); setRefresh(value => value + 1); }} />}
        {deleting && <DeleteProject project={deleting} onClose={() => setDeleting(null)} onDeleted={() => { setDeleting(null); setNotice('Project deleted.'); setRefresh(value => value + 1); }} />}
    </>;
    function filterPage(page) { setFilters(previous => ({ ...previous, page })); }
}


