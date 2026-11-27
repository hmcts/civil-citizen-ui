import {SupportRequired, SupportRequiredList} from 'common/models/directionsQuestionnaire/supportRequired';
import fs from 'fs';
import path from 'path';
import {JSDOM} from 'jsdom';
import {dqForm, dqRepeatedPages, DqEditor, renderDqRepeatedPage} from '../../../utils/renderDqRepeatedRows';

const {initAddAnother} = require('../../../../main/assets/js/add-another');
const bundle = fs.readFileSync(path.join(path.dirname(require.resolve('govuk-frontend')), 'all.bundle.js'), 'utf8');
interface Govuk {initAll: (options?: {scope: Element | Document}) => void}
let dom: JSDOM;
let previous: Record<string, unknown>;
let govuk: Govuk;

function install(html: string) {
  dom = new JSDOM(html, {url: 'http://localhost/', runScripts: 'outside-only'});
  previous = Object.fromEntries(['window', 'document', 'MutationObserver'].map(key => [key, (global as unknown as Record<string, unknown>)[key]]));
  Object.assign(global, {window: dom.window, document: dom.window.document, MutationObserver: dom.window.MutationObserver});
  dom.window.document.body.classList.add('js-enabled', 'govuk-frontend-supported');
  dom.window.eval(bundle);
  govuk = (dom.window as unknown as {GOVUKFrontend: Govuk}).GOVUKFrontend;
  return dom.window.document;
}
const items = (doc: Document) => [...doc.querySelectorAll<HTMLElement>('.cui-add-another__item')];
const add = (doc: Document) => doc.querySelector<HTMLButtonElement>('.cui-add-another__add-button').click();
const remove = (doc: Document, index: number) => items(doc)[index].querySelector<HTMLButtonElement>('.cui-add-another__remove-button').click();
function enhance(doc: Document, first = true) {
  if (first) govuk.initAll();
  initAddAnother(doc, (scope: Element) => govuk.initAll({scope}));
}
function references(doc: Document) {
  const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  doc.querySelectorAll('[for], [aria-describedby], [aria-labelledby], [aria-controls], [data-aria-controls], [headers]').forEach(element => {
    for (const attr of ['for', 'aria-describedby', 'aria-labelledby', 'aria-controls', 'data-aria-controls', 'headers']) {
      element.getAttribute(attr)?.split(/\s+/).filter(Boolean).forEach(id => expect(doc.getElementById(id)).not.toBeNull());
    }
  });
  doc.querySelectorAll('a[href^="#"]').forEach(link => expect(doc.getElementById(link.getAttribute('href').slice(1))).not.toBeNull());
}

afterEach(() => {
  dom?.window.close();
  if (previous) for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete (global as unknown as Record<string, unknown>)[key];
    else (global as unknown as Record<string, unknown>)[key] = value;
  }
});

describe.each(Object.keys(dqRepeatedPages) as DqEditor[])('%s actual repeated editor', editor => {
  it.each(['en', 'cy'])('adds once, clears only the clone and preserves survivors (%s)', language => {
    const doc = install(renderDqRepeatedPage(editor, {language, invalid: true}));
    enhance(doc);enhance(doc, false);
    const before = items(doc).map(row => [...row.querySelectorAll<HTMLInputElement>('input,select,textarea')].map(field => field.value));
    add(doc);
    expect(items(doc)).toHaveLength(3);
    items(doc).slice(0, 2).forEach((row, index) => expect([...row.querySelectorAll<HTMLInputElement>('input,select,textarea')].map(field => field.value)).toEqual(before[index]));
    const clone = items(doc)[2];
    expect(clone.querySelector('.govuk-error-message')).toBeNull();
    clone.querySelectorAll<HTMLInputElement>('input,select,textarea').forEach(field => {
      if (field.type === 'checkbox' || field.type === 'radio') expect(field.checked).toBe(false);
      else expect(field.value).toBe('');
    });
    expect(doc.activeElement).toBe(clone.querySelector('input,select,textarea'));
    references(doc);
  });
  it.each([0, 1, 2])('removes row %i and keeps error/value ownership', index => {
    const doc = install(renderDqRepeatedPage(editor, {count: 3, invalid: true}));
    enhance(doc);
    const oldRows = items(doc), survivor = oldRows.filter((_, i) => i !== index);
    remove(doc, index);
    expect(items(doc)).toEqual(survivor);
    expect(doc.activeElement?.closest('.cui-add-another__item')).toBe(survivor[Math.min(index, survivor.length - 1)]);
    if (index === 0) expect(doc.querySelector('.govuk-error-summary')).toBeNull();
    else expect(doc.querySelector('.govuk-error-summary')).not.toBeNull();
    references(doc);
    items(doc).forEach((row, i) => {
      row.querySelectorAll<HTMLElement>('[data-name]').forEach(field => expect(field.getAttribute('name')).toBe(field.dataset.name.split('%index%').join(String(i))));
    });
  });
  it('retains one editable row and safely ignores incomplete roots', () => {
    const doc = install(renderDqRepeatedPage(editor, {count: 1}) + '<div data-module="cui-add-another"><input id="incomplete" value="retained"></div>');
    enhance(doc);remove(doc, 0);
    expect(items(doc)).toHaveLength(1);
    expect(items(doc)[0].querySelector<HTMLButtonElement>('.cui-add-another__remove-button').hidden).toBe(true);
    expect(doc.querySelector<HTMLInputElement>('#incomplete').value).toBe('retained');
  });
  it('has no newly imposed row maximum', () => {
    const doc = install(renderDqRepeatedPage(editor, {count: 10}));enhance(doc);add(doc);
    expect(items(doc)).toHaveLength(11);references(doc);
  });
});

