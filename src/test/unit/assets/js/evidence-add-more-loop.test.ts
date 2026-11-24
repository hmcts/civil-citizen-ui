import {EvidenceType} from 'common/models/evidence/evidenceType';
import {renderAddAnotherPage} from '../../../utils/renderAddAnother';

const {JSDOM} = require('jsdom');
const {initAddAnother} = require('../../../../main/assets/js/add-another');

// Regression guard for the "List your evidence" navigation loop: clicking
// "Add more evidence" must never submit the form. A native submit POSTs to
// /claim/your-details/evidence, which validates (every row is optional) and
// redirects to the "Make a money claim" task list (CLAIMANT_TASK_LIST_URL).
const view = 'features/claim/claimant-evidences.njk';
const fourEmptyRows = Array.from({length: 4}, () => ({type: '', description: ''}));

let dom: InstanceType<typeof JSDOM>;

function load(model: Record<string, unknown>) {
  dom = new JSDOM(renderAddAnotherPage(view, model), {url: 'http://localhost/claim/your-details/evidence'});
  const document = dom.window.document as Document;
  const submissions: Event[] = [];
  document.querySelector('form')!.addEventListener('submit', event => {
    submissions.push(event);
    event.preventDefault();
  });
  return {document, submissions};
}

const addButton = (document: Document) => document.querySelector('.cui-add-another__add-button') as HTMLButtonElement;
const rows = (document: Document) => document.querySelectorAll('.cui-add-another__item');

describe('"Add more evidence" on the claimant List your evidence page', () => {
  let previousDocument: unknown;
  let previousWindow: unknown;

  beforeEach(() => {
    const globalObject = global as unknown as Record<string, unknown>;
    previousDocument = globalObject.document;
    previousWindow = globalObject.window;
  });

  afterEach(() => {
    dom?.window.close();
    const globalObject = global as unknown as Record<string, unknown>;
    globalObject.document = previousDocument;
    globalObject.window = previousWindow;
  });

  it.each([
    ['no saved evidence', {evidenceItem: []}],
    ['four empty rows', {evidenceItem: fourEmptyRows}],
    ['four filled rows', {evidenceItem: fourEmptyRows.map((_, i) => ({type: EvidenceType.PHOTO, description: `photo ${i}`}))}],
  ])('does not submit the form when the script has not initialised (%s)', (_name, model) => {
    const {document, submissions} = load(model);

    addButton(document).click();

    expect(addButton(document).getAttribute('type')).toBe('button');
    expect(submissions).toHaveLength(0);
  });

  it.each([
    ['no saved evidence', {evidenceItem: []}, 1],
    ['four empty rows', {evidenceItem: fourEmptyRows}, 4],
  ])('adds a row instead of submitting once the script has initialised (%s)', (_name, model, initialRows) => {
    const {document, submissions} = load(model);
    (global as unknown as Record<string, unknown>).document = document;
    (global as unknown as Record<string, unknown>).window = dom.window;
    initAddAnother(document);

    expect(rows(document)).toHaveLength(initialRows);
    addButton(document).click();

    expect(submissions).toHaveLength(0);
    expect(rows(document)).toHaveLength(initialRows + 1);
  });

  it('only the Save and continue button is a submit button inside the form', () => {
    const {document} = load({evidenceItem: fourEmptyRows});

    const submitButtons = [...document.querySelectorAll<HTMLButtonElement>('form button')]
      .filter(button => button.type === 'submit');

    expect(submitButtons).toHaveLength(1);
    expect(submitButtons[0].classList.contains('cui-add-another__add-button')).toBe(false);
    expect(submitButtons[0].classList.contains('cui-add-another__remove-button')).toBe(false);
  });
});
