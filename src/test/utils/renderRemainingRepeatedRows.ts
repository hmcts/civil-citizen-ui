import {Request} from 'express';
import {GenericForm} from 'common/form/models/genericForm';
import {AmountBreakdown} from 'common/form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from 'common/form/models/claim/amount/claimAmountRow';
import {ClaimantTimeline} from 'common/form/models/timeLineOfEvents/claimantTimeline';
import {DefendantTimeline} from 'common/form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'common/form/models/timeLineOfEvents/timelineRow';
import {Employers} from 'common/form/models/statementOfMeans/employment/employers';
import {Employer} from 'common/form/models/statementOfMeans/employment/employer';
import {BankAccounts} from 'common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from 'common/form/models/bankAndSavings/bankAccount';
import {BankAccountTypes} from 'common/form/models/bankAndSavings/bankAccountTypes';
import {Debts} from 'common/form/models/statementOfMeans/debts/debts';
import {DebtItems} from 'common/form/models/statementOfMeans/debts/debtItems';
import {RegularIncome} from 'common/form/models/statementOfMeans/expensesAndIncome/regularIncome';
import {RegularExpenses} from 'common/form/models/statementOfMeans/expensesAndIncome/regularExpenses';
import {OtherTransaction} from 'common/form/models/statementOfMeans/expensesAndIncome/otherTransaction';
import {TransactionSource} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSource';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';
import {UnavailableDateType, UnavailableDatePeriod, UnavailableDates} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';
import {UnavailableDatePeriodMediation, UnavailableDatesMediation} from 'common/models/mediation/unavailableDatesMediation';
import {UnavailableDatePeriodGaHearing, UnavailableDatesGaHearing} from 'common/models/generalApplication/unavailableDatesGaHearing';
import {getUnavailableDatesForm} from 'services/features/directionsQuestionnaire/hearing/unavailableDatesForHearingService';
import {getUnavailableDatesMediationForm} from 'services/features/mediation/unavailableDatesForMediationService';
import {getUnavailableDatesForHearingForm} from 'services/features/generalApplication/unavailableHearingDatesService';
import {toRegularIncomeForm, toRegularExpenseForm} from 'common/utils/expenseAndIncome/regularIncomeExpenseCoverter';
import {dateFilter} from 'modules/nunjucks/filters/dateFilter';
import {formControlsEnvironment, formControlTranslate} from './renderFormControls';

const nunjucks = require('nunjucks');
// Reproduce the dashboard shell's error-summary ownership; only its outer shell
// is substituted, while the actual GA caller and shared macros are retained.
class RemainingDashboardShell extends nunjucks.Loader {
  getSource(name: string) {
    if (!name.endsWith('claim-details-tpl-dashboard.njk')) return null;
    return {src: '{% from "macro/error-summary.njk" import errorSummary %}<!doctype html><html lang="{{ lang }}"><head><title>{% block pageTitle %}{% endblock %}</title></head><body class="govuk-template__body"><div class="govuk-width-container"><main class="govuk-main-wrapper">{% block content %}{% if form != null and form.hasErrors() %}{{ errorSummary(form.getAllErrors(), t) }}{% endif %}{% block nestedContent %}{% endblock %}{% endblock %}</main></div></body></html>', path: name, noCache: true};
  }
}

