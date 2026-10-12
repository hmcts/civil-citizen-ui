import {EvidenceType} from 'common/models/evidence/evidenceType';
import {ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {TypeOfDocumentSection} from 'models/caseProgression/uploadDocumentsUserForm';
import {EvidenceUploadDisclosure} from 'models/document/documentType';
import {buildDisclosureDocumentSection} from 'services/features/caseProgression/disclosureContentBuilder';
import {renderAddAnotherPage} from '../../../utils/renderAddAnother';

const {JSDOM} = require('jsdom');
const {initAddAnother} = require('../../../../main/assets/js/add-another');
const {initSelectToggle} = require('../../../../main/assets/js/select-toggle');

const courtPage = 'features/response/statementOfMeans/courtOrders/court-orders.njk';
const evidencePages = ['features/claim/claimant-evidences.njk', 'features/response/evidence/evidences.njk'];
const order = (index: number) => ({claimNumber: `CN${index}`, amount: 100 + index, instalmentAmount: 0});
let dom: InstanceType<typeof JSDOM>;
let previous: Record<string, unknown>;

function install(html: string) {
  dom = new JSDOM(html, {url: 'http://localhost/'});
  const globalObject = global as unknown as Record<string, unknown>;
  for (const name of ['window', 'document', 'MutationObserver']) globalObject[name] = dom.window[name === 'window' ? 'window' : name];
  return dom.window.document as Document;
}

function enhance(document: Document) {
  initSelectToggle(document);
  initAddAnother(document);
}

function rows(document: Document) { return [...document.querySelectorAll('.cui-add-another__item')]; }
function add(document: Document) { (document.querySelector('.cui-add-another__add-button') as HTMLButtonElement).click(); }
function remove(document: Document, index: number) { (rows(document)[index].querySelector('.cui-add-another__remove-button') as HTMLButtonElement).click(); }
function savedUploadDocument(index: number) {
  return {
    createdBy: 'fixture-user', documentName: `saved-${index}.pdf`,
    documentLink: {document_url: `http://localhost/documents/saved-${index}`, document_binary_url: `http://localhost/documents/saved-${index}/binary`, document_filename: `saved-${index}.pdf`},
    documentType: EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE,
    documentSize: 100, createdDatetime: new Date('2024-01-01T12:00:00Z'),
  };
}

function renderRepeatedUploads(withError = false) {
  const disclosureSections = [0, 1].map(index => {
    const section = new TypeOfDocumentSection('1', '1', '2024');
    section.typeOfDocument = withError && index === 0 ? '' : `Document ${index}`;
    section.caseDocument = savedUploadDocument(index);
    const contentSections = buildDisclosureDocumentSection(section, index).map((content, position) =>
      withError && index === 0 && position === 1
        ? {...content, data: {...content.data, errorMessage: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT'}} : content);
    return {contentSections};
  });
  return renderAddAnotherPage('features/caseProgression/upload-documents.njk', {}, {}, 'en', {
    disclosureContent: [disclosureSections], witnessContent: [], expertContent: [], trialContent: [], uploadDocumentsContents: [],
  });
}
function associations(document: Document) {
  const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  document.querySelectorAll('.cui-add-another__item [data-name]').forEach(field => {
    const group = field.closest('.govuk-form-group');
    expect(group?.querySelector('label')?.getAttribute('for')).toBe(field.id);
    const prefix = field.id.match(/^.*?\[\d+]/)?.[0];
    (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).forEach(id => expect(id.startsWith(prefix!)).toBe(true));
  });
  document.querySelectorAll('[for], [aria-describedby], [aria-controls], [aria-labelledby]').forEach(element => {
    for (const attr of ['for', 'aria-describedby', 'aria-controls', 'aria-labelledby']) {
      (element.getAttribute(attr) || '').split(/\s+/).filter(Boolean).forEach(id => expect(document.getElementById(id)).not.toBeNull());
    }
  });
  document.querySelectorAll('.govuk-error-summary a[href^="#"]').forEach(link => expect(document.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull());
}

beforeEach(() => {
  const globalObject = global as unknown as Record<string, unknown>;
  previous = Object.fromEntries(['window', 'document', 'MutationObserver'].map(name => [name, globalObject[name]]));
});
afterEach(() => {
  dom?.window.close();
  const globalObject = global as unknown as Record<string, unknown>;
  Object.entries(previous).forEach(([name, value]) => {
    if (value === undefined) delete globalObject[name];
    else globalObject[name] = value;
  });
});

describe('real court-order markup and the fork component adaptation', () => {
  it.each(['en', 'cy'])('renders translated controls and usable fields without JavaScript (%s)', language => {
    const document = install(renderAddAnotherPage(courtPage, {declared: true, rows: [order(0), order(1)]}, {}, language));
    expect(rows(document)).toHaveLength(2);
    expect(document.querySelectorAll('.cui-add-another__remove-button')).toHaveLength(2);
    document.querySelectorAll('.cui-add-another__add-button, .cui-add-another__remove-button').forEach(button => expect((button as HTMLButtonElement).hidden).toBe(true));
    expect(document.querySelector('.cui-add-another__remove-button')!.textContent).toContain(language === 'cy' ? 'Tynnu' : 'Remove');
    expect(document.querySelector('input[name="rows[0][claimNumber]"]')).not.toBeNull();
    expect(document.querySelector('[name="declared"]')).not.toBeNull();
    associations(document);
  });

  it('renders a default row with blank numeric inputs', () => {
    const document = install(renderAddAnotherPage(courtPage, {declared: true}));
    enhance(document);
    expect(rows(document)).toHaveLength(1);
    expect((document.querySelector('[name="rows[0][amount]"]') as HTMLInputElement).value).toBe('');
    expect((document.querySelector('.cui-add-another__remove-button') as HTMLButtonElement).hidden).toBe(true);
    add(document);
    expect(rows(document)).toHaveLength(2);
  });

  it.each(['en', 'cy'])('renders the submission-limit error and retains excess values (%s)', language => {
    const document = install(renderAddAnotherPage(courtPage, {declared: true, rows: Array.from({length: 11}, (_, index) => order(index))}, {rows: 'ERRORS.MAXIMUM_TEN_COURT_ORDERS'}, language));
    expect(document.querySelector('.govuk-error-summary')!.textContent).toContain(language === 'cy' ? 'Gallwch nodi uchafswm o 10 gorchymyn llys' : 'You can enter a maximum of 10 court orders');
    enhance(document);
    expect(rows(document)).toHaveLength(11);
    expect((rows(document)[10].querySelector('input') as HTMLInputElement).value).toBe('CN10');
    associations(document);
  });

  it('adds once after repeated initialisation, resets only the new row and preserves errors', () => {
    const document = install(renderAddAnotherPage(courtPage, {declared: true, rows: [order(0)]}, {'rows[0][amount]': 'ERRORS.AMOUNT_REQUIRED'}));
    const saved = document.createElement('input');
    saved.type = 'hidden'; saved.name = 'rows[0][caseDocument]'; saved.id = saved.name; saved.value = 'saved-reference';
    rows(document)[0].appendChild(saved);
    enhance(document); enhance(document);
    add(document);
    expect(rows(document)).toHaveLength(2);
    expect((rows(document)[0].querySelector('[name="rows[0][claimNumber]"]') as HTMLInputElement).value).toBe('CN0');
    expect((rows(document)[0].querySelector('[type="hidden"]') as HTMLInputElement).value).toBe('saved-reference');
    expect((rows(document)[1].querySelector('[type="hidden"]') as HTMLInputElement).value).toBe('');
    expect((rows(document)[1].querySelector('[type="hidden"]') as HTMLInputElement).name).toBe('rows[1][caseDocument]');
    expect(rows(document)[0].querySelector('.govuk-error-message')).not.toBeNull();
    expect(rows(document)[1].querySelector('.govuk-error-message')).toBeNull();
    expect(document.activeElement).toBe(rows(document)[1].querySelector('input'));
    expect(document.querySelector('.govuk-error-summary a')!.getAttribute('href')).toBe('#rows[0][amount]');
    associations(document);
  });

  it.each([0, 1, 2])('removes row %s, retaining values and repairing errors, labels and focus', index => {
    const document = install(renderAddAnotherPage(courtPage, {declared: true, rows: [order(0), order(1), order(2)]}, {'rows[0][amount]': 'ERRORS.AMOUNT_REQUIRED', 'rows[2][amount]': 'ERRORS.AMOUNT_REQUIRED'}));
    enhance(document);
    remove(document, index);
    expect(rows(document)).toHaveLength(2);
    const expected = [0, 1, 2].filter(value => value !== index).map(value => `CN${value}`);
    expect(rows(document).map(row => (row.querySelector('input') as HTMLInputElement).value)).toEqual(expected);
    associations(document);
    expect(document.activeElement!.isConnected).toBe(true);
    remove(document, 0); remove(document, 0);
    expect(rows(document)).toHaveLength(1);
  });

  it('removes the empty summary after the last invalid row while retaining the valid row and focus', () => {
    const document = install(renderAddAnotherPage(courtPage, {declared: true, rows: [order(0), order(1), order(2)]}, {'rows[0][amount]': 'ERRORS.AMOUNT_REQUIRED', 'rows[2][amount]': 'ERRORS.AMOUNT_REQUIRED'}));
    enhance(document);
    const summary = document.querySelector('.govuk-error-summary');
    remove(document, 0);
    expect(document.querySelector('.govuk-error-summary')).toBe(summary);
    expect(summary!.querySelectorAll('li')).toHaveLength(1);
    expect(summary!.querySelector('a')!.getAttribute('href')).toBe('#rows[1][amount]');
    expect(rows(document)[1].querySelector('.govuk-error-message')).not.toBeNull();
    associations(document);
    remove(document, 1);
    expect(rows(document)).toHaveLength(1);
    expect((rows(document)[0].querySelector('[name="rows[0][claimNumber]"]') as HTMLInputElement).value).toBe('CN1');
    expect((rows(document)[0].querySelector('[name="rows[0][amount]"]') as HTMLInputElement).value).toBe('101');
    expect(rows(document)[0].querySelector('.govuk-error-message')).toBeNull();
    expect(document.querySelector('.govuk-error-summary')).toBeNull();
    expect(document.querySelector('.govuk-error-summary__title')).toBeNull();
    expect(document.activeElement).toBe(rows(document)[0].querySelector('input'));
    remove(document, 0);
    expect(rows(document)).toHaveLength(1);
  });

  it('preserves unrelated errors and summaries when an invalid row is removed', () => {
    const document = install(renderAddAnotherPage(courtPage, {declared: true, rows: [order(0), order(1)]}, {'rows[0][amount]': 'ERRORS.AMOUNT_REQUIRED', declared: 'ERRORS.VALID_YES_NO_SELECTION'}));
    const unrelated = document.createElement('div');
    unrelated.className = 'govuk-error-summary';
    unrelated.innerHTML = '<ul class="govuk-error-summary__list"><li>Unrelated page error</li></ul>';
    document.body.appendChild(unrelated);
    enhance(document);
    remove(document, 0);
    const summary = document.querySelector('.govuk-error-summary')!;
    expect(summary.querySelectorAll('li')).toHaveLength(1);
    expect(summary.querySelector('a')!.getAttribute('href')).toBe('#declared');
    expect(document.getElementById('declared-error')).not.toBeNull();
    expect(unrelated.isConnected).toBe(true);
    expect(unrelated.textContent).toBe('Unrelated page error');
    associations(document);
  });

  it('keeps an affected summary containing a non-linked error entry', () => {
    const document = install(renderAddAnotherPage(courtPage, {declared: true, rows: [order(0), order(1)]}, {'rows[0][amount]': 'ERRORS.AMOUNT_REQUIRED'}));
    const summary = document.querySelector('.govuk-error-summary')!;
    const entry = document.createElement('li');
    entry.textContent = 'An error without a field link';
    summary.querySelector('.govuk-error-summary__list')!.appendChild(entry);
    enhance(document);
    remove(document, 0);
    expect(summary.isConnected).toBe(true);
    expect(summary.querySelectorAll('li')).toHaveLength(1);
    expect(summary.querySelector('li')).toBe(entry);
    expect(summary.querySelector('a')).toBeNull();
  });

  it.each([9, 10, 11])('enforces the limit on initial %s rows without truncating drafts', count => {
    const document = install(renderAddAnotherPage(courtPage, {declared: true, rows: Array.from({length: count}, (_, index) => order(index))}));
    enhance(document);
    const button = document.querySelector('.cui-add-another__add-button') as HTMLButtonElement;
    add(document);
    expect(rows(document)).toHaveLength(Math.max(count, 10));
    button.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, cancelable: true}));
    expect(rows(document)).toHaveLength(Math.max(count, 10));
    while (rows(document).length >= 10) remove(document, 0);
    expect(button.disabled).toBe(false);
    add(document);
    expect(rows(document)).toHaveLength(10);
  });

  it('keeps independent components and their limits separate', () => {
    const first = renderAddAnotherPage(courtPage, {declared: true, rows: Array.from({length: 10}, (_, index) => order(index))});
    const second = renderAddAnotherPage(evidencePages[0], {evidenceItem: [{type: EvidenceType.PHOTO, description: 'photo'}]});
    const document = install(first);
    const other = new JSDOM(second);
    document.body.appendChild(document.importNode(other.window.document.querySelector('[data-module="cui-add-another"]'), true));
    other.window.close();
    enhance(document);
    const roots = [...document.querySelectorAll('[data-module="cui-add-another"]')];
    (roots[1].querySelector('.cui-add-another__add-button') as HTMLButtonElement).click();
    expect(roots[0].querySelectorAll('.cui-add-another__item')).toHaveLength(10);
    expect(roots[1].querySelectorAll('.cui-add-another__item')).toHaveLength(2);
  });

  it('coexists with legacy cleanup, limits and action reindexing without changing existing rows', async () => {
    const document = install(renderAddAnotherPage(courtPage, {declared: true, rows: [order(0)]}, {'rows[0][amount]': 'ERRORS.AMOUNT_REQUIRED'}));
    const legacy = document.createElement('div');
    legacy.dataset.module = 'moj-add-another';
    legacy.innerHTML = Array.from({length: 9}, () => '<fieldset class="moj-add-another__item"></fieldset>').join('');
    document.body.appendChild(legacy);
    jest.isolateModules(() => {
      require('../../../../main/assets/js/remove-error-content');
      require('../../../../main/assets/js/conditionally-hide-add-button');
      require('../../../../main/assets/js/reindex-add-another-actions');
    });
    document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
    enhance(document);
    add(document);
    const existing = legacy.querySelector('fieldset')!;
    existing.innerHTML = '<p class="govuk-error-message">Existing error</p><div id="row-loadingContainer">Loading</div><div id="row[documentName]">Saved document</div>';
    await Promise.resolve();
    expect((document.querySelector('.cui-add-another__add-button') as HTMLElement).classList.contains('hide')).toBe(false);
    expect(rows(document)[0].querySelector('.govuk-error-message')).not.toBeNull();
    expect(existing.querySelector('.govuk-error-message')!.classList.contains('hide')).toBe(false);
    expect(existing.querySelector('[id*="loadingContainer"]')).not.toBeNull();
    expect(existing.querySelector('[id*="documentName"]')).not.toBeNull();
  });
});

describe.each(evidencePages)('real evidence page %s', view => {
  it('renders a complete default row and hides only client controls without JavaScript', () => {
    const document = install(renderAddAnotherPage(view, {evidenceItem: [], comment: 'separate comment'}));
    expect(rows(document)).toHaveLength(1);
    expect(rows(document)[0].querySelector('.cui-add-another__remove-button')).not.toBeNull();
    expect(rows(document)[0].querySelector('[hidden]')).not.toBeNull();
    expect(rows(document)[0].querySelector('.panel')!.classList.contains('govuk-visually-hidden')).toBe(false);
    associations(document);
  });

  it('changes only row two, supports added controls and preserves the separate comment', () => {
    const document = install(renderAddAnotherPage(view, {evidenceItem: [{type: EvidenceType.PHOTO, description: 'first photo'}, {type: EvidenceType.RECEIPTS, description: 'second receipt'}], comment: 'separate comment'}, {'evidenceItem[0][description]': 'ERRORS.VALID_TEXT_LENGTH'}));
    enhance(document);
    const first = rows(document)[0].querySelector('textarea') as HTMLTextAreaElement;
    const select = rows(document)[1].querySelector('select') as HTMLSelectElement;
    select.value = EvidenceType.OTHER;
    select.dispatchEvent(new dom.window.Event('change', {bubbles: true}));
    expect(first.value).toBe('first photo');
    expect((rows(document)[1].querySelector('textarea') as HTMLTextAreaElement).value).toBe('');
    add(document);
    const added = rows(document)[2].querySelector('select') as HTMLSelectElement;
    added.setAttribute('data-select-toggle-bound', 'true');
    added.value = EvidenceType.PHOTO;
    added.dispatchEvent(new dom.window.Event('change', {bubbles: true}));
    expect((rows(document)[2].querySelector('.panel') as HTMLElement).hidden).toBe(false);
    (rows(document)[2].querySelector('textarea') as HTMLTextAreaElement).value = 'new photo';
    remove(document, 1);
    expect((rows(document)[1].querySelector('textarea') as HTMLTextAreaElement).value).toBe('new photo');
    expect(first.value).toBe('first photo');
    expect(rows(document)[0].querySelector('.govuk-error-message')).not.toBeNull();
    const comment = document.querySelector('[name="comment"]') as HTMLTextAreaElement;
    if (view === evidencePages[1]) expect(comment.value).toBe('separate comment');
    associations(document);
  });

  it.each(['en', 'cy'])('renders translated Remove controls for each evidence row (%s)', language => {
    const document = install(renderAddAnotherPage(view, {evidenceItem: [{type: EvidenceType.PHOTO}, {type: EvidenceType.RECEIPTS}]}, {}, language));
    enhance(document);
    const controls = document.querySelectorAll('.cui-add-another__remove-button');
    expect(controls).toHaveLength(2);
    controls.forEach((control, index) => {
      expect(control.textContent).toContain(language === 'cy' ? 'Tynnu' : 'Remove');
      expect(control.textContent).toContain(String(index + 1));
      expect((control as HTMLButtonElement).hidden).toBe(false);
    });
  });
});

describe('real server-managed upload markup', () => {
  it('ignores the repeated case-progression rows and preserves every server submission action', () => {
    const document = install(renderRepeatedUploads());
    const root = document.querySelector('[data-module="moj-add-another"]')!;
    const beforeRows = [...root.querySelectorAll('.moj-add-another__item')];
    const expected = ['documentsForDisclosure[0][uploadButton]', 'documentsForDisclosure[0][removeButton]',
      'documentsForDisclosure[1][uploadButton]', 'documentsForDisclosure[1][removeButton]', 'add_another-disclosure'];
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('button[name="action"]')];
    expect(beforeRows).toHaveLength(2);
    expect(buttons.map(button => button.value)).toEqual(expected);
    buttons.forEach(button => expect(button.type).toBe('submit'));
    enhance(document);
    expect([...root.querySelectorAll('.moj-add-another__item')]).toEqual(beforeRows);
    expect(document.querySelector('[data-module="cui-add-another"]')).toBeNull();
    const submissions: string[] = [];
    document.querySelector('form')!.addEventListener('submit', event => {
      expect(event.defaultPrevented).toBe(false);
      submissions.push((event.submitter as HTMLButtonElement).value);
      event.preventDefault();
    });
    buttons.forEach(button => {
      expect(button.type).toBe('submit');
      expect(button.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, cancelable: true}))).toBe(true);
    });
    expect(submissions).toEqual(expected);
    expect([...root.querySelectorAll('.moj-add-another__item')]).toEqual(beforeRows);
    beforeRows.forEach((row, index) => {
      expect((row.querySelector(`[name="documentsForDisclosure[${index}][caseDocument]"]`) as HTMLInputElement).value).toBe(JSON.stringify(savedUploadDocument(index)));
      expect((row.querySelector(`[name="documentsForDisclosure[${index}][typeOfDocument]"]`) as HTMLInputElement).value).toBe(`Document ${index}`);
      expect(row.querySelector(`[name="documentsForDisclosure[${index}][fileUpload]"]`)).not.toBeNull();
      expect(row.querySelector(`[id="documentsForDisclosure[${index}][documentName]"]`)!.textContent).toContain(`saved-${index}.pdf`);
    });
  });

  it.each(['case progression', 'mediation'])('retains %s actions, category indexes and saved documents', journey => {
    const category = journey === 'mediation' ? 'yourStatement' : 'documentsForDisclosure';
    const contentSections = [
      {type: ClaimSummaryType.UPLOAD_ARRAY, data: {category, index: 1, field: 'file', value: '', documentName: 'saved.pdf', caseDocument: 'saved-reference', text: 'COMMON.DESCRIPTION'}},
      {type: ClaimSummaryType.REMOVE_BUTTON, data: {category, index: 1, text: 'COMMON.REMOVE'}},
    ];
    const section = {contentSections};
    const document = install(journey === 'mediation'
      ? renderAddAnotherPage('features/mediation/uploadDocuments/upload-documents.njk', {}, {}, 'en', {yourStatementContent: [[section]], documentsReferredContent: []})
      : renderAddAnotherPage('features/caseProgression/evidence-upload-documents.njk', {}, {}, 'en', {documentSections: [section]}));
    const before = [...document.querySelectorAll('button[name="action"]')].map(button => [button.getAttribute('type'), button.getAttribute('value')]);
    expect(before.some(([, value]) => value === `${category}[1][uploadButton]`)).toBe(true);
    expect(before.some(([type, value]) => type === 'submit' && value === `${category}[1][removeButton]`)).toBe(true);
    if (journey === 'mediation') expect(before.some(([, value]) => value === 'add_another-yourStatement')).toBe(true);
    enhance(document);
    document.querySelectorAll('form').forEach(form => form.addEventListener('submit', event => event.preventDefault()));
    expect([...document.querySelectorAll('button[name="action"]')].map(button => [button.getAttribute('type'), button.getAttribute('value')])).toEqual(before);
    document.querySelectorAll('button[name="action"]').forEach(button => {
      expect(button.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, cancelable: true}))).toBe(true);
    });
    expect((document.querySelector('[name="'+category+'[1][caseDocument]"]') as HTMLInputElement).value).toBe('saved-reference');
  });
});

