import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_PRIORITY_DEBTS_URL,
} from '../../../../../../routes/urls';
import {Transaction} from '../../../../../../common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {currencyFormatWithNoTrailingZeros} from '../../../../../../common/utils/currencyFormat';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

let count: number;

const addPriorityDebtsListRow = (section:SummarySection, sectionHref:string, debtType:Transaction, tKey:string, lang: string) => {
  if (debtType?.declared && debtType?.transactionSource?.amount) {
    section.summaryList.rows.push(summaryRow((count++) + '. ' + t('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_TYPE', { lng: getLng(lang) }), t(tKey, { lng: getLng(lang) }), sectionHref, changeLabel(lang)));
    section.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_ARREARS_REPAYMENT', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(debtType.transactionSource.amount), sectionHref, changeLabel(lang)));
  }
};

export const addPriorityDebts = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourPriorityDebtsHref = CITIZEN_PRIORITY_DEBTS_URL.replace(':id', claimId);

  if (claim.statementOfMeans?.priorityDebts) {
    financialSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBTS_YOU_ARE_BEHIND_ON', { lng: getLng(lang) }), '', yourPriorityDebtsHref, changeLabel(lang)),
    );
  }

  count = 1;
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.mortgage, 'COMMON.CHECKBOX_FIELDS.MORTGAGE', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.rent, 'COMMON.CHECKBOX_FIELDS.RENT', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.councilTax, 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_COUNCIL_TAX', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.gas, 'COMMON.CHECKBOX_FIELDS.GAS', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.electricity, 'COMMON.CHECKBOX_FIELDS.ELECTRICITY', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.water, 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_WATER', lang);
  addPriorityDebtsListRow(financialSection, yourPriorityDebtsHref, claim.statementOfMeans?.priorityDebts?.maintenance, 'PAGES.CHECK_YOUR_ANSWER.PRIORITY_DEBT_MAINTENANCE', lang);
};
