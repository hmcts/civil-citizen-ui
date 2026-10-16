import fs from 'fs';
import path from 'path';
import {JSDOM} from 'jsdom';
import {remainingPages, RemainingEditor, removableEditors, dateEditors, renderRemainingPage} from '../../../utils/renderRemainingRepeatedRows';
import {renderDqRepeatedPage} from '../../../utils/renderDqRepeatedRows';

const bundle = fs.readFileSync(path.join(path.dirname(require.resolve('govuk-frontend')), 'all.bundle.js'), 'utf8');
let dom: JSDOM, previous: Record<string, unknown>;
let govuk: {initAll: (options?: {scope: Element | Document}) => void};
function install(html: string) {
  dom = new JSDOM(html, {url: 'http://localhost/', runScripts: 'outside-only'});
  previous = Object.fromEntries(['window', 'document', 'MutationObserver', 'fetch'].map(key => [key, (global as unknown as Record<string, unknown>)[key]]));
  Object.assign(global, {window: dom.window, document: dom.window.document, MutationObserver: dom.window.MutationObserver, fetch: jest.fn().mockResolvedValue({json: async () => '0'})});
  dom.window.HTMLElement.prototype.scrollIntoView = jest.fn();
  dom.window.document.body.classList.add('js-enabled', 'govuk-frontend-supported');dom.window.eval(bundle);
  govuk = (dom.window as unknown as {GOVUKFrontend: typeof govuk}).GOVUKFrontend;
  return dom.window.document;
}
const rows = (root: Element) => [...root.querySelectorAll<HTMLElement>(root.getAttribute('data-row-selector') || '.row-container')];
const fields = (root: Element) => [...root.querySelectorAll<HTMLInputElement>('input:not([type=submit]):not([type=button]),select,textarea')];
const values = (root: Element) => fields(root).map(field => [field.name, field.value, field.checked]);
function enhance(doc: Document, framework = true) {
  if (framework) govuk.initAll();
  const {initAppendRow} = require('../../../../main/assets/js/append-row');
  initAppendRow(doc, (scope: Element) => govuk.initAll({scope}));
  return initAppendRow;
}
function references(doc: Document) {
  const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);expect(new Set(ids).size).toBe(ids.length);
  doc.querySelectorAll('[for],[aria-describedby],[aria-labelledby],[aria-controls],[data-aria-controls]').forEach(element => {
    for (const attr of ['for', 'aria-describedby', 'aria-labelledby', 'aria-controls', 'data-aria-controls']) element.getAttribute(attr)?.split(/\s+/).filter(Boolean).forEach(id => expect(doc.getElementById(id)).not.toBeNull());
  });
}
const click = (root: Element, selector: string) => root.querySelector<HTMLButtonElement>(selector).click();
afterEach(async () => {
  await Promise.resolve();await Promise.resolve();dom?.window.close();jest.useRealTimers();
  if (previous) for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete (global as unknown as Record<string, unknown>)[key];else (global as unknown as Record<string, unknown>)[key] = value;
  }
});

