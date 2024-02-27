import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_MONTHLY_INCOME_URL,
} from '../../../../../../routes/urls';
import {Transaction} from '../../../../../../common/form/models/statementOfMeans/expensesAndIncome/transaction';
import {currencyFormatWithNoTrailingZeros} from '../../../../../../common/utils/currencyFormat';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

const addListRow = (section:SummarySection, sectionHref:string, transaction:Transaction, expense: string, amount:string, lang: string ) => {
  if (transaction?.declared && transaction?.transactionSource?.amount) {
    section.summaryList.rows.push(summaryRow(t(expense, { lng: getLng(lang) }), amount, sectionHref, changeLabel(lang)));
  }
};

export const addMonthlyIncome = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourMonthlyIncomesHref = CITIZEN_MONTHLY_INCOME_URL.replace(':id', claimId);

  if (claim.statementOfMeans?.regularIncome) {
    financialSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.INCOME_REGULAR', { lng: getLng(lang) }), '', yourMonthlyIncomesHref, changeLabel(lang)),
    );
  }

  addListRow(financialSection, yourMonthlyIncomesHref, claim.statementOfMeans?.regularIncome?.job, 'PAGES.CHECK_YOUR_ANSWER.INCOME_JOB', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularIncome?.job?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyIncomesHref, claim.statementOfMeans?.regularIncome?.universalCredit, 'PAGES.CHECK_YOUR_ANSWER.INCOME_UNIVERSAL_CREDIT', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularIncome?.universalCredit?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyIncomesHref, claim.statementOfMeans?.regularIncome?.jobseekerAllowanceIncome, 'PAGES.CHECK_YOUR_ANSWER.INCOME_JOB_SEEKER_ALLOWANCE', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularIncome?.jobseekerAllowanceIncome?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyIncomesHref, claim.statementOfMeans?.regularIncome?.jobseekerAllowanceContribution, 'PAGES.CHECK_YOUR_ANSWER.INCOME_JOB_SEEKER_ALLOWANCE_CONTRIBUTION', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularIncome?.jobseekerAllowanceContribution?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyIncomesHref, claim.statementOfMeans?.regularIncome?.incomeSupport, 'PAGES.CHECK_YOUR_ANSWER.INCOME_SUPPORT', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularIncome?.incomeSupport?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyIncomesHref, claim.statementOfMeans?.regularIncome?.workingTaxCredit, 'PAGES.CHECK_YOUR_ANSWER.INCOME_WORKING_TAX_CREDIT', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularIncome?.workingTaxCredit?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyIncomesHref, claim.statementOfMeans?.regularIncome?.childTaxCredit, 'PAGES.CHECK_YOUR_ANSWER.INCOME_CHILD_TAX_CREDIT', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularIncome?.childTaxCredit?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyIncomesHref, claim.statementOfMeans?.regularIncome?.childBenefit, 'PAGES.CHECK_YOUR_ANSWER.INCOME_CHILD_BENEFIT', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularIncome?.childBenefit?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyIncomesHref, claim.statementOfMeans?.regularIncome?.councilTaxSupport, 'PAGES.CHECK_YOUR_ANSWER.INCOME_COUNCIL_TAX_SUPPORT', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularIncome?.councilTaxSupport?.transactionSource?.amount), lang);
  addListRow(financialSection, yourMonthlyIncomesHref, claim.statementOfMeans?.regularIncome?.pension, 'PAGES.CHECK_YOUR_ANSWER.INCOME_PENSION', currencyFormatWithNoTrailingZeros(claim.statementOfMeans?.regularIncome?.pension?.transactionSource?.amount), lang);

  if (claim.statementOfMeans?.regularIncome?.other?.declared) {
    const otherIncomes = claim.statementOfMeans?.regularIncome.other.transactionSources;
    for (const item of otherIncomes) {
      financialSection.summaryList.rows.push(summaryRow(item.name, currencyFormatWithNoTrailingZeros(item.amount), yourMonthlyIncomesHref, changeLabel(lang)));
    }
  }
};
