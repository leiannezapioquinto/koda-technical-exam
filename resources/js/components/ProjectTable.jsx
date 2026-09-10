import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '../projectUtils';
import { STATUS, PRIORITY } from '../projectConfig';
const statusStyles = { [STATUS.planning]: 'planning', [STATUS.inProgress]: 'progress', [STATUS.onHold]: 'hold', [STATUS.completed]: 'completed' };
const priorityStyles = { [PRIORITY.low]: 'low', [PRIORITY.medium]: 'medium', [PRIORITY.high]: 'high' };
export default function ProjectTable({ projects, filters, onSort, onEdit, onDelete, busy }) {
    function heading(label, field) {
        const active = filters.sort === field;
        const Icon = active ? filters.direction === 'asc' ? ArrowUp : ArrowDown : ArrowUpDown;
        return <th scope="col" aria-sort={active ? filters.direction === 'asc' ? 'ascending' : 'descending' : 'none'}><button className="sort-heading" onClick={() => onSort(field)}>{label}<Icon size={13} /></button></th>;
    }
    return <div className="table-scroll"><table className="project-table"><thead><tr>{heading('Project name', 'project_name')}{heading('Client', 'client_name')}{heading('Status', 'status')}{heading('Priority', 'priority')}{heading('Start date', 'start_date')}{heading('Due date', 'due_date')}<th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{projects.map((project, index) => <tr key={project.id}>
            <td><div className="project-cell"><span className={'project-avatar tone-' + index % 4}>{project.project_name.slice(0, 1).toUpperCase()}</span><div><button className="project-name" onClick={() => onEdit(project)} disabled={busy}>{project.project_name}</button><span className="project-id">PRJ-{String(project.id).padStart(3, '0')}</span></div></div></td>
            <td className="client-name" data-label="Client">{project.client_name}</td>
            <td data-label="Status"><span className={'badge ' + statusStyles[project.status]}><i />{project.status}</span></td>
            <td data-label="Priority"><span className={'priority ' + priorityStyles[project.priority]}><i /><i /><i /> <span>{project.priority}</span></span></td>
            <td className="date-cell" data-label="Start date">{formatDate(project.start_date)}</td><td className="date-cell" data-label="Due date">{formatDate(project.due_date)}</td>
            <td><div className="row-actions"><button className="icon-button" aria-label={'Edit ' + project.project_name} title="Edit project" disabled={busy} onClick={() => onEdit(project)}><Pencil size={16} /></button><button className="icon-button delete-action" aria-label={'Delete ' + project.project_name} title="Delete project" disabled={busy} onClick={() => onDelete(project)}><Trash2 size={16} /></button></div></td>
        </tr>)}</tbody></table></div>;
}