describe.each(Object.keys(remainingPages) as RemainingEditor[])('%s owned legacy editor', editor => {
  it.each(['en', 'cy'])('adds once, preserves existing rows and resets the new row (%s)', language => {
    const doc = install(renderRemainingPage(editor, {language, state: 'error'})), root = doc.querySelector('[data-module="cui-append-row"]');
    const init = enhance(doc);init(doc);const before = rows(root).map(values);
    click(root, '.append-row');expect(rows(root)).toHaveLength(4);
    rows(root).slice(0, 3).forEach((row, index) => expect(values(row)).toEqual(before[index]));
    const clone = rows(root)[3];expect(clone.querySelector('.govuk-error-message')).toBeNull();
    fields(clone).forEach(field => {
      if (['checkbox', 'radio'].includes(field.type)) expect(field.checked).toBe(false);
      else if (field.tagName === 'SELECT') expect((field as unknown as HTMLSelectElement).selectedIndex).toBe(0);
      else expect(field.value).toBe('');
    });
    expect(doc.activeElement.closest(root.getAttribute('data-row-selector') || '.row-container')).toBe(clone);
    references(doc);click(root, '.append-row');expect(rows(root)).toHaveLength(5);references(doc);
    rows(root).forEach((row, index) => row.querySelectorAll<HTMLElement>('[data-row-label-template]').forEach(label => expect(label.textContent).toBe(label.dataset.rowLabelTemplate.split('%row%').join(String(index + 1)))));
    if (!removableEditors.includes(editor)) expect(root.querySelector('.remove-row')).toBeNull();
  });
  it('error-summary activation focuses an existing usable control', () => {
    const doc = install(renderRemainingPage(editor, {state: 'error'}));enhance(doc);
    const link = doc.querySelector<HTMLAnchorElement>('.govuk-error-summary a');expect(link).not.toBeNull();
    link.click();expect(doc.activeElement.id).toBe(link.getAttribute('href').slice(1));
    expect(['INPUT', 'SELECT', 'TEXTAREA']).toContain(doc.activeElement.tagName);
  });
  if (removableEditors.includes(editor)) it.each([0, 1, 2])('removes row %i and preserves/reindexes surviving values and errors', index => {
    const doc = install(renderRemainingPage(editor, {state: 'error'})), root = doc.querySelector('[data-module="cui-append-row"]');enhance(doc);
    const original = rows(root), survivors = original.filter((_, i) => i !== index), before = survivors.map(row => fields(row).map(field => [field.value, field.checked]));
    click(original[index], '.remove-row');expect(rows(root)).toEqual(survivors);references(doc);
    survivors.forEach((row, i) => expect(fields(row).map(field => [field.value, field.checked])).toEqual(before[i]));
    expect(doc.activeElement.closest(root.getAttribute('data-row-selector') || '.row-container')).toBe(survivors[Math.min(index, 1)]);
    click(survivors[0], '.remove-row');expect(rows(root)).toHaveLength(1);click(rows(root)[0], '.remove-row');expect(rows(root)).toHaveLength(1);
    expect(rows(root)[0].querySelector<HTMLButtonElement>('.remove-row').hidden).toBe(true);
    if (editor === 'gaDates') expect(rows(root)[0].querySelector<HTMLButtonElement>('.remove-row').value).toBe('remove-unavailableDates0');
  });
});

it.each(dateEditors)('%s cloned native radios work before and after GOV.UK enhancement', editor => {
  const doc = install(renderRemainingPage(editor)), root = doc.querySelector('[data-module="cui-append-row"]');
  const {initAppendRow} = require('../../../../main/assets/js/append-row');initAppendRow(doc);click(root, '.append-row');govuk.initAll();references(doc);
  const newRow = rows(root)[3], period = newRow.querySelector<HTMLInputElement>('[value=LONGER_PERIOD]');period.click();
  expect(doc.getElementById(period.getAttribute('aria-controls')).classList.contains('govuk-radios__conditional--hidden')).toBe(false);
  const firstChecked = rows(root)[0].querySelector<HTMLInputElement>('input:checked');expect(firstChecked.value).toBe('SINGLE_DATE');
  click(rows(root)[1], '.remove-row');references(doc);period.click();expect(period.checked).toBe(true);
});

it('keeps multiple editors, existing CUI controls and unrelated upload rows independent', () => {
  const fragments = (['amount', 'banks'] as RemainingEditor[]).map(editor => {const d = new JSDOM(renderRemainingPage(editor)), html = d.window.document.querySelector('[data-module="cui-append-row"]').outerHTML;d.window.close();return html;});
  const d = new JSDOM(renderDqRepeatedPage('support')), support = d.window.document.querySelector('[data-module="cui-add-another"]').outerHTML;d.window.close();
  const doc = install(fragments.join('') + support + '<div class="row-container"><input id="upload-sentinel" value="saved-document-2026"></div><div data-module="cui-append-row"><button class="append-row">Incomplete</button><input value="retained"></div>');
  enhance(doc);require('../../../../main/assets/js/add-another').initAddAnother(doc, (scope: Element) => govuk.initAll({scope}));
  const roots = [...doc.querySelectorAll('[data-row-name-prefix]')];roots.forEach(root => click(root, '.append-row'));roots.forEach(root => expect(rows(root)).toHaveLength(4));
  click(doc.querySelector('[data-module="cui-add-another"]'), '.cui-add-another__add-button');expect(doc.querySelectorAll('.cui-add-another__item')).toHaveLength(3);
  expect(doc.querySelector<HTMLInputElement>('#upload-sentinel').value).toBe('saved-document-2026');references(doc);
});

