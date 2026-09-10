export function formatDate(value) {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value + 'T00:00:00'));
}
export function validateProject(values) {
    const errors = {};
    if (!values.client_name?.trim()) errors.client_name = ['Client name is required.'];
    if (!values.project_name?.trim()) errors.project_name = ['Project name is required.'];
    if (!values.start_date) errors.start_date = ['Start date is required.'];
    if (!values.due_date) errors.due_date = ['Due date is required.'];
    if (values.start_date && values.due_date && values.due_date < values.start_date) errors.due_date = ['The due date cannot be earlier than the start date.'];
    return errors;
}