it.each([false, true])('clones real conditional controls before/after GOV.UK init (%s)', initialised => {
  const doc = install(renderDqRepeatedPage('support'));
  enhance(doc, initialised);
  if (!initialised) govuk.initAll();
  add(doc);
  const row = items(doc)[2];
  for (const kind of ['signLanguageInterpreter', 'languageInterpreter', 'otherSupport']) {
    const checkbox = row.querySelector<HTMLInputElement>(`[id="declared-2-${kind}"]`), panel = doc.getElementById(checkbox.getAttribute('aria-controls'));
    expect(panel.classList.contains('govuk-checkboxes__conditional--hidden')).toBe(true);
    checkbox.click();expect(panel.classList.contains('govuk-checkboxes__conditional--hidden')).toBe(false);
    checkbox.click();expect(panel.classList.contains('govuk-checkboxes__conditional--hidden')).toBe(true);
  }
  remove(doc, 1);
  const checkbox = row.querySelector<HTMLInputElement>('[id="declared-1-otherSupport"]');checkbox.click();
  expect(doc.getElementById(checkbox.getAttribute('aria-controls')).classList.contains('govuk-checkboxes__conditional--hidden')).toBe(false);
  expect(items(doc)[0].querySelector<HTMLInputElement>('[value=languageInterpreter]').checked).toBe(true);
  references(doc);
});

it.each(['en', 'cy'])('preserves the master support-row checkbox fixes (%s)', language => {
  const doc = install(renderDqRepeatedPage('support', {language, count: 1}));
  const errors: unknown[] = [];
  dom.window.addEventListener('error', event => errors.push(event.error));
  enhance(doc);
  const original = items(doc)[0].querySelector<HTMLInputElement>('[value="languageInterpreter"]');
  expect(original.checked).toBe(true);
  expect(original.getAttribute('aria-expanded')).toBe('true');

  add(doc);
  expect(items(doc)).toHaveLength(2);
  const clone = items(doc)[1];
  const conditional = clone.querySelector<HTMLInputElement>('[value="languageInterpreter"]');
  const panel = doc.getElementById(conditional.getAttribute('aria-controls'));
  expect(conditional.checked).toBe(false);
  expect(conditional.getAttribute('aria-expanded')).toBe('false');
  expect(panel.classList.contains('govuk-checkboxes__conditional--hidden')).toBe(true);
  for (const value of ['disabledAccess', 'hearingLoop']) {
    const plain = clone.querySelector<HTMLInputElement>(`[value="${value}"]`);
    plain.click();expect(plain.checked).toBe(true);
  }
  const submitted = new dom.window.FormData(clone.closest('form'));
  expect(submitted.getAll('model[items][1][declared]')).toEqual(['disabledAccess', 'hearingLoop']);
  conditional.click();expect(conditional.getAttribute('aria-expanded')).toBe('true');
  conditional.click();expect(conditional.getAttribute('aria-expanded')).toBe('false');
  expect(errors).toEqual([]);
  expect(original.checked).toBe(true);
  references(doc);
  remove(doc, 1);expect(items(doc)).toHaveLength(1);
});

it('reindexes local fragments and both control attribute forms, leaving shared references and digits intact', () => {
  const doc = install(renderDqRepeatedPage('support', {count: 3}));
  const row = items(doc)[2], field = row.querySelector<HTMLInputElement>('input[name$="[content]"]');
  const link = doc.createElement('a');link.href = `#${field.id}`;link.textContent = '2026';row.append(link);
  const shared = doc.createElement('span');shared.id = 'shared-2030';doc.body.append(shared);field.setAttribute('aria-labelledby', 'shared-2030');field.value = 'Room 123 in 2026';
  enhance(doc);remove(doc, 0);references(doc);
  expect(field.value).toBe('Room 123 in 2026');expect(link.textContent).toBe('2026');expect(link.getAttribute('href')).toBe(`#${field.id}`);expect(field.getAttribute('aria-labelledby')).toBe('shared-2030');
});

