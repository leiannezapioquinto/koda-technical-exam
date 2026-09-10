const config = JSON.parse(document.getElementById('project-config').textContent);
export default config;
export const STATUS = Object.fromEntries(config.statuses.map((value, index) => [['planning', 'inProgress', 'onHold', 'completed'][index], value]));
export const PRIORITY = Object.fromEntries(config.priorities.map((value, index) => [['low', 'medium', 'high'][index], value]));
export const DEFAULT_FILTERS = { search: '', status: '', priority: '', sort: 'created_at', direction: 'desc', page: 1 };

