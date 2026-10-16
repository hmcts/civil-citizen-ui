import {JSDOM} from 'jsdom';
import {readFileSync} from 'fs';
import path from 'path';
import {parse} from 'qs';
import {GenericForm} from 'common/form/models/genericForm';
import {UnavailableDateType, UnavailableDates} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';
import {remainingPages, RemainingEditor, removableEditors, renderRemainingPage, interpretRemainingBody, remainingForm, dateEditors} from '../../../utils/renderRemainingRepeatedRows';
import {formControlsEnvironment, formControlTranslate} from '../../../utils/renderFormControls';

describe.each(Object.keys(remainingPages) as RemainingEditor[])('%s production template contract', editor => {
  it.each(['en', 'cy'])('preserves blank/saved/error controls and actual submitted model (%s)', language => {
    for (const state of ['blank', 'saved', 'error'] as const) {
      const dom = new JSDOM(renderRemainingPage(editor, {language, state}));
      try {
        const doc = dom.window.document, form = doc.querySelector('form'), root = doc.querySelector('[data-module="cui-append-row"]');
        expect(root).not.toBeNull();expect(form.method).toBe('post');expect(form.querySelector<HTMLInputElement>('[name=_csrf]').value).toBe('fixture-csrf');
        const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);expect(new Set(ids).size).toBe(ids.length);
        doc.querySelectorAll('label[for]').forEach(label => expect(doc.getElementById(label.getAttribute('for'))).not.toBeNull());
        if (!removableEditors.includes(editor)) expect(root.querySelectorAll('.remove-row')).toHaveLength(0);
        const add = root.querySelector<HTMLButtonElement>('.append-row');
        if (editor === 'gaDates') {expect(add.type).toBe('submit');expect(add.name).toBe('action');expect(add.value).toBe('add_another-unavailableDates');expect(add.hidden).toBe(false);}
        else {expect(add.type).toBe('button');expect(add.hidden).toBe(true);}
        const params = new URLSearchParams();new dom.window.FormData(form).forEach((value, key) => params.append(key, String(value)));
        const body = parse(params.toString());const model = interpretRemainingBody(editor, body);
        expect(model).toBeDefined();expect(doc.querySelector('button[type=submit],button:not([type])')).not.toBeNull();
        if (state === 'saved') {
          const json = JSON.stringify(model);expect(json).toContain(editor.endsWith('Dates') ? 'SINGLE_DATE' : editor === 'banks' ? 'CURRENT_ACCOUNT' : editor === 'income' || editor === 'expenses' ? 'Source 0' : editor === 'amount' ? 'Reason 0' : editor === 'debts' ? 'Debt 0' : editor === 'employers' ? 'Employer 0' : 'Event 0');
        }
        if (editor === 'defendantTimeline') {expect(doc.body.textContent).toContain('Opponent event retained');expect(doc.querySelector<HTMLTextAreaElement>('[name=comment]').value).toBe('Preserved separate comment');}
        if (editor === 'gaDates' && state !== 'blank') doc.querySelectorAll<HTMLButtonElement>('.remove-row').forEach((button, index) => {expect(button.type).toBe('submit');expect(button.name).toBe('action');expect(button.value).toBe(`remove-unavailableDates${index}`);});
      } finally {dom.window.close();}
    }
  });
});

it('preserves the defendant timeline PDF fallback', () => {
  const dom = new JSDOM(renderRemainingPage('defendantTimeline', {pdf: true}));
  try {expect(dom.window.document.querySelector('#timeline-link').getAttribute('href')).toBe('/local-opponent-timeline.pdf');}finally{dom.window.close();}
});

