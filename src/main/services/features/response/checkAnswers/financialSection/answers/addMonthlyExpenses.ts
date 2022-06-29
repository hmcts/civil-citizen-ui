import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_MONTHLY_EXPENSES_URL,
} from '../../../../../../routes/urls';
import Transaction from '../../../../../../common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {currencyFormatWithNoTrailingZeros} from '../../../../../../common/utils/currencyFormat';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

const addListRow = (section:SummarySection, sectionHref:string, transaction:Transaction, expense: string, amount:string, lang: string | unknown) => {
  if (transaction?.declared && transaction?.transactionSource?.amount) {
    section.summaryList.rows.push(summaryRow(t(expense, { lng: getLng(lang) }), amount, sectionHref, changeLabel(lang)));
  }
};

export const addMonthlyExpenses = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
  const yourMonthlyExpensessHref = CITIZEN_MONTHLY_EXPENSES_URL.replace(':id', claimId);

  if (claim.statementOfMeans?.regularExpenses) {
    financialSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EXPENSES_REGULAR', { lng: getLng(lang) }), '', yourMonthlyExpensessHref, changeLabel(lang)),
    );
  }

  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.mortgage, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_MORTGAGE', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.mortgage?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.rent, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_RENT', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.rent?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.councilTax, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_COUNCIL_TAX', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.councilTax?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.gas, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_GAS', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.gas?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.electricity, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_ELECTRICITY', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.electricity?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.water, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_WATER', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.water?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.travel, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_TRAVEL', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.travel?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.schoolCosts, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_SCHOOL_COSTS', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.schoolCosts?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.foodAndHousekeeping, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_FOOD_AND_HOUSEKEEPING', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.foodAndHousekeeping?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.tvAndBroadband, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_TV_BROADBAND', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.tvAndBroadband?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.hirePurchase, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_HIRE_PURCHASE', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.hirePurchase?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.mobilePhone, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_MOBILE_PHONE', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.mobilePhone?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.maintenance, 'PAGES.CHECK_YOUR_ANSWER.EXPENSE_MAINTENANCE', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.maintenance?.transactionSource?.amount), lang);

  if (claim.statementOfMeans?.regularExpenses?.other?.declared) {
    const otherExpenses = claim.statementOfMeans?.regularExpenses.other.transactionSources;
    for (const item of otherExpenses) {
      financialSection.summaryList.rows.push(summaryRow(item.name, currencyFormatWithNoTrailingZeros(item.amount), yourMonthlyExpensessHref, changeLabel(lang)));
    }
  }
};
