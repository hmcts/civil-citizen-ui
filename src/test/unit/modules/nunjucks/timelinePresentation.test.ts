import {JSDOM} from 'jsdom';
import {GenericForm} from 'form/models/genericForm';
import {renderProductionPage} from '../../../utils/renderProductionPage';

const text = (element: Element) => element.textContent!.replace(/\s+/g, ' ').trim();

describe('PR7 timeline presentation', () => {
  it.each(['en', 'cy'])('renders ordered opponent timeline rows or a separate PDF fallback (%s)', language => {
    const view = 'features/response/timelineOfEvents/defendant-timeline.njk';
    const form = new GenericForm({rows: [], comment: 'Saved comment'});
    const rows = [
      {value: {timelineDate: '2024-01-01', timelineDescription: 'First <event>'}},
      {value: {timelineDate: '2024-02-02', timelineDescription: 'Second & last'}},
    ];
    for (const theirTimeline of [rows, []]) {
      const dom = new JSDOM(renderProductionPage(view, {form, theirTimeline, pdfUrl: '/timeline.pdf', today: new Date('2026-10-22T00:00:00Z')}, language));
      try {
        const document = dom.window.document;
        if (theirTimeline.length) {
          expect(Array.from(document.querySelectorAll('tbody tr td:last-child')).map(text)).toEqual(['First <event>', 'Second & last']);
          expect(document.querySelectorAll('thead th[scope="col"]')).toHaveLength(2);
          expect(document.getElementById('timeline-link')).toBeNull();
        } else {
          expect(document.querySelector('table')).toBeNull();
          const link = document.getElementById('timeline-link')!;
          expect(link.getAttribute('href')).toBe('/timeline.pdf');
          expect(link.getAttribute('target')).toBe('_blank');
          expect(link.getAttribute('rel')).toContain('noopener');
          expect(link.closest('table')).toBeNull();
        }
        expect(document.querySelector('event')).toBeNull();
        expect(document.querySelector('textarea[name="comment"]')!.textContent).toBe('Saved comment');
      } finally {dom.window.close();}
    }
    const empty = new JSDOM(renderProductionPage(view, {form, theirTimeline: [], today: new Date('2026-10-22T00:00:00Z')}, language));
    try {expect(empty.window.document.querySelector('table, #timeline-link')).toBeNull();} finally {empty.window.close();}
  });

});
