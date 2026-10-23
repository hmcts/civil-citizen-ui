import {JSDOM} from 'jsdom';
import {readFileSync} from 'fs';
import {ClaimSummaryType} from 'common/form/models/claimSummarySection';
import {formatDocumentViewURL} from 'common/utils/formatDocumentURL';
import {configuredPresentationEnvironment, presentationFormContext, presentationFormViews, renderPresentation} from '../../../utils/renderPresentationPages';
import {formControlTranslate} from '../../../utils/renderFormControls';
import {Claim} from 'models/claim';
import {Defence} from 'form/models/defence';
import {CitizenResponseType} from 'form/models/citizenResponseType';
import {CaseState} from 'form/models/claimDetails';
import {GenericForm} from 'form/models/genericForm';
import {HowMuchContinueClaiming} from 'form/models/interest/howMuchContinueClaiming';
import {AcceptDefendantOffer} from 'models/generalApplication/response/acceptDefendantOffer';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {Unemployment} from 'form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentDetails} from 'form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from 'form/models/statementOfMeans/unemployment/otherDetails';

const text = (element: Element) => element.textContent!.replace(/\s+/g, ' ').trim();
const cells = (document: Document) => Array.from(document.querySelectorAll('tbody tr')).map(row => Array.from(row.querySelectorAll('td')).map(text));
function contracts(document: Document) {
  return Array.from(document.querySelectorAll('form')).map(form => ({
    action: form.getAttribute('action'), method: form.getAttribute('method'), enctype: form.getAttribute('enctype'),
    controls: Array.from(form.querySelectorAll<HTMLInputElement>('input, select, textarea, button')).map(control => ({
      tag: control.tagName, name: control.name, id: control.id, type: control.type, value: control.value,
      checked: control.matches('input') ? control.checked : undefined, disabled: control.disabled,
    })),
  }));
}
function associations(document: Document) {
  const ids = Array.from(document.querySelectorAll('[id]')).map(element => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const element of document.querySelectorAll('label[for], [aria-describedby], [aria-labelledby], [aria-controls]')) {
    for (const attr of ['for', 'aria-describedby', 'aria-labelledby', 'aria-controls']) {
      for (const id of (element.getAttribute(attr) || '').split(/\s+/).filter(Boolean)) expect(document.getElementById(id)).not.toBeNull();
    }
  }
}

