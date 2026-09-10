import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
const configuration = document.createElement('script');
configuration.id = 'project-config';
configuration.type = 'application/json';
configuration.textContent = JSON.stringify({
    statuses: ['Planning', 'In Progress', 'On Hold', 'Completed'],
    priorities: ['Low', 'Medium', 'High'], pageSize: 25, nameMaxLength: 255,
    descriptionMaxLength: 5000, searchMaxLength: 255, minPasswordLength: 12,
});
document.head.append(configuration);
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
afterEach(() => { cleanup(); });

