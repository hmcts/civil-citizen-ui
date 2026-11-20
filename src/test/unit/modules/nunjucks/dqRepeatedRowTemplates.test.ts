import {JSDOM} from 'jsdom';
import {readFileSync} from 'fs';
import path from 'path';
import i18next from 'i18next';
import {Request} from 'express';
import {parse} from 'qs';
import {YesNo} from 'common/form/models/yesNo';
import {GenericForm} from 'common/form/models/genericForm';
import {OtherWitnesses} from 'common/models/directionsQuestionnaire/witnesses/otherWitnesses';
import {SupportRequiredList} from 'common/models/directionsQuestionnaire/supportRequired';
import {getOtherWitnessDetailsForm} from 'services/features/directionsQuestionnaire/otherWitnessesService';
import {getExpertDetailsForm} from 'services/features/directionsQuestionnaire/expertDetailsService';
import {generatePeopleListWithSelectedValues, getSupportRequiredForm} from 'services/features/directionsQuestionnaire/supportRequiredService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {dqClaim, dqForm, dqRepeatedPages, DqEditor, renderDqRepeatedPage, witnessRow} from '../../../utils/renderDqRepeatedRows';
import en from '../../../../main/modules/i18n/locales/en.json';
import cy from '../../../../main/modules/i18n/locales/cy.json';

jest.mock('modules/draft-store/draftStoreService');
let dom: JSDOM;
beforeAll(async () => {await i18next.init({lng: 'en', initAsync: false, resources: {en: {translation: en}, cy: {translation: cy}}});});
afterEach(() => {dom?.window.close();jest.clearAllMocks();});
const editors = Object.keys(dqRepeatedPages) as DqEditor[];

it('keeps the support capture page heading owned by the radio fieldset, matching the actual caller', () => {
  const filename = path.resolve(__dirname, '../../../utils/mocks/a11y/mock-case-1645882162449409-directions-questionnaire-support-required.html');
  const captured = new JSDOM(readFileSync(filename, 'utf8'));
  const actual = new JSDOM(renderDqRepeatedPage('support', {language: 'en', count: 1, carm: false}));
  try {
    const pageHeading = (doc: Document) => {
      const headings = doc.querySelectorAll('h1');
      expect(headings).toHaveLength(1);
      const fieldset = doc.getElementById('model[option]').closest('fieldset');
      expect(fieldset.querySelector(':scope > legend > h1')).toBe(headings[0]);
      return headings[0].textContent.replace(/\s+/g, ' ').trim();
    };
    expect(pageHeading(captured.window.document)).toBe(pageHeading(actual.window.document));
  } finally {
    captured.window.close();
    actual.window.close();
  }
});

function bodyFromForm() {
  const data = new dom.window.FormData(dom.window.document.querySelector('form'));
  const params = new URLSearchParams();data.forEach((value, name) => params.append(name, String(value)));
  return parse(params.toString());
}

describe.each(editors)('%s real template and submission preservation', editor => {
  describe.each(['en', 'cy'])('%s', language => {
    describe.each([false, true])('claimant=%s', claimant => {
      it.each([false, true])('preserves blank/saved/errors with CARM=%s', carm => {
        for (const [count, invalid] of [[0, false], [1, false], [3, false], [3, true]] as const) {
          dom = new JSDOM(renderDqRepeatedPage(editor, {language, claimant, carm, count, invalid}));
          const doc = dom.window.document,rows = [...doc.querySelectorAll('.cui-add-another__item')];
          expect(rows).toHaveLength(Math.max(1, count));
          expect(doc.querySelector('form')?.getAttribute('method')).toBe('post');
          expect(doc.querySelector<HTMLInputElement>('input[name=_csrf]')?.value).toBe('fixture-csrf');
          expect(doc.querySelector('button[type=submit]')).not.toBeNull();
          expect(doc.querySelectorAll('.row-container,.append-row,.remove-row,.moj-add-another__item')).toHaveLength(0);
          doc.querySelectorAll<HTMLButtonElement>('.cui-add-another__add-button,.cui-add-another__remove-button').forEach(button => expect(button.hidden).toBe(true));
          const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);expect(new Set(ids).size).toBe(ids.length);
          doc.querySelectorAll<HTMLLabelElement>('label[for]').forEach(label => expect(doc.getElementById(label.htmlFor)).not.toBeNull());
          doc.querySelectorAll('[aria-describedby],[data-aria-controls]').forEach(element => {
            for (const attribute of ['aria-describedby', 'data-aria-controls']) element.getAttribute(attribute)?.split(/\s+/).filter(Boolean).forEach(id => expect(doc.getElementById(id)).not.toBeNull());
          });
          rows.forEach(row => {
            const group = row.querySelector('fieldset') || row;
            expect(group.querySelector('legend')?.textContent.trim()).toBeTruthy();
            if (editor === 'support') expect(group.contains(row.querySelector('select'))).toBe(true);
          });
          doc.querySelectorAll('input,select,textarea').forEach(field => expect(field.hasAttribute('disabled')).toBe(false));
          doc.querySelectorAll<HTMLAnchorElement>('.govuk-error-summary a').forEach(link => expect(doc.getElementById(link.getAttribute('href').slice(1))).not.toBeNull());
          if (editor === 'support') {
            expect(doc.getElementById('model[option]')).not.toBeNull();
            expect(doc.body.textContent.includes(i18next.t('PAGES.SUPPORT_REQUIRED.MEDIATION_TEXT', {lng: language}))).toBe(carm);
            if (count) {
              const body = bodyFromForm();const model = getSupportRequiredForm({body} as Request);
              expect(model.items).toHaveLength(count);
              expect(model.items[0].fullName).toBe('Witness0 Example');
              expect(model.items[0].otherSupport.content).toBe('Support 0');
              expect(model.items[0].languageInterpreter.selected).toBe(true);
            }
          } else if (count) {
            const body = bodyFromForm();
            if (editor === 'witnesses') {
              const model = getOtherWitnessDetailsForm({body} as Request);expect(model).toHaveLength(count);expect(model[0].details).toBe('Saved event 0');
            } else {
              const model = getExpertDetailsForm(({body} as Request).body.items);expect(model.items).toHaveLength(count);expect(model.items[0].estimatedCost).toBe(25);
              expect(model.items[0].fieldOfExpertise).toBe('Specialism 0');
            }
          }
          dom.window.close();
        }
      });
    });
  });
});

