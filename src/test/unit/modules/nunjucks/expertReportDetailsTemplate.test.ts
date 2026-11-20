import {JSDOM} from 'jsdom';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {YesNo} from 'common/form/models/yesNo';
import {formControlsEnvironment, formControlTranslate} from '../../../utils/renderFormControls';

const view = 'features/directionsQuestionnaire/experts/expert-report-details.njk';

describe.each(['en', 'cy'])('expert-report question (%s)', language => {
  let dom: JSDOM;
  const t = formControlTranslate(language);

  afterEach(() => dom?.window.close());

  function render(form: GenericForm<GenericYesNo>) {
    dom = new JSDOM(formControlsEnvironment().render(view, {
      form, t, lang: language, csrf: 'fixture-csrf',
      pageTitle: 'PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE',
    }));
    return dom.window.document;
  }

  it.each([undefined, YesNo.YES, YesNo.NO])('preserves the form and saved answer %s', option => {
    const document = render(new GenericForm(new GenericYesNo(option)));
    const form = document.querySelector('form');
    expect(form?.getAttribute('method')).toBe('post');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelector('h1')?.textContent.trim()).toBe(t('PAGES.EXPERT_REPORT_DETAILS.TITLE'));

    const radios = [...document.querySelectorAll<HTMLInputElement>('input[type="radio"][name="option"]')];
    expect(radios.map(radio => radio.value)).toEqual([YesNo.YES, YesNo.NO]);
    expect(radios.map(radio => radio.labels?.[0]?.textContent.trim())).toEqual([t('COMMON.YES'), t('COMMON.NO')]);
    expect(radios.filter(radio => radio.checked).map(radio => radio.value)).toEqual(option ? [option] : []);
    expect(document.querySelector('button[type="submit"]')?.textContent.trim()).toBe(t('COMMON.BUTTONS.SAVE_AND_CONTINUE'));
    expect(Object.fromEntries(new dom.window.FormData(form))).toEqual({
      _csrf: 'fixture-csrf', ...(option ? {option} : {}),
    });
    expect(document.querySelector('.govuk-error-summary, .govuk-error-message')).toBeNull();
  });

  it.each(['ERRORS.EXPERT_REPORT_DETAILS_REQUIRED', 'ERRORS.EXPERT_REPORT_DETAILS_REQUIRED_CLAIMANT'])(
    'renders the model validation and a usable error link for %s', errorKey => {
      const form = new GenericForm(new GenericYesNo(undefined, errorKey));
      form.validateSync();
      const document = render(form);
      const errorLink = document.querySelector<HTMLAnchorElement>('.govuk-error-summary a');
      expect(errorLink?.textContent.trim()).toBe(t(errorKey));
      expect(errorLink?.getAttribute('href')).toBe('#option');
      expect(document.getElementById('option')?.getAttribute('name')).toBe('option');
      expect(document.querySelector('.govuk-error-message')?.textContent).toContain(t(errorKey));
      expect(document.querySelector('input[name="option"]:checked')).toBeNull();
      expect(document.querySelector<HTMLInputElement>('input[name="_csrf"]')?.value).toBe('fixture-csrf');
    },
  );
});
