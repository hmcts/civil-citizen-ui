import {JSDOM} from 'jsdom';
import {configuredPresentationEnvironment, renderPresentation} from '../../../utils/renderPresentationPages';
import {formControlTranslate} from '../../../utils/renderFormControls';
const text = (element: Element) => element.textContent!.replace(/\s+/g, ' ').trim();
const rows = (doc: Document) => Array.from(doc.querySelectorAll('tbody tr')).map(row => Array.from(row.querySelectorAll('td')).map(text));

describe('PR9 amount, timeline, document and contact summaries', () => {
  it.each(['en', 'cy'])('preserves every amount row, zero fixed costs, absent fees and escaped reasons (%s)', language => {
    const env = configuredPresentationEnvironment();
    const source = '{% from "macro/amount-breakdown.njk" import amountBreakdownTable %}{{ amountBreakdownTable(t, claim, interestData, totalAmount, fixedCost) }}';
    const locals = {t: formControlTranslate(language), claim: {claimAmountBreakup: [{value: {claimReason: 'First <script> & reason', claimAmount: 12345}}, {value: {claimReason: 'Second', claimAmount: 10}}], totalInterest: 2.5, claimFee: {}}, interestData: {}, totalAmount: 126.05, fixedCost: 0};
    const dom = new JSDOM(env.renderString(source, locals));
    expect(rows(dom.window.document).map(row => row[1])).toEqual(['£123.45', '£0.10', '£2.50', '£0.00', '£0', '£126.05']);
    expect(rows(dom.window.document)[0][0]).toBe('First <script> & reason'); expect(dom.window.document.querySelector('script')).toBeNull();
    if (process.env.PR9_BASE_VIEWS) {const base = new JSDOM(configuredPresentationEnvironment(process.env.PR9_BASE_VIEWS).renderString(source, locals)); expect(rows(dom.window.document)).toEqual(rows(base.window.document)); base.window.close();}
    dom.window.close();
  });

  it.each(['en', 'cy'])('preserves interest, already-paid and judgment totals without recalculation (%s)', language => {
    const view = 'features/claimantResponse/ccj/judgement-amount-summary.njk';
    const locals = {claimAmount: '100.00', judgmentSummaryDetails: {claimHasInterest: true, interestToDate: '3.00', claimFeeAmount: '35.00', hasDefendantAlreadyPaid: true, subTotal: '138.00', alreadyPaidAmount: '10.00', total: '128.00', totalWithoutFeeAndInterest: '90.00', interestRate: 8, numberOfDays: 7, interestStartDate: '1 October 2026', interestEndDate: '8 October 2026'}};
    const dom = new JSDOM(renderPresentation(view, locals, language));
    expect(rows(dom.window.document).map(row => row[1])).toEqual(['£100.00', '£3.00', '£35.00', '£138.00', '£10.00', '£128.00']);
    if (process.env.PR9_BASE_VIEWS) {const base = new JSDOM(renderPresentation(view, locals, language, process.env.PR9_BASE_VIEWS)); expect(rows(dom.window.document)).toEqual(rows(base.window.document)); base.window.close();}
    dom.window.close();
  });

  it.each(['en', 'cy'])('preserves complete timeline ordering and literal descriptions (%s)', language => {
    const source = '{% from "macro/timeline-summary.njk" import timelineSummary %}{{ timelineSummary(t, events) }}';
    const locals = {t: formControlTranslate(language), events: [{timelineDate: '1 January 2026', timelineDescription: '<script> & first'}, {timelineDate: '31 December 2025', timelineDescription: 'Second event'}]};
    const dom = new JSDOM(configuredPresentationEnvironment().renderString(source, locals));
    expect(rows(dom.window.document)).toEqual(locals.events.map(event => [event.timelineDate, event.timelineDescription]));
    expect(dom.window.document.querySelector('script')).toBeNull();
    expect(dom.window.document.querySelectorAll('.time-line')).toHaveLength(2);
    dom.window.close();
  });

  it.each(['en', 'cy'])('renders optional document dates without translating the date or dropping documents (%s)', language => {
    const t = jest.fn(formControlTranslate(language));
    const source = '{% from "macro/create-table-documents.njk" import addCreateFileInformation %}{{ addCreateFileInformation(t, name, date) }}';
    const env = configuredPresentationEnvironment();
    for (const date of ['19 October 2026', '', undefined]) {
      const dom = new JSDOM(env.renderString(source, {t, name: 'File <script> & name.pdf', date}));
      expect(text(dom.window.document.querySelector('p')!)).toBe('File <script> & name.pdf');
      expect(dom.window.document.querySelectorAll('.govuk-hint')).toHaveLength(date ? 1 : 0);
      expect(dom.window.document.querySelector('script')).toBeNull(); dom.window.close();
    }
    expect(t.mock.calls.some(([key]) => key === '19 October 2026')).toBe(false);
  });

  it.each(['en', 'cy'])('preserves contact information and supports open/closed independently identified instances (%s)', language => {
    const source = '{% from "macro/contact-us-for-help.njk" import contactUsForHelp with context %}{{ contactUsForHelp(t, "", true) }}{{ contactUsForHelp(t, "", false, false, "secondary-contact") }}';
    const dom = new JSDOM(configuredPresentationEnvironment().renderString(source, {t: formControlTranslate(language)}));
    expect(dom.window.document.querySelectorAll('details')).toHaveLength(2);
    expect(dom.window.document.querySelectorAll('details[open]')).toHaveLength(1);
    expect(dom.window.document.querySelectorAll('a[href="mailto:contactocmc@justice.gov.uk"]')).toHaveLength(2);
    expect(text(dom.window.document.body)).toContain('0300 123 7050');
    const ids = Array.from(dom.window.document.querySelectorAll('[id]')).map(element => element.id); expect(new Set(ids).size).toBe(ids.length);
    dom.window.close();
  });
});