export const remainingPages = {
  amount: 'claim/amount/claim-amount-breakdown.njk',
  claimantTimeline: 'claim/yourDetails/timeline.njk',
  defendantTimeline: 'response/timelineOfEvents/defendant-timeline.njk',
  dqDates: 'directionsQuestionnaire/hearing/unavailable-dates-for-hearing.njk',
  mediationDates: 'mediation/unavailable-dates-mediation.njk',
  gaDates: 'generalApplication/unavailable-dates-hearing.njk',
  banks: 'response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts.njk',
  debts: 'response/statementOfMeans/debts/debts.njk',
  employers: 'response/statementOfMeans/employment/who-employs-you.njk',
  income: 'response/statementOfMeans/income/regular-income.njk',
  expenses: 'response/statementOfMeans/expenses/regular-expenses.njk',
};
export type RemainingEditor = keyof typeof remainingPages;
export const dateEditors: RemainingEditor[] = ['dqDates', 'mediationDates', 'gaDates'];
export const removableEditors: RemainingEditor[] = [...dateEditors, 'income', 'expenses'];
export function remainingForm(editor: RemainingEditor, count = 3, state: 'blank' | 'saved' | 'error' = 'saved') {
  const saved = state !== 'blank', error = state === 'error';
  const each = <T>(create: (index: number) => T): T[] => Array.from({length: count}, (_, index) => create(index));
  let model: object;
  if (editor === 'amount') model = new AmountBreakdown(each(index => new ClaimAmountRow(saved ? error && !index ? '' : `Reason ${index} in 2026` : undefined, saved ? 12.5 + index : undefined)), saved ? 40.5 : undefined);
  else if (editor === 'claimantTimeline' || editor === 'defendantTimeline') {
    const rows = each(index => saved ? new TimelineRow(error && !index ? 32 : 12 + index, 6, 2025, `Event ${index} in room 123`) : new TimelineRow());
    model = editor === 'claimantTimeline' ? new ClaimantTimeline(rows) : new DefendantTimeline(rows, 'Preserved separate comment');
  } else if (editor === 'banks') model = new BankAccounts(each(index => new BankAccount(saved ? 'CURRENT_ACCOUNT' : undefined, saved ? error && !index ? '' : 'false' : undefined, saved ? String(100 + index) : undefined)));
  else if (editor === 'debts') model = new Debts(saved ? 'yes' : undefined, each(index => new DebtItems(saved ? error && !index ? '' : `Debt ${index} in 2026` : '', saved ? '100.50' : '', saved ? '10.25' : '')));
  else if (editor === 'employers') model = new Employers(each(index => new Employer(saved ? `Employer ${index} in 2026` : undefined, saved ? error && !index ? '' : `Role ${index}` : undefined)));
  else if (editor === 'income' || editor === 'expenses') {
    const regular = editor === 'income' ? RegularIncome.buildEmptyForm() : RegularExpenses.buildEmptyForm();
    regular.other = new OtherTransaction(saved, each(index => new TransactionSource({name: saved ? error && !index ? '' : `Source ${index}` : undefined, amount: saved ? 12.5 + index : undefined, schedule: saved ? TransactionSchedule.MONTH : undefined, isIncome: editor === 'income', nameRequired: true})));
    model = regular;
  } else {
    const Period = editor === 'dqDates' ? UnavailableDatePeriod : editor === 'mediationDates' ? UnavailableDatePeriodMediation : UnavailableDatePeriodGaHearing;
    const days = each(index => {const date = new Date();date.setDate(date.getDate() + 10 + index);const values = {day: String(date.getDate()), month: String(date.getMonth() + 1), year: String(date.getFullYear())};return new Period(saved && !(error && !index) ? index % 2 ? UnavailableDateType.LONGER_PERIOD : UnavailableDateType.SINGLE_DATE : undefined, saved ? values : undefined, saved ? values : undefined);});
    model = editor === 'dqDates' ? new UnavailableDates(days) : editor === 'mediationDates' ? new UnavailableDatesMediation(days) : new UnavailableDatesGaHearing(days);
  }
  const form = new GenericForm(model);if (error) form.validateSync();return form;
}
export function renderRemainingPage(editor: RemainingEditor, options: {language?: string; count?: number; state?: 'blank' | 'saved' | 'error'; form?: GenericForm<object>; viewsDirectory?: string; pdf?: boolean} = {}) {
  const language = options.language || 'en', t = formControlTranslate(language), env = formControlsEnvironment(options.viewsDirectory);
  const outer = env.loaders[0], originalSource = outer.getSource.bind(outer), dashboard = new RemainingDashboardShell();
  outer.getSource = (name: string) => dashboard.getSource(name) || originalSource(name);
  env.addGlobal('TransactionSchedule', TransactionSchedule);env.addGlobal('UnavailableDateType', UnavailableDateType);env.addFilter('date', dateFilter);
  return env.render(`features/${remainingPages[editor]}`, {form: options.form || remainingForm(editor, options.count, options.state), t, lang: language, csrf: 'fixture-csrf', today: new Date(),
    pageTitle: editor === 'mediationDates' ? 'PAGES.UNAVAILABILITY_SELECT_DATES_MEDIATION.PAGE_TITLE' : editor === 'amount' ? 'PAGES.CLAIM_AMOUNT_BREAKDOWN.TITLE' : editor === 'claimantTimeline' ? 'PAGES.TIMELINE.TITLE' : 'PAGES.UNAVAILABLE_DATES_FOR_HEARING.PAGE_TITLE',
    dates: ['12 June 2025', '14 June 2025', '16 June 2025'], bankAccountDropDownItems: new BankAccountTypes(),
    theirTimeline: options.pdf ? [] : [{value: {timelineDate: '2025-06-12', timelineDescription: 'Opponent event retained'}}], pdfUrl: options.pdf ? '/local-opponent-timeline.pdf' : undefined,
    pageText: t('PAGES.UNAVAILABILITY_SELECT_DATES_MEDIATION.PAGE_TEXT'), pageHint: {text1: t('PAGES.UNAVAILABILITY_SELECT_DATES_MEDIATION.PAGE_HINT_TEXT1'), text2: t('PAGES.UNAVAILABILITY_SELECT_DATES_MEDIATION.PAGE_HINT_TEXT2')}, isCarm: true,
    headerTitle: t('COMMON.GENERAL_APPLICATION'), headingTitle: t('PAGES.GENERAL_APPLICATION.UNAVAILABLE_HEARING_DATES.TITLE'), cancelUrl: '/cancel',
  });
}
// Use the same conversion APIs as the production POST controllers. No persistence.
export function interpretRemainingBody(editor: RemainingEditor, body: Record<string, unknown>): object {
  const req = {body} as Request;
  if (editor === 'amount') return AmountBreakdown.fromObject(body as Record<string, object>);
  if (editor === 'claimantTimeline') return ClaimantTimeline.buildPopulatedForm(body.rows as TimelineRow[]);
  if (editor === 'defendantTimeline') return DefendantTimeline.buildPopulatedForm(body.rows as TimelineRow[], body.comment as string);
  if (editor === 'banks') return new BankAccounts((body.accounts as BankAccount[]).map(row => new BankAccount(row.typeOfAccount, row.joint, row.balance)));
  if (editor === 'employers') return new Employers((body.rows as Employer[]).map(row => new Employer(row.employerName, row.jobTitle)));
  if (editor === 'debts') return new Debts(body.option as string, (body.debtsItems as DebtItems[]).map(row => new DebtItems(row.debt, row.totalOwned, row.monthlyPayments)));
  if (editor === 'income') return toRegularIncomeForm(req);
  if (editor === 'expenses') return toRegularExpenseForm(req);
  if (editor === 'dqDates') return getUnavailableDatesForm(body as Record<string, []>);
  if (editor === 'mediationDates') return getUnavailableDatesMediationForm(body as Record<string, []>);
  return getUnavailableDatesForHearingForm(body as Record<string, []>);
}
