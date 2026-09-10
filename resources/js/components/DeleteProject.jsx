import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api, refreshCsrf } from '../api';
import Modal from './Modal';
export default function DeleteProject({ project, onClose, onDeleted }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    return <Modal title="Delete project?" onClose={onClose} busy={busy}>
        <div className="delete-body"><span className="delete-icon"><Trash2 size={25} /></span><p><strong>{project.project_name}</strong> will be permanently deleted.</p><p className="muted">This action cannot be undone.</p>{error && <div role="alert" className="alert">{error}</div>}</div>
        <footer className="modal-footer"><button className="button" autoFocus disabled={busy} onClick={onClose}>Cancel</button><button className="button danger" disabled={busy} onClick={async () => {
            setBusy(true); setError('');
            try { await refreshCsrf(); await api('/projects/' + project.id, { method: 'DELETE' }); onDeleted(); }
            catch (error) { setError(error.message); }
            finally { setBusy(false); }
        }}>{busy ? 'Deleting…' : 'Delete project'}</button></footer>
    </Modal>;
}

