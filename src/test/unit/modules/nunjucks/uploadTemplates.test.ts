import {Request} from 'express';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {summaryRowWithTextValue} from 'models/summaryList/summaryList';
import {getUploadDocumentsForm} from 'services/features/caseProgression/caseProgressionService';
import {getUploadDocumentsForm as getMediationForm} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {renderRepeatedUpload, renderUploadPage, uploadCategories, uploadPages} from '../../../utils/renderUploadForms';
import {formControlsEnvironment, formControlTranslate} from '../../../utils/renderFormControls';
const {JSDOM} = require('jsdom');
const qs = require('qs');

function associations(doc: Document) {
  const ids = [...doc.querySelectorAll('[id]')].map(e => e.id);
  expect(new Set(ids).size).toBe(ids.length);
  doc.querySelectorAll('[for],[aria-describedby],[aria-labelledby]').forEach(e => {
    for (const attr of ['for','aria-describedby','aria-labelledby']) (e.getAttribute(attr) || '').split(/\s+/).filter(Boolean).forEach(id => expect(doc.getElementById(id)).not.toBeNull());
  });
}
function body(doc: Document) {
  return qs.parse(new URLSearchParams([...doc.querySelectorAll<HTMLInputElement>('input[name]:not([type=file]),select[name],textarea[name]')].map(e => [e.name, e.value])).toString());
}
it.each(['en','cy'])('preserves every case-progression category, index, saved reference and converted row (%s)', language => {
  const dom = new JSDOM(renderRepeatedUpload(language, false, 3));
  try {
    const doc = dom.window.document as Document;
    associations(doc);
    const converted = getUploadDocumentsForm({body: body(doc)} as Request);
    for (const [category, , add] of uploadCategories) {
      expect(doc.querySelector(`button[value="add_another-${add}"]`)).not.toBeNull();
      for (let i = 0; i < 3; i++) {
        for (const action of ['uploadButton','removeButton']) expect(doc.querySelector<HTMLButtonElement>(`button[value="${category}[${i}][${action}]"]`)!.type).toBe('submit');
        const hidden = doc.querySelector<HTMLInputElement>(`[name="${category}[${i}][caseDocument]"]`)!;
        expect(JSON.parse(hidden.value).documentName).toBe(`saved-${i}.pdf`);
        const row = converted[category]![i];
        expect(row.caseDocument!.documentLink.document_url).toBe(`http://localhost/documents/${i}`);
        doc.querySelectorAll<HTMLInputElement>(`[name^="${category}[${i}]"]:not([type=file]):not([type=hidden])`).forEach(field => {
          const name = field.name.split('][').pop()!.replace(']','');
          const actual = field.name.includes('[dateInputFields]') ? ('dateInputFields' in row ? row.dateInputFields?.[name as 'dateDay'] : undefined) : (row as unknown as Record<string, unknown>)[name];
          expect(String(actual)).toBe(field.value);
        });
      }
    }
    expect(doc.querySelector('[data-module="moj-add-another"],[data-module="cui-add-another"]')).toBeNull();
  } finally {dom.window.close();}
});
it.each(['en','cy'])('preserves both mediation collections and complete converted values (%s)', language => {
  const dom = new JSDOM(renderRepeatedUpload(language, true, 3));
  try {
    const doc = dom.window.document as Document; associations(doc);
    doc.querySelectorAll('legend').forEach(legend => expect(legend.textContent!.trim()).not.toBe(''));
    const converted = getMediationForm({body: body(doc)} as Request);
    for (const [category, field] of [['documentsForYourStatement','yourName'],['documentsForDocumentsReferred','typeOfDocument']] as const) {
      converted[category].forEach((row, i) => {
        expect(row.caseDocument!.documentName).toBe(`saved-${i}.pdf`);
        expect(row.dateInputFields.dateDay).toBe('1');
        expect((row as unknown as Record<string,unknown>)[field]).toBe(`${field === 'yourName' ? 'Person' : 'Description'} ${i}`);
        for (const action of ['uploadButton','removeButton']) expect(doc.querySelector<HTMLButtonElement>(`button[value="${category}[${i}][${action}]"]`)!.type).toBe('submit');
      });
    }
    expect(doc.querySelector('button[value="add_another-yourStatement"]')).not.toBeNull();
    expect(doc.querySelector('button[value="add_another-documentsReferred"]')).not.toBeNull();
  } finally {dom.window.close();}
});
describe.each(uploadPages)('actual upload caller %s', view => {
  it.each(['en','cy'])('preserves multipart, CSRF, file and removal contracts and safe names (%s)', language => {
    const hostile = '"quoted" & <img src=x onerror=alert(1) alt="">.pdf';
    const rows = view.includes('queryManagement') ? [summaryRowWithTextValue(hostile, '2')] : [summaryRowWithTextValue('Description', hostile), summaryRowWithTextValue(hostile, '', '/remove?id=2&role=respondent')];
    const dom = new JSDOM(renderUploadPage(view, language, {formattedSummary: {summaryList: {rows}}, documentName: hostile}));
    try {
      const doc = dom.window.document as Document; associations(doc);
      expect(doc.querySelector('form')!.enctype).toBe('multipart/form-data');
      expect(doc.querySelector('form')!.method).toBe('post');
      expect(doc.querySelector<HTMLInputElement>('[name="selectedFile"]')!.type).toBe('file');
      expect(doc.querySelector<HTMLInputElement>('[name="_csrf"]')!.value).toBe('fixture-csrf');
      expect(doc.querySelector<HTMLButtonElement>('button[value="uploadButton"]')!.type).toBe('submit');
      expect(doc.querySelector('img,[onerror]')).toBeNull();
      expect(doc.querySelector('dl')!.textContent).toContain(hostile);
      if (view.includes('queryManagement')) expect(doc.querySelector<HTMLButtonElement>('button[value="[2][deleteFile]"]')!.type).toBe('submit');
      else expect(doc.querySelector<HTMLAnchorElement>('dl a')!.getAttribute('href')).toBe(view.includes('n245') ? '/case/1/upload?source=fixture?action=REMOVE_DOC' : '/remove?id=2&role=respondent');
    } finally {dom.window.close();}
  });
});
it('isolates date errors, filters absent keys and escapes messages before trusted separators', () => {
  const env = formControlsEnvironment();
  const content = (index: number, errors = {}) => ({type: ClaimSummaryType.DATE_ARRAY, data: {category: 'witnessStatement', index, parentField: 'dateInputFields', field: 'date', text: 'COMMON.DATE', ...errors}});
  const html = env.renderString('{% from "features/dashboard/item-content.njk" import itemContent %}{{ itemContent(a,t) }}{{ itemContent(b,t) }}', {a: content(0, {invalidDayError: 'bad', invalidYearError: 'also'}), b: content(1), t: (key: string) => key === 'bad' ? '<img src=x alt="">' : key === 'also' ? 'Second & error' : formControlTranslate()(key)});
  const dom = new JSDOM(html);
  try {
    const doc = dom.window.document as Document; associations(doc);
    expect(doc.querySelectorAll('.govuk-error-message')).toHaveLength(1);
    expect(doc.querySelector('.govuk-error-message')!.textContent).toContain('<img src=x alt="">');
    expect(doc.querySelector('img')).toBeNull();
    expect(doc.querySelectorAll('.govuk-error-message br')).toHaveLength(1);
    expect(doc.querySelector('[id^="witnessStatement[1]"]')!.closest('.govuk-form-group')!.classList.contains('govuk-form-group--error')).toBe(false);
  } finally {dom.window.close();}
});

