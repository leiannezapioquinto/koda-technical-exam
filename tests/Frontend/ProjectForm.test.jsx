import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectForm from '../../resources/js/components/ProjectForm';
import { api, refreshCsrf } from '../../resources/js/api';
vi.mock('../../resources/js/api', () => ({ api: vi.fn(), refreshCsrf: vi.fn() }));
const project = { id: 7, client_name: 'Acme', project_name: 'Website', description: '', status: 'Planning', priority: 'Medium', start_date: '2026-09-10', due_date: '2026-10-10' };
beforeEach(() => { vi.clearAllMocks(); refreshCsrf.mockResolvedValue(); });
describe('Project form', () => {
    it('shows required fields and does not send an empty project', async () => {
        render(<ProjectForm onClose={vi.fn()} onSaved={vi.fn()} />);
        await userEvent.click(screen.getByRole('button', { name: 'Create project' }));
        expect(screen.getByText('Client name is required.')).toBeVisible();
        expect(api).not.toHaveBeenCalled();
    });
    it('rejects an earlier due date before calling the API', async () => {
        render(<ProjectForm project={project} onClose={vi.fn()} onSaved={vi.fn()} />);
        fireEvent.change(screen.getByLabelText(/Due date/), { target: { value: '2026-09-01' } });
        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        expect(screen.getByText('The due date cannot be earlier than the start date.')).toBeVisible();
        expect(api).not.toHaveBeenCalled();
    });
    it('saves edits with PUT and closes through the success callback', async () => {
        api.mockResolvedValue({ data: project });
        const onSaved = vi.fn();
        render(<ProjectForm project={project} onClose={vi.fn()} onSaved={onSaved} />);
        await userEvent.clear(screen.getByLabelText(/Project name/));
        await userEvent.type(screen.getByLabelText(/Project name/), 'New website');
        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        await waitFor(() => expect(api).toHaveBeenCalledWith('/projects/7', expect.objectContaining({ method: 'PUT', body: expect.objectContaining({ project_name: 'New website' }) })));
        expect(onSaved).toHaveBeenCalledWith('Project updated.');
    });
    it('keeps input and shows server validation errors', async () => {
        api.mockRejectedValue({ message: 'Invalid project.', errors: { client_name: ['Client name is too long.'] } });
        render(<ProjectForm project={project} onClose={vi.fn()} onSaved={vi.fn()} />);
        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        expect(await screen.findByText('Client name is too long.')).toBeVisible();
        expect(screen.getByLabelText(/Client name/)).toHaveValue('Acme');
        expect(screen.getByRole('dialog')).toBeVisible();
    });
    it('disables repeated submissions while saving', async () => {
        let resolve;
        api.mockImplementation(() => new Promise(done => { resolve = done; }));
        render(<ProjectForm project={project} onClose={vi.fn()} onSaved={vi.fn()} />);
        await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled());
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        resolve({ data: project });
        await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
        expect(api).toHaveBeenCalledTimes(1);
    });
});

