import {renderRepeatedUpload} from '../../../utils/renderUploadForms';
import {GenericForm} from 'form/models/genericForm';
const {JSDOM} = require('jsdom');
const {initUploadRows} = require('../../../../main/assets/js/upload-rows');
const {initAddAnother} = require('../../../../main/assets/js/add-another');
let dom: InstanceType<typeof JSDOM>;
let previous: Record<string, unknown>;
beforeEach(() => {previous = Object.fromEntries(['window','document'].map(name => [name, (global as unknown as Record<string, unknown>)[name]]));});
afterEach(() => {dom?.window.close();const g = global as unknown as Record<string, unknown>;Object.entries(previous).forEach(([key,value]) => {if (value === undefined) delete g[key]; else g[key] = value;});});
function install(mediation = false) {
  dom = new JSDOM(renderRepeatedUpload('en', mediation, 3), {url: 'http://localhost/upload'});
  Object.assign(global, {window: dom.window, document: dom.window.document});return dom.window.document as Document;
}
it.each([false,true])('keeps all upload submissions native and idempotent with both repeated-row initialisers (mediation=%s)', mediation => {
  const doc = install(mediation);
  const before = doc.querySelector('form')!.innerHTML;
  const {initAppendRow} = require('../../../../main/assets/js/append-row');
  initUploadRows(doc);initUploadRows(doc);initAddAnother(doc);initAppendRow(doc);
  expect(doc.querySelector('form')!.innerHTML).toBe(before);
  let submits = 0;
  doc.querySelector('form')!.addEventListener('submit', event => {expect(event.defaultPrevented).toBe(false);submits++;event.preventDefault();});
  doc.querySelectorAll<HTMLButtonElement>('button[name="action"]').forEach(button => {button.click();expect(button.type).toBe('submit');});
  expect(submits).toBe(doc.querySelectorAll('button[name="action"]').length);
  expect(doc.querySelector('form')!.innerHTML).toBe(before);
});
it.each(['add','first','middle','last'])('restores useful focus after a server action: %s', action => {
  const doc = install();initUploadRows(doc);
  doc.querySelector('form')!.addEventListener('submit', event => event.preventDefault());
  const index = action === 'first' ? 0 : action === 'middle' ? 1 : 2;
  const value = action === 'add' ? 'add_another-disclosure' : `documentsForDisclosure[${index}][removeButton]`;
  doc.querySelector<HTMLButtonElement>(`button[value="${value}"]`)!.click();
  const redisplay = new JSDOM(renderRepeatedUpload('en',false,action === 'add' ? 4 : 2));
  doc.body.innerHTML = redisplay.window.document.body.innerHTML;redisplay.window.close();
  initUploadRows(doc);
  const expectedIndex = action === 'add' ? 3 : Math.min(index,1);
  expect(doc.activeElement!.getAttribute('name')).toBe(`documentsForDisclosure[${expectedIndex}][typeOfDocument]`);
});
it('leaves server errors, unrelated pages and unavailable storage usable', () => {
  const doc = install();initUploadRows(doc);
  dom.window.sessionStorage.setItem('cui-upload-action', JSON.stringify({path:'/upload',category:'documentsForDisclosure',index:0}));
  const summary = doc.createElement('div');summary.className = 'govuk-error-summary';doc.body.prepend(summary);
  initUploadRows(doc);expect(doc.activeElement).toBe(doc.body);
  dom.window.sessionStorage.setItem('cui-upload-action', '{malformed');expect(() => initUploadRows(doc)).not.toThrow();
  jest.spyOn(dom.window.Storage.prototype,'setItem').mockImplementation(() => {throw new Error('blocked');});
  doc.querySelector('form')!.addEventListener('submit', event => event.preventDefault());
  expect(() => doc.querySelector<HTMLButtonElement>('button[value="add_another-disclosure"]')!.click()).not.toThrow();
  jest.restoreAllMocks();
});

it.each(['size','mimetype','buffer'])('activates nested %s error links on the usable file input', field => {
  const doc = install();
  const summary = doc.createElement('div');summary.className = 'govuk-error-summary';summary.dataset.module = 'govuk-error-summary';
  summary.innerHTML = `<a href="#documentsForDisclosure[0][fileUpload][${field}]">File error</a><a href="#unrelated">Unrelated error</a>`;doc.querySelector('form')!.prepend(summary);
  const {readFileSync} = require('fs');const {dirname,join} = require('path');
  // Use the locked GOV.UK summary handler, rather than asserting only an ID.
  const enhanced = new JSDOM(doc.documentElement.outerHTML, {url:'http://localhost/upload',runScripts:'outside-only'});
  try {
    Object.assign(global,{window:enhanced.window,document:enhanced.window.document});
    enhanced.window.document.body.classList.add('js-enabled','govuk-frontend-supported');
    enhanced.window.HTMLElement.prototype.scrollIntoView = (): void => undefined;
    enhanced.window.eval(readFileSync(join(dirname(require.resolve('govuk-frontend')),'all.bundle.js'),'utf8'));
    enhanced.window.GOVUKFrontend.initAll();initUploadRows(enhanced.window.document);
    enhanced.window.document.querySelector('.govuk-error-summary a').click();
    expect(enhanced.window.document.activeElement.id).toBe('documentsForDisclosure[0][fileUpload]');
    expect(enhanced.window.document.querySelectorAll('.govuk-error-summary a')[1].getAttribute('href')).toBe('#unrelated');
  } finally {enhanced.window.close();}
});

