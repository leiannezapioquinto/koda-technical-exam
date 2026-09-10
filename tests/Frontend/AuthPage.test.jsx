import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPage from '../../resources/js/components/AuthPage';
import { api, refreshCsrf } from '../../resources/js/api';
vi.mock('../../resources/js/api', () => ({ api: vi.fn(), refreshCsrf: vi.fn() }));
beforeEach(() => { vi.clearAllMocks(); refreshCsrf.mockResolvedValue(); });
it('signs in and forwards the authenticated user', async () => {
    const user = { id: 1, name: 'Alex' };
    api.mockResolvedValue({ user });
    const authenticated = vi.fn();
    render(<AuthPage onAuthenticated={authenticated} />);
    await userEvent.type(screen.getByLabelText('Email address'), 'alex@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'StrongPassword2026');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(authenticated).toHaveBeenCalledWith(user);
    expect(refreshCsrf).toHaveBeenCalledTimes(2);
});
it('shows a useful throttle message', async () => {
    api.mockRejectedValue({ status: 429, message: 'Too many attempts.' });
    render(<AuthPage onAuthenticated={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Email address'), 'alex@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'StrongPassword2026');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Please try again in a minute.');
});

