import fs from 'fs';
import path from 'path';
import {JSDOM} from 'jsdom';
import {GenericForm} from 'form/models/genericForm';
import {AcceptDefendantOffer} from 'models/generalApplication/response/acceptDefendantOffer';
import {formControlContext, formControlTranslate} from '../../../utils/renderFormControls';
import {renderProductionPage} from '../../../utils/renderProductionPage';

const directory = path.resolve('src/test/utils/mocks/a11y');

const numericFields = [{view: 'features/generalApplication/response/accept-defendant-offer.njk', field: ['amountPerMonth'], name: 'amountPerMonth', model: () => new AcceptDefendantOffer()}];
describe('PR6 form control recovery', () => {
  it.each(numericFields.flatMap(input => ['en', 'cy'].flatMap(language =>
    [undefined, null, 0, 25, 'invalid-number', NaN].map(value => ({...input, language, value})),
  )))('preserves the raw $name attribute in $view ($language, $value)', ({view, field, name, model: makeModel, language, value}) => {
    const locals = formControlContext(view, language, 'yes');
    const model = makeModel ? makeModel() : locals.form.model;
    let target = model as unknown as Record<string, unknown>;
    for (const key of field.slice(0, -1)) target = target[key] as Record<string, unknown>;
    target[field[field.length - 1]] = value;
    const dom = new JSDOM(renderProductionPage(view, {...locals, form: new GenericForm(model)}, language));
    try {
      const input = dom.window.document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
      expect(input).not.toBeNull();
      expect(input.getAttribute('value') ?? '').toBe(value == null ? '' : String(value));
      expect(input.type).toBe('number');
      expect(input.form!.method).toBe('post');
      expect(input.form!.querySelector('input[name="_csrf"]')).not.toBeNull();
    } finally {dom.window.close();}
  });

  it.each(['en', 'cy'])('uses the respondent agreement title without relying on a controller pageTitle (%s)', language => {
    const locals = formControlContext('features/generalApplication/respondent-agreement.njk', language);
    const dom = new JSDOM(renderProductionPage('features/generalApplication/respondent-agreement.njk', {...locals, pageTitle: undefined}, language));
    try {
      expect(dom.window.document.title).toContain(formControlTranslate(language)('PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE'));
      expect(dom.window.document.querySelector('form')!.method).toBe('post');
    } finally {dom.window.close();}
  });

});

it.each([
  {file: 'mock-case-1645882162449409-response-general-application-1720536653906339-accept-defendant-offer.html', names: ['amountPerMonth']},
])('keeps missing captured numeric attributes blank: $file', ({file, names}) => {
  const dom = new JSDOM(fs.readFileSync(path.join(directory, file), 'utf8'));
  try {
    for (const name of names) {
      const input = dom.window.document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
      expect(input).not.toBeNull();
      expect(input.getAttribute('value') ?? '').toBe('');
    }
  } finally {dom.window.close();}
});

it('gives the respondent-agreement capture the page-specific title', () => {
  const file = 'mock-case-1645882162449409-response-general-application-1720536653906339-respondent-agreement.html';
  const dom = new JSDOM(fs.readFileSync(path.join(directory, file), 'utf8'));
  try {
    expect(dom.window.document.title).toContain(formControlTranslate('en')('PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE'));
  } finally {dom.window.close();}
});
