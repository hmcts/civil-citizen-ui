import fs from 'fs';
import path from 'path';
import {JSDOM} from 'jsdom';

const directory = path.resolve('src/test/utils/mocks/a11y');

it.each([
  'mock-claim-task-list.html',
  'mock-case-1645882162449409-response-task-list.html',
  'mock-case-1645882162449409-claimant-response-task-list.html',
])('keeps captured task headings outside legends and empty fieldsets: %s', file => {
  const dom = new JSDOM(fs.readFileSync(path.join(directory, file), 'utf8'));
  try {
    const heading = dom.window.document.querySelector('h1')!;
    expect(heading.closest('legend, fieldset')).toBeNull();
    expect(heading.classList.contains('govuk-heading-l')).toBe(true);
    if (file === 'mock-case-1645882162449409-response-task-list.html') expect(heading.id).toBe('task-list-heading');
  } finally {dom.window.close();}
});