describe('PR9 official presentation composition', () => {
  const numericFields: {view: string; field: string[]; name: string; model?: () => object}[] = [
    {view: 'features/claim/interest/how-much-continue-claiming.njk', field: ['dailyInterestAmount'], name: 'dailyInterestAmount', model: () => new HowMuchContinueClaiming()},
    {view: 'features/claimantResponse/ccj/repayment-plan-instalments.njk', field: ['amount'], name: 'amount'},
    {view: 'features/generalApplication/response/accept-defendant-offer.njk', field: ['amountPerMonth'], name: 'amountPerMonth', model: () => new AcceptDefendantOffer()},
    {view: 'features/response/admission/how-much-have-you-paid.njk', field: ['amount'], name: 'amount'},
    {view: 'features/response/admission/partialAdmission/how-much-do-you-owe.njk', field: ['amount'], name: 'amount'},
    ...['under11', 'between11and15', 'between16and19'].map(name => ({
      view: 'features/response/statementOfMeans/dependants/dependants.njk', field: ['numberOfChildren', name], name,
      model: () => new Dependants(true, new NumberOfChildren()),
    })),
    ...['years', 'months'].map(name => ({
      view: 'features/response/statementOfMeans/unemployment.njk', field: ['unemploymentDetails', name], name,
      model: () => new Unemployment(undefined, new UnemploymentDetails(), new OtherDetails()),
    })),
  ];
  it.each(numericFields.flatMap(input => ['en', 'cy'].flatMap(language =>
    [undefined, null, 0, 25, 'invalid-number', NaN].map(value => ({...input, language, value})),
  )))('preserves the raw $name attribute in $view ($language, $value)', ({view, field, name, model: makeModel, language, value}) => {
    const locals = presentationFormContext(view, language, 'saved');
    const model = makeModel ? makeModel() : locals.form.model;
    let target = model as unknown as Record<string, unknown>;
    for (const key of field.slice(0, -1)) target = target[key] as Record<string, unknown>;
    target[field[field.length - 1]] = value;
    const dom = new JSDOM(renderPresentation(view, {...locals, form: new GenericForm(model)}, language));
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
    const locals = presentationFormContext('features/generalApplication/respondent-agreement.njk', language);
    const dom = new JSDOM(renderPresentation('features/generalApplication/respondent-agreement.njk', {...locals, pageTitle: undefined}, language));
    try {
      expect(dom.window.document.title).toContain(formControlTranslate(language)('PAGES.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.TITLE'));
      expect(dom.window.document.querySelector('form')!.method).toBe('post');
    } finally {dom.window.close();}
  });

  it.each(['en', 'cy'])('renders ordered opponent timeline rows or a separate PDF fallback (%s)', language => {
    const view = 'features/response/timelineOfEvents/defendant-timeline.njk';
    const form = new GenericForm({rows: [], comment: 'Saved comment'});
    const rows = [
      {value: {timelineDate: '2024-01-01', timelineDescription: 'First <event>'}},
      {value: {timelineDate: '2024-02-02', timelineDescription: 'Second & last'}},
    ];
    for (const theirTimeline of [rows, []]) {
      const dom = new JSDOM(renderPresentation(view, {form, theirTimeline, pdfUrl: '/timeline.pdf', today: new Date('2026-10-22T00:00:00Z')}, language));
      try {
        const document = dom.window.document;
        if (theirTimeline.length) {
          expect(Array.from(document.querySelectorAll('tbody tr td:last-child')).map(text)).toEqual(['First <event>', 'Second & last']);
          expect(document.querySelectorAll('thead th[scope="col"]')).toHaveLength(2);
          expect(document.getElementById('timeline-link')).toBeNull();
        } else {
          expect(document.querySelector('table')).toBeNull();
          const link = document.getElementById('timeline-link')!;
          expect(link.getAttribute('href')).toBe('/timeline.pdf');
          expect(link.getAttribute('target')).toBe('_blank');
          expect(link.getAttribute('rel')).toContain('noopener');
          expect(link.closest('table')).toBeNull();
        }
        expect(document.querySelector('event')).toBeNull();
        expect(document.querySelector('textarea[name="comment"]')!.textContent).toBe('Saved comment');
      } finally {dom.window.close();}
    }
    const empty = new JSDOM(renderPresentation(view, {form, theirTimeline: [], today: new Date('2026-10-22T00:00:00Z')}, language));
    try {expect(empty.window.document.querySelector('table, #timeline-link')).toBeNull();} finally {empty.window.close();}
  });

  const yesNoPostCases = [
    {
      name: 'claim language', view: 'features/claim/claim-bilingual-language-preference.njk',
      errorKey: 'ERRORS.CLAIM_LANGUAGE_REQUIRED',
      messages: {en: 'Select which language you want to make your claim in', cy: 'Dewiswch ym mha iaith rydych chi eisiau gwneud eich cais'},
    },
    {
      name: 'response language', view: 'features/response/bilingual-language-preference.njk',
      errorKey: 'ERRORS.RESPONSE_LANGUAGE_REQUIRED',
      messages: {en: 'Select which language you want to respond to this claim in', cy: 'Dewiswch ym mha iaith rydych chi eisiau ymateb i’r hawliad hwn'},
    },
    {
      name: 'claimant expert report', view: 'features/directionsQuestionnaire/experts/expert-report-details.njk',
      claimState: CaseState.AWAITING_APPLICANT_INTENTION, errorKey: 'ERRORS.EXPERT_REPORT_DETAILS_REQUIRED_CLAIMANT',
      messages: {en: 'Select if you have already got an expert report or not', cy: 'Dewiswch a oes gennych adroddiad wedi’i ysgrifennu gan arbenigwr yn barod neu beidio'},
    },
    {
      name: 'defendant expert report', view: 'features/directionsQuestionnaire/experts/expert-report-details.njk',
      claimState: CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT, errorKey: 'ERRORS.EXPERT_REPORT_DETAILS_REQUIRED',
      messages: {en: "Select if you've already got an expert report or not", cy: 'Dewiswch a oes gennych adroddiad wedi’i ysgrifennu gan arbenigwr yn barod neu beidio'},
    },
    {
      name: 'applicant documents', view: 'features/generalApplication/want-to-upload-documents.njk',
      errorKey: 'ERRORS.GENERAL_APPLICATION.WANT_TO_UPLOAD_DOCUMENTS_YES_NO_SELECTION',
      messages: {
        en: 'You need to tell us if you want to upload documents to support your application. Choose option: Yes or No',
        cy: 'Mae arnoch angen dweud wrthym os ydych eisiau uwchlwytho dogfennau i gefnogi eich cais. Dewiswch opsiwn: Ydw neu Nac ydw',
      },
    },
    {
      name: 'respondent documents', view: 'features/generalApplication/response/respondent-want-to-upload-documents.njk',
      errorKey: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_WANT_TO_UPLOAD_DOC_YES_NO_SELECTION',
      // The current Welsh resource also supplies this English wording.
      messages: {
        en: 'You need to tell us if you want to upload documents to support your response. Choose Yes or No.',
        cy: 'You need to tell us if you want to upload documents to support your response. Choose Yes or No.',
      },
    },
    {
      name: 'hearing fee', view: 'features/caseProgression/hearingFee/apply-help-fee-selection.njk',
      errorKey: undefined,
      messages: {en: 'Please select Yes or No', cy: 'Dewiswch Oes neu Nac oes'},
    },
  ];
  it.each(yesNoPostCases.flatMap(testCase => (['en', 'cy'] as const).map(language => ({...testCase, language}))))(
    'uses the production invalid-POST yes/no error for $name ($language)', ({view, claimState, errorKey, messages, language}) => {
      const locals = presentationFormContext(view, language, 'error', {claimState});
      const message = messages[language];
      // Hearing-fee POST passes an already translated message to GenericYesNo.
      expect(locals.form.errorFor('option')).toBe(errorKey ?? message);
      const viewsDirectories = [undefined, ...(process.env.PR9_BASE_VIEWS ? [process.env.PR9_BASE_VIEWS] : [])];
      for (const viewsDirectory of viewsDirectories) {
        const dom = new JSDOM(renderPresentation(view, locals, language, viewsDirectory));
        try {
          const document = dom.window.document;
          expect(Array.from(document.querySelectorAll('.govuk-error-summary a')).map(text)).toEqual([message]);
          const inlineErrors = Array.from(document.querySelectorAll('.govuk-error-message')).map(element => {
            const visibleError = element.cloneNode(true) as Element;
            visibleError.querySelector('.govuk-visually-hidden')?.remove();
            return text(visibleError);
          });
          expect(inlineErrors).toEqual([message]);
        } finally {dom.window.close();}
      }
    },
  );

  it.each([
    ['en', "Select who you're making the claim for"],
    ['cy', "Dewiswch dros bwy rydych chi'n gwneud hawliad"],
  ])('uses the production invalid-POST claim-type error in both error locations (%s)', (language, message) => {
    const view = 'features/public/eligibility/claim-type.njk';
    const locals = presentationFormContext(view, language, 'error');
    expect(locals.form.errorFor('option')).toBe('ERRORS.CLAIM_TYPE_REQUIRED');
    const viewsDirectories = [undefined, ...(process.env.PR9_BASE_VIEWS ? [process.env.PR9_BASE_VIEWS] : [])];
    for (const viewsDirectory of viewsDirectories) {
      const dom = new JSDOM(renderPresentation(view, locals, language, viewsDirectory));
      try {
        const document = dom.window.document;
        expect(Array.from(document.querySelectorAll('.govuk-error-summary a')).map(text)).toEqual([message]);
        const inlineError = document.querySelector('#claimType-error');
        expect(inlineError).not.toBeNull();
        const visibleError = inlineError!.cloneNode(true) as Element;
        visibleError.querySelector('.govuk-visually-hidden')?.remove();
        expect(text(visibleError)).toBe(message);
      } finally {dom.window.close();}
    }
  });

  it.each(['en', 'cy'])('retains the signed-in Dynatrace correlation metadata in the dashboard shell (%s)', language => {
    const renderShell = (user?: {id?: string; email: string}) => new JSDOM(configuredPresentationEnvironment().renderString(
      '{% extends "claim-details-tpl-dashboard.njk" %}',
      {t: formControlTranslate(language), user, dynatraceUrl: 'https://dt.example/rum.js'},
    ));
    const signedIn = renderShell({id: 'citizen-id', email: 'citizen@example.com'});
    const anonymous = renderShell();
    const missingId = renderShell({email: 'citizen@example.com'});
    try {
      expect(signedIn.window.document.querySelectorAll('meta[name="dt-user-id"]')).toHaveLength(1);
      expect(signedIn.window.document.querySelector('meta[name="dt-user-id"]')!.getAttribute('content')).toBe('citizen-id');
      expect(signedIn.window.document.querySelector('script[src="https://dt.example/rum.js"]')).not.toBeNull();
      expect(signedIn.serialize()).not.toContain('citizen@example.com');
      expect(anonymous.window.document.querySelector('meta[name="dt-user-id"]')).toBeNull();
      expect(missingId.window.document.querySelector('meta[name="dt-user-id"]')).toBeNull();
    } finally {signedIn.window.close(); anonymous.window.close(); missingId.window.close();}
  });

  it.each(['en', 'cy'])('exercises the saved defence GET and the separate invalid POST context (%s)', language => {
    const view = 'features/response/your-defence.njk';
    const saved = presentationFormContext(view, language, 'saved');
    expect(saved.form.model).toBeInstanceOf(Claim);
    expect(saved.form.model.rejectAllOfClaim.defence.text).toBe('Saved defence & details');
    const invalid = presentationFormContext(view, language, 'error');
    expect(invalid.form.model).toBeInstanceOf(Defence);
    expect(invalid.form.model.text).toBe('');
    expect(invalid.form.errorFor('text')).toBe('ERRORS.DEFENCE_REQUIRED');
    const savedDom = new JSDOM(renderPresentation(view, saved, language));
    const invalidDom = new JSDOM(renderPresentation(view, invalid, language));
    try {
      expect(savedDom.window.document.querySelector<HTMLTextAreaElement>('textarea[name="text"]')!.value).toBe('Saved defence & details');
      expect(text(savedDom.window.document.querySelector('.show-more-block .content')!)).toBe('Saved claimant reason & details');
      expect(savedDom.window.document.body.textContent).toContain(saved.claimantName);
      expect(invalidDom.window.document.querySelector<HTMLTextAreaElement>('textarea[name="text"]')!.value).toBe('');
      expect(invalidDom.window.document.querySelector('#text-error')!.textContent).toContain(formControlTranslate(language)('ERRORS.DEFENCE_REQUIRED'));
    } finally {savedDom.window.close(); invalidDom.window.close();}
  });

  it.each(['en', 'cy'])('keeps the saved response in the GET model and characterises the inherited radio-selection gap (%s)', language => {
    const view = 'features/response/citizenResponseType/citizen-response-type.njk';
    const saved = presentationFormContext(view, language, 'saved');
    expect(saved.form.model).toBeInstanceOf(CitizenResponseType);
    expect(saved.form.model.responseType).toBe('FULL_ADMISSION');
    const invalid = presentationFormContext(view, language, 'error');
    expect(invalid.form.model.responseType).toBeUndefined();
    expect(invalid.form.errorFor('responseType')).toBe('ERRORS.RESPONSE_TYPE_REQUIRED');
    const dom = new JSDOM(renderPresentation(view, saved, language));
    try {
      expect(Array.from(dom.window.document.querySelectorAll<HTMLInputElement>('input[name="responseType"]')).map(input => input.value))
        .toEqual(['FULL_ADMISSION', 'PART_ADMISSION', 'FULL_DEFENCE']);
      // Both PR8 and PR9 read form.responseType instead of form.model.responseType.
      // Keep the saved model intact so comparisons expose this inherited behaviour.
      expect(dom.window.document.querySelectorAll('input[name="responseType"]:checked')).toHaveLength(0);
    } finally {dom.window.close();}
  });

  it.each(['en', 'cy'])('includes the production airline control, saved selection and invalid POST error (%s)', language => {
    const view = 'features/claim/airlines/flight-details.njk';
    for (const state of ['blank', 'saved', 'error']) {
      const locals = presentationFormContext(view, language, state);
      const dom = new JSDOM(renderPresentation(view, locals, language), {runScripts: 'outside-only'});
      try {
        const document = dom.window.document;
        const input = document.querySelector<HTMLInputElement>('input[name="airline"]')!;
        expect(input).not.toBeNull();
        expect(input.id).toBe('airline');
        expect(input.value).toBe(state === 'saved' ? 'Air Example' : '');
        expect(Array.from(document.querySelectorAll<HTMLOptionElement>('#airlines option')).map(option => option.value)).toEqual(['Air Example']);
        expect(document.body.textContent).toContain(formControlTranslate(language)('PAGES.FLIGHT_DETAILS.AIRLINE'));
        expect(input.classList.contains('govuk-input--error')).toBe(state === 'error');
        if (state === 'error') {
          const link = document.querySelector<HTMLAnchorElement>('.govuk-error-summary a[href="#airline"]')!;
          expect(link).not.toBeNull();
          expect(document.body.textContent).toContain(formControlTranslate(language)('ERRORS.FLIGHT_DETAILS.AIRLINE_REQUIRED'));
          dom.window.HTMLElement.prototype.scrollIntoView = jest.fn();
          document.body.classList.add('govuk-frontend-supported');
          dom.window.eval(readFileSync(require.resolve('govuk-frontend/dist/govuk/components/error-summary/error-summary.bundle.js'), 'utf8'));
          const {ErrorSummary} = (dom.window as unknown as {GOVUKFrontend: {ErrorSummary: new (root: Element, config: {disableAutoFocus: boolean}) => unknown}}).GOVUKFrontend;
          new ErrorSummary(document.querySelector('.govuk-error-summary')!, {disableAutoFocus: true});
          // The production datalist has aria-label rather than a separate label.
          // GOV.UK leaves its fragment navigation to the browser; JSDOM does not implement that focus change.
          expect(link.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, cancelable: true}))).toBe(true);
        }
      } finally {dom.window.close();}
    }
  });

  it.each(['en', 'cy'])('renders the production header, breadcrumbs and back-link precedence (%s)', language => {
    const html = configuredPresentationEnvironment().renderString('{% extends "claim-details-tpl-dashboard.njk" %}{% block nestedContent %}<h1>Content</h1>{% endblock %}', {
      t: formControlTranslate(language), lang: language, htmlLang: language, pageTitle: 'PAGES.DASHBOARD.PAGE_TITLE', dashboardUrl: '/dashboard?role=claimant',
    });
    const dom = new JSDOM(html); const document = dom.window.document;
    expect(document.querySelector('.govuk-header__homepage-link')!.getAttribute('href')).toBe('https://www.gov.uk');
    expect(Array.from(document.querySelectorAll('.govuk-service-navigation a')).map(a => a.getAttribute('href'))).toEqual(['/dashboard', '/dashboard', '/logout']);
    expect(document.querySelector('.govuk-breadcrumbs a')!.getAttribute('href')).toBe('/dashboard?role=claimant');
    expect(document.querySelectorAll('.govuk-breadcrumbs li')).toHaveLength(2);
    expect(document.querySelector('a[href*="ui-preview"]')).toBeNull();
    expect(document.querySelector('script[nonce]')).not.toBeNull();
    associations(document); dom.window.close();
    const back = new JSDOM(configuredPresentationEnvironment().renderString('{% extends "claim-details-tpl-dashboard.njk" %}', {t: formControlTranslate(language), backLinkUrl: '/previous', dashboardUrl: '/dashboard'}));
    expect(back.window.document.querySelector('.govuk-back-link')!.getAttribute('href')).toBe('/previous');
    expect(back.window.document.querySelector('.govuk-breadcrumbs')).toBeNull(); back.window.close();
  });

  it.each(['en', 'cy'])('preserves all ordered dashboard claims, draft expiry, amounts and status markup (%s)', language => {
    const item = (reference: string, amount: number) => ({claimNumber: reference, defendantName: 'Morgan <script> & Co', claimantName: 'Alex & Co', claimAmount: amount, getHref: () => '/claim/' + reference, getStatus: () => '<strong>Issued</strong>'});
    const locals = {claimsAsClaimant: [item('001', 123.45), item('002', 0)], claimsAsDefendant: [item('003', 456.78)],
      claimDraftSaved: {claimNumber: 'Draft', getHref: () => '/draft', getDraftClaimDeletionDate: () => '31 October 2026'}, newOcmcClaimUrl: '/new'};
    const html = renderPresentation('features/dashboard/dashboard.njk', locals, language); const dom = new JSDOM(html);
    const document = dom.window.document;
    expect(cells(document)).toHaveLength(4);
    expect(cells(document).slice(1).map(row => row.slice(0, 3))).toEqual([['001', 'Morgan <script> & Co', '£123.45'], ['002', 'Morgan <script> & Co', '£0.00'], ['003', 'Alex & Co', '£456.78']]);
    expect(cells(document)[0][3]).toContain('31 October 2026');
    expect(Array.from(document.querySelectorAll('.table-link')).map(a => a.getAttribute('href'))).toEqual(['/draft', '/claim/001', '/claim/002', '/claim/003']);
    expect(document.querySelectorAll('td strong')).toHaveLength(3);
    expect(document.querySelector('td script')).toBeNull(); associations(document);
    if (process.env.PR9_BASE_VIEWS) {
      const base = new JSDOM(renderPresentation('features/dashboard/dashboard.njk', locals, language, process.env.PR9_BASE_VIEWS));
      expect(cells(document)).toEqual(cells(base.window.document)); base.window.close();
    }
    dom.window.close();
  });

  it.each(['en', 'cy'])('preserves tab IDs, panel ordering, complete renderer content and link targets (%s)', language => {
    const tabContent = ['details', 'documents', 'history'].map((id, i) => ({id, label: 'COMMON.CLAIM_AMOUNT', panels: [{contentSections: [
      {type: ClaimSummaryType.PARAGRAPH, data: {text: `Panel ${i} & content`}},
      {type: ClaimSummaryType.NEW_TAB_BUTTON, data: {text: `Document ${i}`, href: `/documents/${i}?a=1&b=2`}},
    ]}]}));
    const claim = {totalClaimAmount: 100, legacyCaseReference: '001', getClaimantFullName: () => 'Alex', getDefendantFullName: () => 'Morgan'};
    const dom = new JSDOM(renderPresentation('features/dashboard/claim-summary.njk', {claim, tabContent, responseDetailsUrl: '/response'}, language));
    const document = dom.window.document;
    expect(document.querySelector('.govuk-tabs__title')!.textContent!.trim()).toBe(formControlTranslate(language)('PAGES.CLAIM_SUMMARY.ABOUT_CLAIM'));
    expect(Array.from(document.querySelectorAll('.govuk-tabs__tab')).map(a => a.getAttribute('href'))).toEqual(['#details', '#documents', '#history']);
    expect(Array.from(document.querySelectorAll('.govuk-tabs__panel')).map(panel => panel.id)).toEqual(['details', 'documents', 'history']);
    document.querySelectorAll('.govuk-tabs__panel').forEach((panel, i) => {
      expect(text(panel)).toContain(`Panel ${i} & content`); const link = panel.querySelector('a')!;
      expect(link.getAttribute('href')).toBe(`/documents/${i}?a=1&b=2`); expect(link.getAttribute('target')).toBe('_blank'); expect(link.getAttribute('rel')).toContain('noopener');
    });
    associations(document); dom.window.close();
  });

  it.each(['en', 'cy'])('keeps query order, exact links, hearing details, messages, attachments and thread actions (%s)', language => {
    const t = formControlTranslate(language);
    const items = [0, 1, 2, 3].map(i => ({messageDetails: `Message ${i} <script> & "citizen"`, sentOn: `19 October ${2020 + i}`, sentOnFormatted: `19/10/${2020 + i}`, raisedByUser: i !== 2, sentByName: 'Morgan <b> & Co',
      isHearingRelated: 'Yes', hearingDate: '20 October 2026', documents: [0, 1].map(j => ({documentUrl: formatDocumentViewURL(`File ${i}-${j} <script>.pdf`, '1', `http://localhost/documents/doc-${i}-${j}/binary`)}))}));
    const selectedQueryItem = {title: 'Saved query', items, isQueryClosed: false, lastStatus: 'PAGES.QM.VIEW_QUERY.STATUS_RECEIVED'};
    const locals = {selectedQueryItem, followUpScreen: '/follow-up'};
    const dom = new JSDOM(renderPresentation('features/queryManagement/qm-view-query-details-template.njk', locals, language)); const document = dom.window.document;
    expect(Array.from(document.querySelectorAll('.govuk-summary-card__title')).map(text)).toEqual([
      `${t('PAGES.QM.VIEW_QUERY_DETAILS.YOUR_MESSAGE')} (19/10/2020)`, `${t('PAGES.QM.VIEW_QUERY_DETAILS.COURTS_RESPONSE')} (19/10/2021)`,
      `${t('PAGES.QM.VIEW_QUERY_DETAILS.FOLLOW_UP_MESSAGE')} (19/10/2022)`, `${t('PAGES.QM.VIEW_QUERY_DETAILS.COURTS_RESPONSE')} (19/10/2023)`,
    ]);
    expect(Array.from(document.querySelectorAll('.govuk-summary-card')).map(card => text(card.querySelector('dd')!))).toEqual(items.map(item => item.messageDetails));
    expect(document.querySelectorAll('.govuk-summary-card a')).toHaveLength(8);
    expect(Array.from(document.querySelectorAll('.govuk-summary-card a')).map(a => a.getAttribute('href'))).toEqual(items.flatMap((_, i) => [0, 1].map(j => `/case/1/view-documents/doc-${i}-${j}`)));
    expect(document.querySelectorAll('.govuk-summary-card script, .govuk-summary-card b')).toHaveLength(0);
    expect(text(document.querySelector('.govuk-summary-card')!)).toContain('20 October 2026');
    expect(document.querySelector('a[href="/follow-up"]')).not.toBeNull();
    const closed = new JSDOM(renderPresentation('features/queryManagement/qm-view-query-details-template.njk', {...locals, selectedQueryItem: {...selectedQueryItem, isQueryClosed: true, queryClosedDate: '21 October 2026'}}, language));
    expect(closed.window.document.querySelector('a[href="/follow-up"]')).toBeNull(); expect(closed.window.document.querySelector('.govuk-warning-text')).not.toBeNull();
    if (process.env.PR9_BASE_VIEWS) {
      const base = new JSDOM(renderPresentation('features/queryManagement/qm-view-query-details-template.njk', locals, language, process.env.PR9_BASE_VIEWS));
      expect(Array.from(document.querySelectorAll('.govuk-summary-card')).map(text)).toEqual(Array.from(base.window.document.querySelectorAll('.govuk-summary-card')).map(text)); base.window.close();
    }
    associations(document); dom.window.close(); closed.window.close();
  });

  it.each(['en', 'cy'])('preserves all query-list cells and exact destinations, including an empty list (%s)', language => {
    const parentQueryItems = [0, 1, 2].map(i => ({id: String(i + 1), subject: `Subject ${i} <script> & text`, createdBy: 'Court staff', sentOn: `${i + 1} October 2026`, lastUpdatedBy: 'Alex', lastUpdatedOn: `${i + 2} October 2026`, status: 'Open'}));
    const locals = {parentQueryItems};
    const dom = new JSDOM(renderPresentation('features/queryManagement/qm-view-queries-template.njk', locals, language));
    expect(cells(dom.window.document)).toEqual(parentQueryItems.map(item => [item.subject, item.createdBy, item.sentOn, item.lastUpdatedBy, item.lastUpdatedOn, item.status]));
    expect(Array.from(dom.window.document.querySelectorAll('tbody a')).map(a => a.getAttribute('href'))).toEqual(['/case/1/qm/view-query/1/query-details', '/case/1/qm/view-query/2/query-details', '/case/1/qm/view-query/3/query-details']);
    expect(dom.window.document.querySelector('td script')).toBeNull(); dom.window.close();
    const empty = new JSDOM(renderPresentation('features/queryManagement/qm-view-queries-template.njk', {parentQueryItems: []}, language));
    expect(empty.window.document.querySelectorAll('table')).toHaveLength(1); expect(empty.window.document.querySelectorAll('tbody tr')).toHaveLength(0); empty.window.close();
  });

  it.each(['en', 'cy'])('keeps translated SELECT labels, hints, errors and exact values for every current producer (%s)', language => {
    const content = {type: ClaimSummaryType.SELECT, data: {category: 'questionsForExperts', index: 1, field: 'otherPartyName', text: 'Select the other party', hint: 'Saved hint', value: 'Morgan & Co', items: [{value: '', text: 'Select'}, {value: 'Morgan & Co', text: 'Morgan & Co', selected: true}], errorMessage: 'Choose a party'}};
    const html = configuredPresentationEnvironment().renderString('{% from "features/dashboard/item-content.njk" import itemContent %}{{ itemContent(content, t) }}', {content, t: formControlTranslate(language)});
    const dom = new JSDOM(html); const document = dom.window.document;
    expect(document.querySelector('fieldset')).toBeNull(); expect(document.querySelector('label')!.textContent!.trim()).toBe('Select the other party');
    expect(document.querySelector('select')!.name).toBe('questionsForExperts[1][otherPartyName]'); expect(document.querySelector('select')!.value).toBe('Morgan & Co');
    expect(document.querySelector('.govuk-error-message')!.textContent).toContain('Choose a party'); associations(document); dom.window.close();
  });

  it.each(['en', 'cy'])('retains empty dashboards and an initial message raised by the other party (%s)', language => {
    const empty = new JSDOM(renderPresentation('features/dashboard/dashboard.njk', {claimsAsClaimant: [], claimsAsDefendant: [], newOcmcClaimUrl: '/new'}, language));
    expect(empty.window.document.querySelectorAll('table')).toHaveLength(0);
    expect(empty.window.document.querySelector('a[href="/new"]')).not.toBeNull(); empty.window.close();
    const item = {messageDetails: 'Other party message <b>literal</b>', sentOnFormatted: '19/10/2026', sentOn: '19 October 2026', raisedByUser: false, sentByName: 'Morgan <script> & Co', isHearingRelated: 'No', documents: [] as {documentUrl: string}[]};
    const dom = new JSDOM(configuredPresentationEnvironment().renderString('{% from "macro/query-message-card.njk" import queryMessageCard %}{{ queryMessageCard(item, 1, t) }}', {item, t: formControlTranslate(language)}));
    expect(text(dom.window.document.querySelector('h2')!)).toBe(formControlTranslate(language)('PAGES.QM.VIEW_QUERY_DETAILS.MESSAGE') + ' (19/10/2026)');
    const values = Array.from(dom.window.document.querySelectorAll('dd')).map(text);
    expect(values).toEqual([item.messageDetails, formControlTranslate(language)('PAGES.QM.VIEW_QUERY_DETAILS.MESSAGE_ABOUT_HEARING_NO'), formControlTranslate(language)('PAGES.QM.VIEW_QUERY_DETAILS.NO_DOCUMENTS_UPLOADED'), item.sentByName, item.sentOn]);
    expect(dom.window.document.querySelector('script, b, a')).toBeNull(); dom.window.close();
  });

  it.each(presentationFormViews)('retains the submitted contract for %s (English/Welsh, blank/saved/error)', view => {
    for (const language of ['en', 'cy']) for (const state of ['blank', 'saved', 'error']) {
      const locals = presentationFormContext(view, language, state);
      const dom = new JSDOM(renderPresentation(view, locals, language)); const document = dom.window.document;
      if (view.endsWith('send-your-response-by-email.njk')) {expect(document.querySelectorAll('form')).toHaveLength(0);} else {
        expect(document.querySelector('form')).not.toBeNull();
        expect(document.querySelector('input[name="_csrf"]')?.getAttribute('value')).toBe('fixture-csrf');
        expect(document.querySelectorAll('form input, form textarea, form select').length).toBeGreaterThan(1);
      }
      expect(document.querySelector('.govuk-error-message .govuk-error-message')).toBeNull();
      if (process.env.PR9_BASE_VIEWS) {
        const base = new JSDOM(renderPresentation(view, locals, language, process.env.PR9_BASE_VIEWS));
        expect(contracts(document)).toEqual(contracts(base.window.document));
        const links = (doc: Document) => Array.from(doc.querySelectorAll('a[href]')).map(a => [a.getAttribute('href'), text(a)]);
        const expectedLinks = links(base.window.document).map(([href, label]) => {
          const targets: Record<string, string> = {'#flightDate': '#day', '#firstRepaymentDate': '#day', '#date': '#day', '#firstPaymentDate[date]': '#firstPaymentDate[day]'};
          return [targets[href!] || href, label];
        });
        expect(links(document)).toEqual(expectedLinks);
        const paragraphs = (doc: Document) => Array.from(doc.querySelectorAll('main p')).filter(p => !p.closest('.govuk-error-message')).map(text).filter(Boolean);
        expect(paragraphs(document)).toEqual(paragraphs(base.window.document));
        const messages = (doc: Document) => Array.from(doc.querySelectorAll('.govuk-error-summary li')).map(text);
        expect(messages(document)).toEqual(messages(base.window.document)); base.window.close();
      }
      if (state === 'saved') {
        const selected: Record<string, string> = {
          'claim-bilingual-language-preference.njk': 'WELSH_AND_ENGLISH',
          'bilingual-language-preference.njk': 'WELSH_AND_ENGLISH',
          'claim-type.njk': 'just-myself', 'unemployment.njk': 'Unemployed', 'dependants.njk': 'yes',
        };
        const value = selected[view.split('/').pop()!];
        if (value) expect(document.querySelector<HTMLInputElement>('form input[type=radio]:checked')!.value).toBe(value);
      }
      // The changed component regions must never introduce dangling control associations.
      associations(document); dom.window.close();
    }
  });
});

