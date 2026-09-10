export const CLIENTS_PATH = '/dashboard/clients';
/** Which workspace view the current URL points at. */
export function currentView() {
    return window.location.pathname.startsWith(CLIENTS_PATH) ? 'clients' : 'overview';
}
/** The client whose projects the current URL points at, or null for the client listing. */
export function currentClient() {
    return new URLSearchParams(window.location.search).get('client');
}
export function clientPath(name) {
    return CLIENTS_PATH + '?' + new URLSearchParams({ client: name });
}