describe('repeated-row captures preserve production heading descriptions', () => {
  const cases: [string, RemainingEditor, string[]][] = [
    ['mock-claim-amount.html', 'amount', ['claim-reason-heading', 'claim-amount-heading']],
    ['mock-claim-timeline.html', 'claimantTimeline', ['timeline-description-heading']],
    ['mock-case-1645882162449409-response-timeline.html', 'defendantTimeline', ['timeline-description-heading']],
  ];

  it.each(cases)('%s', (capture, editor, headingIds) => {
    const filename = path.resolve(__dirname, '../../../utils/mocks/a11y', capture);
    const captured = new JSDOM(readFileSync(filename, 'utf8'));
    const actual = new JSDOM(renderRemainingPage(editor, {language: 'en', count: 4, state: 'saved'}));
    try {
      const doc = captured.window.document;
      const references = (element: Element) => element.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean) || [];
      const describedFields = (document: Document, id: string) => [...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[aria-describedby], textarea[aria-describedby]')]
        .filter(field => references(field).includes(id)).map(field => field.name);

      headingIds.forEach(id => {
        const expectedHeading = actual.window.document.getElementById(id);
        expect(expectedHeading).not.toBeNull();
        const headings = [...doc.querySelectorAll('[id]')].filter(element => element.id === id);
        expect(headings).toHaveLength(1);
        expect(headings[0].textContent.replace(/\s+/g, ' ').trim())
          .toBe(expectedHeading.textContent.replace(/\s+/g, ' ').trim());
        const expectedFields = describedFields(actual.window.document, id);
        expect(expectedFields).toHaveLength(4);
        expect(describedFields(doc, id)).toEqual(expectedFields);
      });

      doc.querySelectorAll('[aria-describedby]').forEach(element => {
        references(element).forEach(id => {
          expect([...doc.querySelectorAll('[id]')].filter(target => target.id === id)).toHaveLength(1);
        });
      });
    } finally {
      captured.window.close();
      actual.window.close();
    }
  });
});

