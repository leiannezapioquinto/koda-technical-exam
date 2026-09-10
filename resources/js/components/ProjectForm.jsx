import { useState } from 'react';
import { api, refreshCsrf } from '../api';
import config, { STATUS, PRIORITY } from '../projectConfig';
import { validateProject } from '../projectUtils';
import Modal from './Modal';
export default function ProjectForm({ project, onClose, onSaved }) {
    const [values, setValues] = useState(project || { client_name: '', project_name: '', description: '', status: STATUS.planning, priority: PRIORITY.medium, start_date: '', due_date: '' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    function change(event) { setValues(previous => ({ ...previous, [event.target.name]: event.target.value })); setErrors(previous => ({ ...previous, [event.target.name]: undefined })); }
    async function submit(event) {
        event.preventDefault();
        const validation = validateProject(values);
        setErrors(validation);
        if (Object.keys(validation).length) return;
        setBusy(true); setMessage('');
        try {
            await refreshCsrf();
            await api(project ? '/projects/' + project.id : '/projects', { method: project ? 'PUT' : 'POST', body: values });
            onSaved(project ? 'Project updated.' : 'Project created.');
        } catch (error) { setErrors(error.errors || {}); setMessage(error.message); }
        finally { setBusy(false); }
    }
    function field(name, label, type = 'text') {
        return <label className="field"><span>{label} <span className="required">*</span></span><input autoFocus={name === 'client_name'} type={type} name={name} value={values[name]} onChange={change} maxLength={type === 'text' ? config.nameMaxLength : undefined} min={name === 'due_date' ? values.start_date : undefined} required aria-invalid={!!errors[name]} aria-describedby={errors[name] ? name + '-error' : undefined} />{errors[name] && <small className="field-error" id={name + '-error'}>{errors[name][0]}</small>}</label>;
    }
    return <Modal title={project ? 'Edit project' : 'Create a project'} subtitle={project ? 'Keep your project details up to date.' : 'A new project starts here.'} onClose={onClose} busy={busy}>
        <form onSubmit={submit} noValidate>
            <fieldset disabled={busy} className="form-fields">
                {message && <div className="alert" role="alert">{message}</div>}
                <div className="form-grid">{field('client_name', 'Client name')}{field('project_name', 'Project name')}</div>
                <label className="field"><span>Description <span className="optional">(optional)</span></span><textarea name="description" value={values.description || ''} onChange={change} maxLength={config.descriptionMaxLength} placeholder="What is this project about?" aria-invalid={!!errors.description} />{errors.description && <small className="field-error">{errors.description[0]}</small>}</label>
                <div className="form-grid">{[['status', 'Status', config.statuses], ['priority', 'Priority', config.priorities]].map(([name, label, options]) => <label className="field" key={name}><span>{label} <span className="required">*</span></span><select name={name} value={values[name]} onChange={change} aria-invalid={!!errors[name]}>{options.map(value => <option key={value}>{value}</option>)}</select>{errors[name] && <small className="field-error">{errors[name][0]}</small>}</label>)}</div>
                <div className="form-grid">{field('start_date', 'Start date', 'date')}{field('due_date', 'Due date', 'date')}</div>
            </fieldset>
            <footer className="modal-footer"><span className="muted required-note">* Required fields</span><button type="button" className="button" onClick={onClose} disabled={busy}>Cancel</button><button className="button primary" disabled={busy}>{busy ? 'Saving…' : project ? 'Save changes' : 'Create project'}</button></footer>
        </form>
    </Modal>;
}

