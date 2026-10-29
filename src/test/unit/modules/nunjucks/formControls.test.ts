import {JSDOM} from 'jsdom';
import {formControlForm, formControlsEnvironment, formControlTranslate} from '../../../utils/renderFormControls';

const render = (params?: Record<string, unknown>, title = 'Question <ordinary>', model: Record<string, unknown> = {}, errors: Record<string, string> = {}, description = '') => {
  const html = formControlsEnvironment().renderString('{% from "macro/yesNoGenericForm.njk" import yesNoRadioButton %}{{ yesNoRadioButton(t, "option", "option", title, form, description, params) }}', {t: formControlTranslate(), title, form: formControlForm(model, errors), description, params});
  return new JSDOM(html);
};

describe('shared yes/no official component contract', () => {
  let dom: JSDOM;
  afterEach(() => dom?.window.close());
  it.each([undefined, {}])('retains omitted/default legend options: %j', params => {
    dom = render(params);
    expect(dom.window.document.querySelector('legend h1')?.textContent.trim()).toBe('Question <ordinary>');
    expect(dom.window.document.querySelector('legend')?.classList.contains('govuk-fieldset__legend--l')).toBe(true);
    expect(dom.window.document.querySelector('ordinary')).toBeNull();
  });
  it('honours explicit false and caller classes', () => {
    dom = render({isPageHeading: false, legendClasses: 'govuk-visually-hidden'});
    expect(dom.window.document.querySelector('h1')).toBeNull();
    expect(dom.window.document.querySelector('legend')?.classList.contains('govuk-visually-hidden')).toBe(true);
  });
  it('honours an explicitly empty legend class', () => {
    dom = render({legendClasses: '', isPageHeading: false});
    expect(dom.window.document.querySelector('legend')?.classList.contains('govuk-fieldset__legend--l')).toBe(false);
  });
  it.each(['', null])('does not invent a group for absent titles: %j', title => {
    dom = render({}, title);
    expect(dom.window.document.querySelectorAll('input[type=radio]')).toHaveLength(2);
    expect(dom.window.document.querySelector('fieldset')).toBeNull();
  });
  it.each(['yes', 'no'])('retains %s values, IDs and selections', option => {
    dom = render({}, 'Question', {option});
    const doc = dom.window.document;
    expect([...doc.querySelectorAll('input')].map(input => [input.name, input.id, input.value])).toEqual([['option', 'option', 'yes'], ['option', 'option-2', 'no']]);
    expect(doc.querySelector<HTMLInputElement>('input:checked')?.value).toBe(option);
    doc.querySelectorAll('label').forEach(label => expect(doc.getElementById(label.htmlFor)).not.toBeNull());
  });
  it('retains custom translations, item/group hints and conditional content', () => {
    dom = render({yes: 'COMMON.YES', no: 'COMMON.NO', yesHint: 'Yes hint', noHint: 'No hint', yesHtml: '<input id="details" name="details" value="saved">', noHtml: '<p id="explanation">Explanation</p>'}, 'Question', {option: 'yes'}, {}, 'Group hint');
    const doc = dom.window.document;
    expect(doc.querySelector<HTMLFieldSetElement>('fieldset')?.getAttribute('aria-describedby')).toBe('option-hint');
    expect(doc.getElementById('option-hint')?.textContent.trim()).toBe('Group hint');
    expect(doc.querySelector<HTMLInputElement>('#details')?.value).toBe('saved');
    expect(doc.querySelector('#conditional-option')?.classList.contains('govuk-radios__conditional--hidden')).toBe(false);
    for (const element of doc.querySelectorAll('[aria-describedby], [data-aria-controls]')) {
      const refs = (element.getAttribute('aria-describedby') || element.getAttribute('data-aria-controls')).split(/\s+/);
      refs.forEach(id => expect(doc.getElementById(id)).not.toBeNull());
    }
  });
  it('retains group errors and caller error overrides', () => {
    dom = render({errorMessageText: 'Specific error'}, 'Question', {}, {option: 'ERRORS.VALID_YES_NO_OPTION'});
    expect(dom.window.document.querySelector('#option-error')?.textContent).toContain('Specific error');
    expect(dom.window.document.querySelector('fieldset')?.getAttribute('aria-describedby')).toContain('option-error');
  });
});