describe.each(['en', 'cy'])('upload date error focus (%s)', language => {
  it.each([
    ['documentsForDisclosure', false],
    ['witnessStatement', false],
    ['documentsForYourStatement', true],
    ['documentsForDocumentsReferred', true],
  ] as const)('focuses the correct saved row for real day-validation errors: %s', (category, mediation) => {
    const {renderUploadPage, uploadCategories} = require('../../../utils/renderUploadForms');
    const {formControlsEnvironment, formControlTranslate} = require('../../../utils/renderFormControls');
    const service = mediation
      ? require('services/features/mediation/uploadDocuments/uploadDocumentsService')
      : require('services/features/caseProgression/caseProgressionService');
    const initial = new JSDOM(renderRepeatedUpload(language, mediation, 3));
    let submitted;
    try {
      const fields = [...initial.window.document.querySelectorAll('input[name]:not([type=file]),select[name],textarea[name]')]
        .filter((field: HTMLInputElement) => field.name.startsWith(`${category}[`))
        .map((field: HTMLInputElement) => [field.name, field.value]);
      submitted = require('qs').parse(new URLSearchParams(fields).toString());
    } finally {initial.window.close();}
    const model = service.getUploadDocumentsForm({body: submitted});
    for (const index of [0, 2]) model[category][index].dateInputFields.dateDay = '40';
    const form = new GenericForm(model);
    form.validateSync();
    for (const index of [0, 2]) expect(form.hasFieldError(`${category}[${index}][dateInputFields][dateDay]`)).toBe(true);

    const mediationBuilders = require('services/features/mediation/uploadDocuments/' + (category === 'documentsForYourStatement' ? 'yourStatementContentBuilder' : 'documentsForDocumentsReferredContentBuilder'));
    const [, group, , builder] = mediation
      ? [category, category === 'documentsForYourStatement' ? 'yourStatementContent' : 'documentsReferredContent', '', category === 'documentsForYourStatement' ? mediationBuilders.buildYourStatementSection : mediationBuilders.buildDocumentsReferredSection]
      : uploadCategories.find(([name]: [string]) => name === category);
    const view = mediation ? 'features/mediation/uploadDocuments/upload-documents.njk' : 'features/caseProgression/upload-documents.njk';
    const html = renderUploadPage(view, language, {
      form, uploadDocumentsContents: [],
      [group]: [model[category].map((row: unknown, index: number) => ({contentSections: builder(row, index, form)}))],
    });
    dom = new JSDOM(html, {url: 'http://localhost/upload', runScripts: 'outside-only'});
    const doc = dom.window.document as Document;
    if (!doc.querySelector('.govuk-error-summary')) {
      const summary = formControlsEnvironment().renderString('{% from "macro/error-summary.njk" import errorSummary %}{{ errorSummary(form.getAllErrors(),t) }}', {form, t: formControlTranslate(language)});
      doc.body.insertAdjacentHTML('afterbegin', summary);
    }
    const unrelated = doc.createElement('a');
    unrelated.href = '#outside[0][dateInputFields][dateDay]';
    doc.querySelector('.govuk-error-summary')!.appendChild(unrelated);
    const values = () => [...doc.querySelectorAll<HTMLInputElement>('input[name]:not([type=file])')].map(field => [field.name, field.id, field.value]);
    const before = values();
    Object.assign(global, {window: dom.window, document: doc});
    doc.body.classList.add('js-enabled', 'govuk-frontend-supported');
    dom.window.HTMLElement.prototype.scrollIntoView = (): void => undefined;
    const fs = require('fs');const path = require('path');
    dom.window.eval(fs.readFileSync(path.join(path.dirname(require.resolve('govuk-frontend')), 'all.bundle.js'), 'utf8'));
    dom.window.GOVUKFrontend.initAll();
    initUploadRows(doc);initUploadRows(doc);
    for (const index of [0, 2]) {
      const input = doc.querySelector<HTMLInputElement>(`[name="${category}[${index}][dateInputFields][dateDay]"]`)!;
      const link = doc.querySelector<HTMLAnchorElement>(`.govuk-error-summary a[href="#${input.id}"]`);
      expect(link).not.toBeNull();
      link!.click();
      expect(doc.activeElement).toBe(input);
    }
    expect(unrelated.getAttribute('href')).toBe('#outside[0][dateInputFields][dateDay]');
    expect(values()).toEqual(before);
  });
});

