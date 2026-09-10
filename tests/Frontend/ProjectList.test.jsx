import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectList from '../../resources/js/components/ProjectList';
import { api } from '../../resources/js/api';
vi.mock('../../resources/js/api', () => ({ api: vi.fn(), refreshCsrf: vi.fn() }));
const empty = { data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 25, from: null, to: null } };
beforeEach(() => {
    vi.clearAllMocks();
    api.mockImplementation(path => Promise.resolve(path === '/dashboard/summary' ? { total: 0, in_progress: 0, completed: 0, on_hold: 0 } : empty));
});
it('loads a real empty state and opens the create modal', async () => {
    render(<ProjectList />);
    expect(await screen.findByText('Your next project starts here')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'New project' }));
    expect(screen.getByRole('dialog', { name: 'Create a project' })).toBeVisible();
});
it('combines search and filters in API requests and resets pagination', async () => {
    render(<ProjectList />);
    await screen.findByText('Your next project starts here');
    await userEvent.selectOptions(screen.getByLabelText('Filter by status'), 'Planning');
    await userEvent.selectOptions(screen.getByLabelText('Filter by priority'), 'High');
    await userEvent.type(screen.getByRole('searchbox'), 'Acme');
    await waitFor(() => expect(api).toHaveBeenCalledWith(expect.stringContaining('search=Acme&status=Planning&priority=High'), expect.anything()));
    expect(await screen.findByText('No matching projects')).toBeVisible();
});
it('shows a recoverable server error instead of an empty list', async () => {
    api.mockRejectedValueOnce(new Error('The server is unavailable.'));
    render(<ProjectList />);
    expect(await screen.findByRole('alert')).toHaveTextContent('The server is unavailable.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Your next project starts here')).toBeVisible();
});

