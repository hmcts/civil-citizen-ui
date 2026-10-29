import {readFileSync} from 'fs';
import {JSDOM} from 'jsdom';
import {GenericForm} from 'common/form/models/genericForm';
import {CreateQuery} from 'models/queryManagement/createQuery';
import {uploadContext} from '../../../utils/renderUploadForms';
import {formControlTranslate} from '../../../utils/renderFormControls';
import {renderProductionPage} from '../../../utils/renderProductionPage';

it.each([
  {year: '', month: '', day: '', target: 'day'},
  {year: '2099', month: '2', day: '40', target: 'day'},
  {year: '10', month: '13', day: '40', target: 'day'},
])('query date errors use one escaped paragraph and activate a real input: %p', ({year, month, day, target}) => {
  for (const language of ['en', 'cy']) {
    const form = new GenericForm(new CreateQuery('Subject', 'Details', 'yes', year, month, day));
    form.validateSync();
    expect(form.hasErrors()).toBe(true);
    const messages = form.getAllErrors().map(error => formControlTranslate(language)(error.text));
    const dom = new JSDOM(renderProductionPage('features/queryManagement/createQuery.njk', {...uploadContext(language), form}, language), {runScripts: 'outside-only'});
    try {
      const {window} = dom; const document = window.document;
      const inline = document.getElementById('date-error')!;
      expect(inline).not.toBeNull();
      expect(inline.querySelector('p, .govuk-error-message')).toBeNull();
      const visible = inline.cloneNode(true) as Element;
      visible.querySelector('.govuk-visually-hidden')?.remove();
      expect(visible.textContent!.replace(/\s+/g, ' ').trim()).toBe(messages.join(' '));
      expect(document.querySelectorAll('.govuk-error-message')).toHaveLength(1);
      expect(document.querySelector(`#${target}`)!.closest('fieldset')!.getAttribute('aria-describedby')).toContain('date-error');
      window.HTMLElement.prototype.scrollIntoView = jest.fn();
      document.body.classList.add('govuk-frontend-supported');
      window.eval(readFileSync(require.resolve('govuk-frontend/dist/govuk/components/error-summary/error-summary.bundle.js'), 'utf8'));
      const {ErrorSummary} = (window as unknown as {GOVUKFrontend: {ErrorSummary: new (root: Element, config: {disableAutoFocus: boolean}) => unknown}}).GOVUKFrontend;
      new ErrorSummary(document.querySelector('.govuk-error-summary')!, {disableAutoFocus: true});
      const link = document.querySelector<HTMLAnchorElement>(`.govuk-error-summary a[href="#${target}"]`)!;
      expect(link).not.toBeNull(); link.focus(); link.click();
      expect(document.activeElement).toBe(document.getElementById(target));
      expect(document.querySelector('input[name="day"]')!.getAttribute('value')).toBe(String(form.model.day));
    } finally {dom.window.close();}
  }
});

it('escapes query date messages before composing trusted line breaks', () => {
  const form = new GenericForm(new CreateQuery('Subject', 'Details', 'yes', '10', '13', '40'));
  form.validateSync();
  const translate = formControlTranslate('en');
  const t = (key: string) => key === 'ERRORS.QUERY_MANAGEMENT.VALID_DAY' ? 'Bad <em>day</em> & details' : translate(key);
  const dom = new JSDOM(renderProductionPage('features/queryManagement/createQuery.njk', {...uploadContext(), form, t}));
  try {
    const inline = dom.window.document.getElementById('date-error')!;
    expect(inline.textContent).toContain('Bad <em>day</em> & details');
    expect(inline.querySelector('em, p')).toBeNull();
    expect(inline.querySelectorAll('br')).toHaveLength(2);
  } finally {dom.window.close();}
});