describe('newly inserted legacy clone cleanup', () => {
  it('cleans the clone while retaining the original upload row and leaving CUI rows untouched', async () => {
    const document = install(renderRepeatedUploads(true));
    const root = document.querySelector('[data-module="moj-add-another"]')!;
    const original = root.querySelector('.moj-add-another__item')!;
    const loading = document.createElement('div');
    loading.id = 'documentsForDisclosure[0]-loadingContainer';
    loading.textContent = 'Loading';
    original.appendChild(loading);
    const originalMarkup = original.outerHTML;
    const other = new JSDOM(renderAddAnotherPage(courtPage, {declared: true, rows: [order(0)]}, {'rows[0][amount]': 'ERRORS.AMOUNT_REQUIRED'}));
    const cui = document.importNode(other.window.document.querySelector('[data-module="cui-add-another"]'), true) as HTMLElement;
    other.window.close();
    document.body.appendChild(cui);
    jest.isolateModules(() => { require('../../../../main/assets/js/remove-error-content'); });
    const clone = original.cloneNode(true) as HTMLElement;
    const cuiClone = cui.querySelector('.cui-add-another__item')!.cloneNode(true) as HTMLElement;
    await new Promise<void>(resolve => {
      const delivered = new dom.window.MutationObserver(() => { delivered.disconnect(); resolve(); });
      delivered.observe(document.body, {childList: true, subtree: true});
      root.insertBefore(clone, root.querySelector('.moj-button-action'));
      cui.querySelector('.cui-add-another__items')!.appendChild(cuiClone);
    });
    expect(clone.querySelector('[id*="-loadingContainer"]')).toBeNull();
    expect(clone.querySelector('[id*="[documentName]"]')).toBeNull();
    expect(clone.querySelector('.govuk-error-message')!.classList.contains('hide')).toBe(true);
    expect(clone.querySelector('.govuk-input--error')).toBeNull();
    expect(clone.querySelector('.govuk-form-group--error')).toBeNull();
    expect(original.outerHTML).toBe(originalMarkup);
    expect(original.querySelector('.govuk-error-message')!.classList.contains('hide')).toBe(false);
    expect(original.querySelector('[id*="-loadingContainer"]')).toBe(loading);
    expect(original.querySelector('[id*="[documentName]"]')!.textContent).toContain('saved-0.pdf');
    expect((original.querySelector('[name="documentsForDisclosure[0][caseDocument]"]') as HTMLInputElement).value).toBe(JSON.stringify(savedUploadDocument(0)));
    expect(cuiClone.querySelector('.govuk-error-message')!.classList.contains('hide')).toBe(false);
    expect(cuiClone.querySelector('.govuk-input--error')).not.toBeNull();
    expect(cuiClone.querySelector('.govuk-form-group--error')).not.toBeNull();
  });
});