it('preserves witness trimming, optional values, and error properties through the real model', () => {
  const model = getOtherWitnessDetailsForm({body: {option: 'yes', witnessItems: [{firstName: ' Alex ', lastName: ' Example ', details: 'Saw events', email: '', telephone: ''}]}} as Request);
  expect(model[0].firstName).toBe('Alex');expect(model[0].email).toBe('');
  const form = new GenericForm(new OtherWitnesses(YesNo.YES, [witnessRow()]));form.model.witnessItems[0].firstName = '';form.validateSync();
  expect(form.getAllErrors().some(error => error.property === 'witnessItems[0][firstName]' && Boolean(error.text))).toBe(true);
});

it('preserves expert trimming, optional values and cost conversion without changing business rules', () => {
  const form = getExpertDetailsForm(({body: {items: [{firstName: ' Alex ', lastName: ' Example ', fieldOfExpertise: 'Engineer', whyNeedExpert: 'Reason', emailAddress: '', phoneNumber: '', estimatedCost: '25.50'}]}} as Request).body.items);
  expect(form.items[0]).toMatchObject({firstName: 'Alex', lastName: 'Example', emailAddress: '', phoneNumber: '', estimatedCost: 25.5});
  const invalid = dqForm('experts', 1, true);expect(invalid.getAllErrors().some(error => error.property === 'items[0][firstName]' && Boolean(error.text))).toBe(true);
});

it.each(['disabledAccess', ['hearingLoop', 'otherSupport']])('preserves support declarations: %j', declared => {
  const model = getSupportRequiredForm({body: {option: 'yes', model: {items: [{fullName: 'Alex', declared, otherSupport: {content: 'Saved help'}}]}}} as Request);
  expect(model.items[0].fullName).toBe('Alex');
  if (Array.isArray(declared)) {expect(model.items[0].hearingLoop.selected).toBe(true);expect(model.items[0].otherSupport.content).toBe('Saved help');}
  else expect(model.items[0].disabledAccess.selected).toBe(true);
});

it('retains existing support No-answer handling', () => {
  const model = getSupportRequiredForm({body: {option: 'no'}} as Request);expect(model).toBeInstanceOf(SupportRequiredList);expect(model.option).toBe('no');expect(model.items).toHaveLength(1);expect(model.items[0].fullName).toBeUndefined();
});

it.each([false, true])('generates real party/witness/expert choices and saved selections (claimant=%s)', async claimant => {
  (getCaseDataFromStore as jest.Mock).mockResolvedValue(dqClaim(claimant));
  const lists = await generatePeopleListWithSelectedValues('local-claim', ['Witness0 Example', 'Expert0Example'], 'cy');
  expect(lists[0].map(item => item.value)).toEqual(['', claimant ? 'Claimant Citizen' : 'Defendant Citizen', 'Witness0 Example', 'Expert0 Example']);
  expect(lists[0].find(item => item.value === 'Witness0 Example').selected).toBe(true);expect(lists[1].find(item => item.value === 'Expert0 Example').selected).toBe(true);
  expect(lists[0][0].text).toBe(cy.PAGES.SUPPORT_REQUIRED.CHOOSE_NAME);
  dom = new JSDOM(renderDqRepeatedPage('support', {language: 'cy', claimant, peopleLists: lists}));
  expect([...dom.window.document.querySelectorAll<HTMLSelectElement>('select')].map(select => select.value)).toEqual(['Witness0 Example', 'Expert0 Example']);
});

// An empty saved list is distinct from an absent list in the existing service.
// The migration must not invent person choices absent from controller context.
it('preserves the service distinction between absent and empty support selections', async () => {
  (getCaseDataFromStore as jest.Mock).mockResolvedValue(dqClaim());
  expect(await generatePeopleListWithSelectedValues('local-claim', [], 'en')).toEqual([]);
  expect((await generatePeopleListWithSelectedValues('local-claim', undefined, 'en'))[0]).not.toHaveLength(0);
});