describe.each(dateEditors)('%s date error presentation', editor => {
  describe.each(['en', 'cy'])('%s', language => {
    let dom: JSDOM;
    afterEach(() => dom?.window.close());

    function expectNoDateErrors() {
      const doc = dom.window.document;
      doc.querySelectorAll('.govuk-date-input').forEach(date => {
        const group = date.closest('.govuk-form-group');
        expect(group.classList.contains('govuk-form-group--error')).toBe(false);
        expect(group.querySelector('.govuk-error-message')).toBeNull();
        expect(date.querySelector('.govuk-input--error')).toBeNull();
        group.querySelectorAll('[aria-describedby]').forEach(element => {
          const descriptions = element.getAttribute('aria-describedby').split(/\s+/);
          expect(descriptions.some(id => id.endsWith('-error'))).toBe(false);
        });
      });
    }

    function invalidPeriod(side: 'start' | 'end') {
      const date = new Date();
      date.setDate(date.getDate() + 10);
      const valid = {day: String(date.getDate()), month: String(date.getMonth() + 1), year: String(date.getFullYear())};
      const period = {start: valid, end: valid, [side]: {...valid, day: '32', month: '13'}};
      const model = interpretRemainingBody(editor, {items: [{type: UnavailableDateType.LONGER_PERIOD, period}]}) as UnavailableDates;
      const form = new GenericForm(model);
      form.validateSync();
      return form;
    }

    it('does not render date errors on the initial blank form', () => {
      const form = remainingForm(editor, 1, 'blank');
      expect(form.hasErrors()).toBe(false);
      dom = new JSDOM(renderRemainingPage(editor, {language, form}));
      expectNoDateErrors();
    });

    it('does not render date errors for validated single dates and periods', () => {
      const form = remainingForm(editor, 2, 'saved');
      form.validateSync();
      expect(form.getAllErrors()).toEqual([]);
      dom = new JSDOM(renderRemainingPage(editor, {language, form}));
      expectNoDateErrors();
    });

    it('keeps an unrelated type error on the radios without marking dates invalid', () => {
      const form = remainingForm(editor, 1, 'blank');
      form.validateSync();
      expect(form.errorFor('items[0][type]')).toBeTruthy();
      dom = new JSDOM(renderRemainingPage(editor, {language, form}));
      expect(dom.window.document.querySelector('.govuk-error-message')?.textContent)
        .toContain(formControlTranslate(language)(form.errorFor('items[0][type]')));
      expectNoDateErrors();
    });

    it.each(['start', 'end'] as const)('keeps ordered %s errors and leaves the other period date unmarked', side => {
      const form = invalidPeriod(side);
      const keys = ['Day', 'Month'].map(part => form.errorFor(`items[0][${side}${part}]`));
      keys.forEach(key => expect(key).toBeTruthy());
      dom = new JSDOM(renderRemainingPage(editor, {language, form}));
      const doc = dom.window.document;
      const suffix = side === 'start' ? 'from' : 'until';
      const error = doc.getElementById(`items[0][${suffix}]-error`);
      expect(error).not.toBeNull();
      const messages = keys.map(key => formControlTranslate(language)(key));
      messages.forEach(message => expect(error.textContent).toContain(message));
      expect(error.textContent.indexOf(messages[0])).toBeLessThan(error.textContent.indexOf(messages[1]));
      expect(error.querySelectorAll('br')).toHaveLength(1);
      expect(error.querySelector('.govuk-error-message')).toBeNull();
      expect(error.closest('.govuk-form-group').classList.contains('govuk-form-group--error')).toBe(true);
      expect(doc.getElementById(`items[0][${side === 'start' ? 'until' : 'from'}]-error`)).toBeNull();
      const date = doc.getElementById(`items[0][${suffix}]`);
      expect([...date.querySelectorAll<HTMLInputElement>('.govuk-input--error')].map(input => input.name))
        .toEqual(['day', 'month'].map(part => `items[0][period][${side}][${part}]`));
      expect(doc.getElementById(`items[0][${side === 'start' ? 'until' : 'from'}]`).querySelector('.govuk-input--error')).toBeNull();
      expect(doc.getElementById(`items[0][${suffix}]`).closest('fieldset').getAttribute('aria-describedby').split(/\s+/)).toContain(error.id);
    });

    it('escapes translated date messages while retaining their line breaks', () => {
      const form = invalidPeriod('start');
      const env = formControlsEnvironment();
      env.addGlobal('UnavailableDateType', UnavailableDateType);
      const translate = formControlTranslate(language);
      const keys = ['startDay', 'startMonth'].map(property => form.errorFor(`items[0][${property}]`));
      const messages = keys.map(key => `<em>${translate(key)}</em>`);
      dom = new JSDOM(env.renderString('{% from "macro/unavailable-date-row.njk" import unavailableDateRow %}{{ unavailableDateRow(date, "PAGES.GENERAL_APPLICATION.UNAVAILABLE_HEARING_DATES.SELECT", 0, errorFor, t, {}, today, false) }}', {
        date: form.model.items[0], errorFor: form.errorFor.bind(form), today: new Date(),
        t: (key: string, values?: Record<string, unknown>) => {
          expect(key).toBeTruthy();
          return keys.includes(key) ? `<em>${translate(key, values)}</em>` : translate(key, values);
        },
      }));
      const error = dom.window.document.getElementById('items[0][from]-error');
      expect(error.querySelector('em')).toBeNull();
      messages.forEach(message => expect(error.textContent).toContain(message));
      expect(error.querySelectorAll('br')).toHaveLength(1);
    });
  });
});

describe('unavailable-date captures preserve blank-template input error styling', () => {
  const cases: [string, RemainingEditor][] = [
    ['directions-questionnaire-availability-dates', 'dqDates'],
    ['mediation-unavailable-dates', 'mediationDates'],
    ['general-application-unavailable-dates', 'gaDates'],
    ['response-general-application-1720536653906339-unavailable-dates', 'gaDates'],
  ];

  it.each(cases)('%s', (capture, editor) => {
    const filename = path.resolve(__dirname, '../../../utils/mocks/a11y', `mock-case-1645882162449409-${capture}.html`);
    const captured = new JSDOM(readFileSync(filename, 'utf8'));
    const actual = new JSDOM(renderRemainingPage(editor, {count: 1, state: 'blank'}));
    try {
      const dateInputs = (doc: Document) => [...doc.querySelectorAll<HTMLInputElement>('.govuk-date-input input')].map(input => ({
        id: input.id,
        name: input.name,
        hasError: input.classList.contains('govuk-input--error'),
      }));
      const expected = dateInputs(actual.window.document);
      expect(expected).toHaveLength(9);
      expect(expected.every(input => !input.hasError)).toBe(true);
      expect(dateInputs(captured.window.document)).toEqual(expected);
    } finally {
      captured.window.close();
      actual.window.close();
    }
  });
});