it('coexists with independent roots and remaining append-row compatibility', () => {
  const pages = (Object.keys(dqRepeatedPages) as DqEditor[]).map(editor => new JSDOM(renderDqRepeatedPage(editor)));
  const html = pages.map(page => {const body = page.window.document.querySelector('[data-module="cui-add-another"]').outerHTML;page.window.close();return body;}).join('');
  const doc = install(html + '<div class="row-container"><input name="legacy[0]" id="legacy[0]" value="saved"></div><button class="append-row">Legacy add</button>');
  jest.isolateModules(() => {require('../../../../main/assets/js/append-row');});
  doc.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  enhance(doc);
  const roots = [...doc.querySelectorAll('[data-module="cui-add-another"]')];
  roots.forEach(root => root.querySelector<HTMLButtonElement>('.cui-add-another__add-button').click());
  roots.forEach(root => expect(root.querySelectorAll('.cui-add-another__item')).toHaveLength(3));
  expect(doc.querySelector<HTMLInputElement>('[name="legacy[0]"]').value).toBe('saved');
  expect(doc.querySelectorAll('.row-container')).toHaveLength(1);
  references(doc);
});

it('reindexes unenhanced conditional attributes before the first GOV.UK initialisation', () => {
  const doc = install(renderDqRepeatedPage('support', {count: 3}));
  enhance(doc, false);remove(doc, 0);references(doc);
  expect(items(doc)[1].querySelector('[id="declared-1-languageInterpreter"]').getAttribute('data-aria-controls')).toBe('conditional-declared-1-languageInterpreter');
  govuk.initAll();references(doc);
  const checkbox = items(doc)[1].querySelector<HTMLInputElement>('[id="declared-1-languageInterpreter"]');
  checkbox.click();expect(doc.getElementById(checkbox.getAttribute('aria-controls')).classList.contains('govuk-checkboxes__conditional--hidden')).toBe(true);
});

it('adds an unenhanced support row before the first GOV.UK initialisation', () => {
  const doc = install(renderDqRepeatedPage('support'));
  initAddAnother(doc);add(doc);
  const clone = items(doc)[2];
  expect(clone.querySelector<HTMLInputElement>('[value=languageInterpreter]').checked).toBe(false);
  expect(clone.querySelector('[value=languageInterpreter]').hasAttribute('data-aria-controls')).toBe(true);
  references(doc);govuk.initAll();references(doc);
  const checkbox = clone.querySelector<HTMLInputElement>('[value=languageInterpreter]');
  const panel = doc.getElementById(checkbox.getAttribute('aria-controls'));
  expect(panel.classList.contains('govuk-checkboxes__conditional--hidden')).toBe(true);
  checkbox.click();expect(panel.classList.contains('govuk-checkboxes__conditional--hidden')).toBe(false);
});

it('retains the surviving support row and its generated error associations after middle removal', () => {
  const form = dqForm('support', 3);
  const rows = (form.model as SupportRequiredList).items;
  rows[2].languageInterpreter.content = '';
  form.validateSync();
  const doc = install(renderDqRepeatedPage('support', {form}));enhance(doc);
  const survivor = items(doc)[2], error = survivor.querySelector('.govuk-error-message');
  remove(doc, 1);references(doc);
  expect(items(doc)[1]).toBe(survivor);expect(survivor.querySelector('.govuk-error-message')).toBe(error);
  expect(doc.querySelector('.govuk-error-summary a').getAttribute('href')).toBe('#model[items][1][languageInterpreter][content]');
  expect(survivor.querySelector<HTMLInputElement>('[value=languageInterpreter]').checked).toBe(true);
  expect(survivor.querySelector<HTMLSelectElement>('select').value).toBe('Witness0 Example');
});

it('targets the first usable support checkbox for a surviving group validation error', () => {
  const form = dqForm('support', 3);
  (form.model as SupportRequiredList).items[2] = new SupportRequired({fullName: 'Witness0 Example'});
  form.validateSync();
  const doc = install(renderDqRepeatedPage('support', {form}));enhance(doc);
  expect(doc.querySelector('.govuk-error-summary a').getAttribute('href')).toBe('#declared-2-disabledAccess');
  remove(doc, 1);references(doc);
  const target = doc.querySelector('.govuk-error-summary a').getAttribute('href').slice(1);
  expect(target).toBe('declared-1-disabledAccess');expect(doc.getElementById(target).tagName).toBe('INPUT');
  expect(doc.getElementById(target).getAttribute('type')).toBe('checkbox');
});
