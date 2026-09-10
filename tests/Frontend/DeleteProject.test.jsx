import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteProject from '../../resources/js/components/DeleteProject';
import { api, refreshCsrf } from '../../resources/js/api';
vi.mock('../../resources/js/api', () => ({ api: vi.fn(), refreshCsrf: vi.fn() }));
beforeEach(() => { vi.clearAllMocks(); refreshCsrf.mockResolvedValue(); });
it('cancel closes without deleting', async () => {
    const close = vi.fn();
    render(<DeleteProject project={{ id: 9, project_name: 'Keep me' }} onClose={close} onDeleted={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(close).toHaveBeenCalledOnce();
    expect(api).not.toHaveBeenCalled();
});
it('confirmed delete calls the correct endpoint and success callback', async () => {
    api.mockResolvedValue(null);
    const deleted = vi.fn();
    render(<DeleteProject project={{ id: 9, project_name: 'Remove me' }} onClose={vi.fn()} onDeleted={deleted} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete project' }));
    expect(api).toHaveBeenCalledWith('/projects/9', { method: 'DELETE' });
    expect(deleted).toHaveBeenCalledOnce();
});
it('failed deletion keeps the dialog visible with an error', async () => {
    api.mockRejectedValue(new Error('Please try again.'));
    const deleted = vi.fn();
    render(<DeleteProject project={{ id: 9, project_name: 'Keep me' }} onClose={vi.fn()} onDeleted={deleted} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete project' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Please try again.');
    expect(deleted).not.toHaveBeenCalled();
});