it.each(['en', 'cy'])('retains the legitimate company contact group and combines response descriptions with errors (%s)', language => {
  const companyView = 'features/mediation/company-telephone-number.njk';
  const locals = presentationFormContext(companyView, language);
  locals.form.model.option = 'no';
  const company = new JSDOM(renderPresentation(companyView, {...locals, contactPerson: ''}, language));
  try {
    const document = company.window.document;
    const phone = document.querySelector('input[name="mediationPhoneNumber"]')!;
    const person = document.querySelector('input[name="mediationContactPerson"]')!;
    expect(phone.closest('fieldset')).not.toBeNull();
    expect(person.closest('fieldset')).toBe(phone.closest('fieldset'));
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(phone.closest('fieldset')!.querySelector('legend')!.textContent!.trim()).toBe(formControlTranslate(language)('PAGES.MEDIATION_COMPANY_PHONE.TITLE'));
  } finally {company.window.close();}
  const responseView = 'features/response/citizenResponseType/citizen-response-type.njk';
  const invalid = new JSDOM(renderPresentation(responseView, presentationFormContext(responseView, language, 'error'), language));
  try {
    const document = invalid.window.document;
    const group = document.querySelector('.govuk-radios')!.closest('fieldset')!;
    expect(group.getAttribute('aria-describedby')!.split(/\s+/)).toEqual(['responseType-details', 'responseType-error']);
    expect(group.querySelector('legend')!.classList.contains('govuk-visually-hidden')).toBe(true);
  } finally {invalid.window.close();}
});