it.each(uploadPages)('does not attach an unrelated metadata error to the file input: %s', view => {
  const {formControlForm} = require('../../../utils/renderFormControls');
  const dom = new JSDOM(renderUploadPage(view, 'en', {form: formControlForm({}, {typeOfDocument: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT'})}));
  try {
    const doc = dom.window.document as Document; associations(doc);
    expect(doc.querySelector('[name="selectedFile"]')!.id).toBe('selectedFile');
    expect(doc.querySelector('[name="selectedFile"]')!.closest('.govuk-form-group')!.querySelector('.govuk-error-message')).toBeNull();
  } finally {dom.window.close();}
});
it.each(['ERRORS.VALID_SIZE_FILE','ERRORS.VALID_MIME_TYPE_FILE','ERRORS.FILE_UPLOAD_FAILED'])('preserves file-error targets even when metadata errors come first: %s', error => {
  const {formControlForm} = require('../../../utils/renderFormControls');
  for (const view of uploadPages) {
    const dom = new JSDOM(renderUploadPage(view, 'en', {form: formControlForm({}, {typeOfDocument: 'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT', fileUpload: error})}));
    try {
      const doc = dom.window.document as Document; associations(doc);
      const file = doc.querySelector('[name="selectedFile"]')!;
      expect(file.id).toBe('fileUpload');
      expect(file.getAttribute('aria-describedby')).toContain('fileUpload-error');
      expect(file.closest('.govuk-form-group')!.querySelectorAll('.govuk-error-message')).toHaveLength(1);
    } finally {dom.window.close();}
  }
});

it.each([
  'mock-case-1645882162449409-case-progression-upload-documents.html',
  'mock-case-1645882162449409-mediation-upload-documents.html',
])('keeps refreshed upload captures structurally associated: %s', filename => {
  const fs = require('fs');const path = require('path');
  const dom = new JSDOM(fs.readFileSync(path.resolve(__dirname,'../../../utils/mocks/a11y',filename),'utf8'));
  try {
    const doc = dom.window.document as Document;
    expect(doc.querySelectorAll('[data-module="cui-upload-rows"]').length).toBeGreaterThan(0);
    doc.querySelectorAll<HTMLElement>('[data-module="cui-upload-rows"]').forEach(root => {
      expect(root.querySelectorAll('.cui-upload-rows__item').length).toBeGreaterThan(0);
      const ids = [...root.querySelectorAll('[id]')].map(e => e.id);
      expect(new Set(ids).size).toBe(ids.length);
      root.querySelectorAll<HTMLInputElement>('input[type=file]').forEach(file => {
        expect(file.name.startsWith(root.dataset.uploadCategory! + '[')).toBe(true);
        expect(root.querySelector(`label[for="${file.id}"]`)).not.toBeNull();
      });
      root.querySelectorAll('[aria-describedby],[for]').forEach(field => {
        for (const a of ['aria-describedby','for']) (field.getAttribute(a)||'').split(/\s+/).filter(Boolean).forEach(id => expect(doc.getElementById(id)).not.toBeNull());
      });
      root.querySelectorAll<HTMLButtonElement>('button[name=action]').forEach(button => expect(button.type).toBe('submit'));
    });
  } finally {dom.window.close();}
});

it('matches the case-progression capture row and server actions to the actual caller', () => {
  const fs = require('fs');const path = require('path');
  const capture = new JSDOM(fs.readFileSync(path.resolve(__dirname, '../../../utils/mocks/a11y/mock-case-1645882162449409-case-progression-upload-documents.html'), 'utf8'));
  const actual = new JSDOM(renderRepeatedUpload('en', false, 1));
  try {
    const selector = '[data-upload-category="witnessStatement"]';
    const root = capture.window.document.querySelector(selector) as HTMLElement;
    const expected = actual.window.document.querySelector(selector) as HTMLElement;
    expect(root.closest('.caseProgression')).not.toBeNull();
    expect(root.querySelectorAll(':scope > .cui-upload-rows__item')).toHaveLength(1);
    const controls = (element: HTMLElement) => [...element.querySelectorAll<HTMLInputElement>('input,button')]
      .map(control => [control.tagName, control.name, control.type, control.id, control.tagName === 'BUTTON' ? control.value : undefined]);
    expect(controls(root)).toEqual(controls(expected));
    const add = root.querySelector<HTMLButtonElement>('.cui-upload-rows__add-button')!;
    expect([add.type, add.name, add.value]).toEqual(['submit', 'action', 'add_another-witness']);
    expect(root.querySelector(':scope > fieldset > legend')!.textContent!.trim()).toBe(expected.querySelector(':scope > fieldset > legend')!.textContent!.trim());
    expect(root.querySelector<HTMLButtonElement>('button[value="witnessStatement[0][uploadButton]"]')!.id).toBe('witnessStatement-0-upload-button');
    root.querySelectorAll<HTMLInputElement>('input[name]:not([type=file])').forEach(input => expect(input.value).toBe(''));
    associations(capture.window.document);
  } finally {capture.window.close();actual.window.close();}
});

it.each(['documentsForYourStatement', 'documentsForDocumentsReferred'])('keeps distinct row and date legends in the mediation capture: %s', category => {
  const fs = require('fs');const path = require('path');
  const capture = new JSDOM(fs.readFileSync(path.resolve(__dirname, '../../../utils/mocks/a11y/mock-case-1645882162449409-mediation-upload-documents.html'), 'utf8'));
  const actual = new JSDOM(renderRepeatedUpload('en', true, 1));
  try {
    const selector = `[data-upload-category="${category}"] > .cui-upload-rows__item`;
    const row = capture.window.document.querySelector(selector) as HTMLElement;
    const expected = actual.window.document.querySelector(selector) as HTMLElement;
    expect(row.querySelectorAll(':scope > legend')).toHaveLength(1);
    const rowLegend = row.querySelector(':scope > legend')!;
    expect(rowLegend.classList.contains('govuk-visually-hidden')).toBe(true);
    expect(rowLegend.textContent!.trim()).toBe(expected.querySelector(':scope > legend')!.textContent!.trim());
    const dateLegend = row.querySelector('fieldset[role="group"] > legend')!;
    expect(dateLegend.className).toBe(expected.querySelector('fieldset[role="group"] > legend')!.className);
    expect(dateLegend.textContent!.trim()).toBe(expected.querySelector('fieldset[role="group"] > legend')!.textContent!.trim());
    expect(dateLegend.classList.contains('govuk-visually-hidden')).toBe(false);
  } finally {capture.window.close();actual.window.close();}
});

it.each(['mimetype','size','buffer'])('renders nested file errors on the correct control without marking a subsequent valid row: %s', field => {
  const {GenericForm} = require('form/models/genericForm');
  const {UploadDocumentsUserForm} = require('models/caseProgression/uploadDocumentsUserForm');
  const {buildDisclosureDocumentSection} = require('services/features/caseProgression/disclosureContentBuilder');
  const {uploadRow} = require('../../../utils/renderUploadForms');
  const form = new GenericForm(new UploadDocumentsUserForm(), [{property:'documentsForDisclosure',children:[{property:'0',children:[{property:'fileUpload',children:[{property:field,constraints:{fixture:'ERRORS.VALID_SIZE_FILE'}}]}]}]}]);
  const env = formControlsEnvironment();
  const dom = new JSDOM(env.renderString('{% from "features/dashboard/claim-summary-content.njk" import claimSummaryContent %}{{ claimSummaryContent({contentSections: a},t) }}{{ claimSummaryContent({contentSections: b},t) }}', {a:buildDisclosureDocumentSection(uploadRow(0),0,form),b:buildDisclosureDocumentSection(uploadRow(1),1,form),t:formControlTranslate()}));
  try {
    const doc = dom.window.document as Document;associations(doc);
    expect(doc.querySelector('[name="documentsForDisclosure[0][fileUpload]"]')!.closest('.govuk-form-group')!.querySelector('.govuk-error-message')).not.toBeNull();
    expect(doc.querySelector('[name="documentsForDisclosure[1][fileUpload]"]')!.closest('.govuk-form-group')!.querySelector('.govuk-error-message')).toBeNull();
  } finally {dom.window.close();}
});
