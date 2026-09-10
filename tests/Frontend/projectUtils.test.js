import { it, expect } from 'vitest';
import { formatDate, validateProject } from '../../resources/js/projectUtils';
it('formats calendar dates without a UTC day shift', () => {
    expect(formatDate('2026-09-10')).toBe('Sep 10, 2026');
});
it('allows a same-day project', () => {
    expect(validateProject({ client_name: 'Acme', project_name: 'Website', start_date: '2026-09-10', due_date: '2026-09-10' })).toEqual({});
});

