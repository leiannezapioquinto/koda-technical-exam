let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
export class ApiError extends Error {
    constructor(message, status, errors = {}) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}
export async function api(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken || '', ...options.headers },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) {
        if (response.status === 401 && !path.startsWith('/auth/')) {
            window.dispatchEvent(new Event('session-expired'));
        }
        throw new ApiError(data?.message || 'Something went wrong. Please try again.', response.status, data?.errors);
    }
    return data;
}
export async function refreshCsrf() {
    const data = await api('/auth/csrf');
    csrfToken = data.token;
}