describe.each([false, true])('pending selections (mediation=%s)', mediation => {
  function pendingFiles() {
    const doc = install(mediation);
    const category = mediation ? 'documentsForYourStatement' : 'documentsForDisclosure';
    const otherCategory = mediation ? 'documentsForDocumentsReferred' : 'disclosureList';
    const selected = [category, otherCategory].map((name, index) => {
      const input = doc.querySelector<HTMLInputElement>(`[name="${name}[0][fileUpload]"]`)!;
      const file = new dom.window.File(['%PDF-local'], `pending-${index}.pdf`, {type: 'application/pdf'});
      Object.defineProperty(input, 'files', {value: [file]});
      return {input, file};
    });
    initUploadRows(doc);initUploadRows(doc);
    const submissions: string[] = [];
    doc.querySelector('form')!.addEventListener('submit', event => {
      if (!event.defaultPrevented) submissions.push((event.submitter as HTMLButtonElement).value);
      event.preventDefault();
    });
    return {doc, category, otherCategory, selected, submissions};
  }

  it.each(['add', 'remove selected row', 'remove other category', 'continue'])('blocks %s without clearing either pending selection', action => {
    const {doc, category, otherCategory, selected, submissions} = pendingFiles();
    const addAction = mediation ? 'add_another-yourStatement' : 'add_another-disclosure';
    const selector = action === 'continue' ? 'button[type="submit"]:not([name])'
      : `button[value="${action === 'add' ? addAction : `${action === 'remove selected row' ? category : otherCategory}[0][removeButton]`}"]`;
    const button = doc.querySelector<HTMLButtonElement>(selector);
    expect(button).not.toBeNull();
    const before = doc.querySelector('form')!.innerHTML;
    button!.click();
    expect(submissions).toEqual([]);
    expect(doc.activeElement).toBe(doc.querySelector(`button[value="${category}[0][uploadButton]"]`));
    for (const {input, file} of selected) expect(input.files![0]).toBe(file);
    expect(doc.querySelector('form')!.innerHTML).toBe(before);
    expect(dom.window.sessionStorage.getItem('cui-upload-action')).toBeNull();
  });

  it.each(['first pending row', 'other pending category', 'row without a selection'])('keeps Save native for %s despite other pending files', target => {
    const {doc, category, otherCategory, selected, submissions} = pendingFiles();
    const targetCategory = target === 'other pending category' ? otherCategory : category;
    const index = target === 'row without a selection' ? 2 : 0;
    const action = `${targetCategory}[${index}][uploadButton]`;
    const button = doc.querySelector<HTMLButtonElement>(`button[value="${action}"]`);
    expect(button).not.toBeNull();
    button!.click();
    expect(submissions).toEqual([action]);
    // The harness cancels navigation. This does not claim that another pending
    // file survives a real server redisplay; only the action's file is saved.
    for (const {input, file} of selected) expect(input.files![0]).toBe(file);
    expect(JSON.parse(dom.window.sessionStorage.getItem('cui-upload-action')!)).toEqual({
      path: '/upload', category: targetCategory, index, add: false,
    });
  });
});

it('gives the existing empty-property missing-document error a usable single-file summary target', () => {
  const {renderUploadPage} = require('../../../utils/renderUploadForms');
  const {GenericForm} = require('form/models/genericForm');
  const {UploadGAFiles} = require('models/generalApplication/uploadGAFiles');
  const {formControlsEnvironment,formControlTranslate} = require('../../../utils/renderFormControls');
  const form = new GenericForm(new UploadGAFiles(),[{property:'',constraints:{fixture:'ERRORS.GENERAL_APPLICATION.UPLOAD_ONE_FILE'}}]);
  const summary = formControlsEnvironment().renderString('{% from "macro/error-summary.njk" import errorSummary %}{{ errorSummary(form.getAllErrors(),t) }}',{form,t:formControlTranslate()});
  dom = new JSDOM(renderUploadPage('features/generalApplication/upload_documents.njk','en',{form}),{url:'http://localhost/upload',runScripts:'outside-only'});
  Object.assign(global,{window:dom.window,document:dom.window.document});
  dom.window.document.body.insertAdjacentHTML('afterbegin',summary);
  dom.window.document.body.classList.add('js-enabled','govuk-frontend-supported');
  dom.window.HTMLElement.prototype.scrollIntoView = (): void => undefined;
  const fs = require('fs');const path = require('path');
  dom.window.eval(fs.readFileSync(path.join(path.dirname(require.resolve('govuk-frontend')),'all.bundle.js'),'utf8'));
  dom.window.GOVUKFrontend.initAll();initUploadRows(dom.window.document);
  dom.window.document.querySelector('.govuk-error-summary a').click();
  expect(dom.window.document.activeElement.id).toBe('selectedFile');
});
