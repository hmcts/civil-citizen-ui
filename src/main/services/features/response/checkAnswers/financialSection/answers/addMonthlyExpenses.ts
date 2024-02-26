import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_MONTHLY_EXPENSES_URL,
} from '../../../../../../routes/urls';
import {Transaction} from '../../../../../../common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {currencyFormatWithNoTrailingZeros} from '../../../../../../common/utils/currencyFormat';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

const addListRow = (section:SummarySection, sectionHref:string, transaction:Transaction, expense: string, amount:string, lang: string ) => {
  if (transaction?.declared && transaction?.transactionSource?.amount) {
    section.summaryList.rows.push(summaryRow(t(expense, { lng: getLng(lang) }), amount, sectionHref, changeLabel(lang)));
  }
};

export const addMonthlyExpenses = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourMonthlyExpensessHref = CITIZEN_MONTHLY_EXPENSES_URL.replace(':id', claimId);

  if (claim.statementOfMeans?.regularExpenses) {
    financialSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EXPENSES_REGULAR', { lng: getLng(lang) }), '', yourMonthlyExpensessHref, changeLabel(lang)),
    );
  }

  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.mortgage, 'COMMON.CHECKBOX_FIELDS.MORTGAGE', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.mortgage?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.rent, 'COMMON.CHECKBOX_FIELDS.RENT', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.rent?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.councilTax, 'COMMON.CHECKBOX_FIELDS.COUNCIL_TAX', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.councilTax?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.gas, 'COMMON.CHECKBOX_FIELDS.GAS', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.gas?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.electricity, 'COMMON.CHECKBOX_FIELDS.ELECTRICITY', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.electricity?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.water, 'COMMON.CHECKBOX_FIELDS.WATER', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.water?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.travel, 'COMMON.CHECKBOX_FIELDS.TRAVEL', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.travel?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.schoolCosts, 'COMMON.CHECKBOX_FIELDS.SCHOOL_COSTS', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.schoolCosts?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.foodAndHousekeeping, 'COMMON.CHECKBOX_FIELDS.FOOD_AND_HOUSEKEEPING', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.foodAndHousekeeping?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.tvAndBroadband, 'COMMON.CHECKBOX_FIELDS.TV_AND_BROADBAND', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.tvAndBroadband?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.hirePurchase, 'COMMON.CHECKBOX_FIELDS.HIRE_PURCHASE', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.hirePurchase?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.mobilePhone, 'COMMON.CHECKBOX_FIELDS.MOBILE_PHONE', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.mobilePhone?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyExpensessHref, claim.statementOfMeans?.regularExpenses?.maintenance, 'COMMON.CHECKBOX_FIELDS.MAINTENANCE', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularExpenses?.maintenance?.transactionSource?.amount), lang);

  if (claim.statementOfMeans?.regularExpenses?.other?.declared) {
    const otherExpenses = claim.statementOfMeans?.regularExpenses.other.transactionSources;
    for (const item of otherExpenses) {
      financialSection.summaryList.rows.push(summaryRow(item.name, currencyFormatWithNoTrailingZeros(item.amount), yourMonthlyExpensessHref, changeLabel(lang)));
    }
  }
};