it('updates displayed and submitted claim totals with delegated listeners on added rows', () => {
  const doc = install(renderRemainingPage('amount')), root = doc.querySelector('[data-module="cui-append-row"]');enhance(doc);click(root, '.append-row');
  const input = rows(root)[3].querySelector<HTMLInputElement>('.civil-claim-amount');input.value = '2.35';input.dispatchEvent(new dom.window.Event('change', {bubbles: true}));
  expect(root.querySelector<HTMLInputElement>('input.total-claim-amount').value).toBe('42.85');expect(root.querySelector('span.total-claim-amount').textContent).toBe('42.85');
});

it.each(['income', 'expenses'] as RemainingEditor[])('%s calculation keeps CSRF/active categories, ignores stale responses and registers once', async editor => {
  const doc = install(renderRemainingPage(editor)), root = doc.querySelector('[data-module="cui-append-row"]'), form = doc.querySelector('form');
  const {getCalculation, addCalculationEventListener} = require('../../../../main/assets/js/calculate-amount');
  const pending: ((value: unknown) => void)[] = [];
  const fetch = jest.fn().mockImplementation(() => new Promise(resolve => pending.push(resolve)));Object.assign(global, {fetch});
  addCalculationEventListener(form);addCalculationEventListener(form);
  const inactive = [...form.querySelectorAll<HTMLElement>('.civil-amountRow')].find(row => !root.contains(row));
  inactive.querySelector<HTMLInputElement>('.civil-amount').value = '1000';
  inactive.querySelector<HTMLInputElement>('.civil-schedule input[value=MONTH]').checked = true;
  const old = getCalculation(form);expect(fetch).toHaveBeenCalledTimes(1);
  const options = fetch.mock.calls[0][1];expect(fetch.mock.calls[0][0]).toBe('/total-income-expense-calculation');expect(options.headers['CSRF-Token']).toBe('fixture-csrf');expect(JSON.parse(options.body)).toHaveLength(3);expect(JSON.parse(options.body).some((amount: {amount: string}) => amount.amount === '1000')).toBe(false);
  fields(rows(root)[0]).find(field => field.classList.contains('civil-amount')).value = '20';const newer = getCalculation(form);
  pending[1]({json: async () => 'new total'});await newer;pending[0]({json: async () => 'old total'});await old;
  expect(form.querySelector('.total-monthly-income-expense').textContent).toBe('new total');
  const schedule = rows(root)[0].querySelector<HTMLInputElement>('.civil-schedule input[value=WEEK]');
  schedule.checked = true;schedule.dispatchEvent(new dom.window.Event('change', {bubbles: true}));
  expect(fetch).toHaveBeenCalledTimes(3);
  const declaration = doc.querySelector<HTMLInputElement>('input[name=declared][value=other]');declaration.checked = false;declaration.dispatchEvent(new dom.window.Event('change', {bubbles: true}));
  expect(fetch).toHaveBeenCalledTimes(3);expect(form.querySelector('.total-monthly-income-expense').textContent).toBe('0');
  pending[2]({json: async () => 'late selected total'});await new Promise(resolve => setImmediate(resolve));
  expect(form.querySelector('.total-monthly-income-expense').textContent).toBe('0');
});

it.each(dateEditors)('%s retains the existing functional period IDs when cloning a saved single date', editor => {
  const doc = install(renderRemainingPage(editor, {count: 1})), root = doc.querySelector('[data-module="cui-append-row"]');enhance(doc);click(root, '.append-row');
  const row = rows(root)[1], radio = row.querySelector<HTMLInputElement>('[id="items-1-longer-period"]');radio.click();
  const field = row.querySelector<HTMLInputElement>('[id="items[1][startDay]"]');
  expect(field).not.toBeNull();expect(field.name).toBe('items[1][period][start][day]');
  expect(doc.getElementById(radio.getAttribute('aria-controls')).contains(field)).toBe(true);references(doc);
});
