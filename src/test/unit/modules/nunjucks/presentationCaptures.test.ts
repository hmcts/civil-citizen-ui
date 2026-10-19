import fs from 'fs';
import path from 'path';
import {JSDOM} from 'jsdom';
import {configuredPresentationEnvironment, presentationFormContext, renderPresentation} from '../../../utils/renderPresentationPages';
import {formControlTranslate} from '../../../utils/renderFormControls';
const directory = path.resolve('src/test/utils/mocks/a11y');
const files = fs.readdirSync(directory).filter(name => name.endsWith('.html'));
if (!files.length) throw new Error('Accessibility captures were not discovered');

function payload(document: Document) {
  return Array.from(document.querySelectorAll('form')).map(form => ({action: form.getAttribute('action'), method: form.getAttribute('method'), enctype: form.getAttribute('enctype'),
    fields: Array.from(form.querySelectorAll<HTMLInputElement>('input,select,textarea,button')).map(element => [element.tagName, element.name, element.getAttribute('type'), element.value, element.checked, element.disabled]),
  }));
}

describe('PR9 bounded accessibility captures', () => {
  it('has a non-empty header inventory and preserves captured navigation and submission contracts', () => {
    let enhanced = 0;
    for (const name of files) {
      const dom = new JSDOM(fs.readFileSync(path.join(directory, name), 'utf8')); const document = dom.window.document;
      const header = document.querySelector('.civil-header');
      if (header) {
        enhanced++;
        expect(header.querySelectorAll('.govuk-header')).toHaveLength(1);
        expect(header.querySelectorAll('.govuk-service-navigation')).toHaveLength(1);
        expect(header.querySelectorAll('a')).toHaveLength(4);
        for (const control of header.querySelectorAll('[aria-controls]')) expect(document.getElementById(control.getAttribute('aria-controls')!)).not.toBeNull();
        expect(header.querySelector('a[href*="ui-preview"]')).toBeNull();
        if (process.env.PR9_BASE_VIEWS) {
          const basePath = path.resolve(process.env.PR9_BASE_VIEWS, '../../test/utils/mocks/a11y', name);
          const base = new JSDOM(fs.readFileSync(basePath, 'utf8'));
          const links = (root: Element) => Array.from(root.querySelectorAll('a')).map(a => [a.getAttribute('href'), a.textContent!.replace(/\s+/g, ' ').trim()]);
          expect(links(header)).toEqual(links(base.window.document.querySelector('header.govuk-header')!));
          expect(payload(document)).toEqual(payload(base.window.document)); base.window.close();
        }
      }
      dom.window.close();
    }
    expect(enhanced).toBe(321);
  });
  it('matches the query-start capture legend to the production caption and title', () => {
    const file = 'mock-case-1645882162449409-qm-start.html';
    const view = 'features/queryManagement/qm-questions-template.njk';
    const captured = new JSDOM(fs.readFileSync(path.join(directory, file), 'utf8'));
    const current = new JSDOM(renderPresentation(view, presentationFormContext(view, 'en', 'saved'), 'en'));
    try {
      const selector = 'form legend.govuk-visually-hidden';
      const capturedLegends = captured.window.document.querySelectorAll(selector);
      const currentLegends = current.window.document.querySelectorAll(selector);
      expect(capturedLegends).toHaveLength(1);
      expect(currentLegends).toHaveLength(1);
      const text = (element: Element) => element.textContent!.replace(/\s+/g, ' ').trim();
      expect(text(currentLegends[0])).toBe('Contact or apply to the court What do you want to do?');
      expect(text(capturedLegends[0])).toBe(text(currentLegends[0]));
    } finally {
      captured.window.close();
      current.window.close();
    }
  });
  it('keeps every captured query message and attachment in its original order', () => {
    const file = 'mock-case-1645882162449409-qm-view-query-1-query-details.html';
    const dom = new JSDOM(fs.readFileSync(path.join(directory, file), 'utf8'));
    const cards = Array.from(dom.window.document.querySelectorAll('.govuk-summary-card'));
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every(card => card.querySelectorAll('dt').length >= 4)).toBe(true);
    const text = (element: Element) => element.textContent!.replace(/\s+/g, ' ').trim();
    const item = {
      messageDetails: 'dasdsa', isHearingRelated: 'No', raisedByUser: true,
      sentOn: '23 June 2025, 8:15:29 am', sentOnFormatted: '23 June 2025',
      documents: [{documentUrl: '<a class="govuk-link" target="_blank" href="/case/24c5512a-1f62-4f87-ad36-d4662fddc676/view-documents/b5b27eb2-dee4-4b6d-b801-3fe3f74cae40">uploadMediation.drawio.png</a>'}],
    };
    const current = new JSDOM(configuredPresentationEnvironment().renderString(
      '{% from "macro/query-message-card.njk" import queryMessageCard %}{{ queryMessageCard(item, 1, t) }}',
      {item, t: formControlTranslate('en')},
    ));
    try {
      expect(cards).toHaveLength(1);
      expect(text(cards[0].querySelector('h2')!)).toBe('Your message (23 June 2025)');
      const content = (document: Document, selector: string) => Array.from(document.querySelectorAll(selector)).map(text);
      for (const selector of ['.govuk-summary-card__title', '.govuk-summary-list__key', '.govuk-summary-list__value']) {
        expect(content(dom.window.document, selector)).toEqual(content(current.window.document, selector));
      }
      expect(Array.from(cards[0].querySelectorAll('a')).map(a => [a.getAttribute('href'), text(a)]))
        .toEqual(Array.from(current.window.document.querySelectorAll('a')).map(a => [a.getAttribute('href'), text(a)]));
    } finally {current.window.close();}
    if (process.env.PR9_BASE_VIEWS) {
      const base = new JSDOM(fs.readFileSync(path.resolve(process.env.PR9_BASE_VIEWS, '../../test/utils/mocks/a11y', file), 'utf8'));
      const values = (document: Document) => Array.from(document.querySelectorAll('.govuk-summary-card dd')).map(dd => dd.textContent!.replace(/\s+/g, ' ').trim());
      expect(values(dom.window.document)).toEqual(values(base.window.document)); base.window.close();
    }
    dom.window.close();
  });
});
