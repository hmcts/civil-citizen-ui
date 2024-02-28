import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_DEBTS_URL,
} from '../../../../../../routes/urls';
import {DebtItems} from '../../../../../../common/form/models/statementOfMeans/debts/debtItems';
import {currencyFormatWithNoTrailingZeros} from '../../../../../../common/utils/currencyFormat';
import {YesNoUpperCase,YesNo} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const addLoansOrCreditCardDebts = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourLoansOrCreditCardsDebtsHref = CITIZEN_DEBTS_URL.replace(':id', claimId);

  if (claim.statementOfMeans?.debts?.debtsItems) {
    const debtsItems: DebtItems[] = claim.statementOfMeans.debts.debtsItems;
    const option = claim.statementOfMeans.debts.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DEBTS_LOANS_OR_CREDIT_CARDS', { lng: getLng(lang) }), t(`COMMON.${option}`, {lng: getLng(lang)}), yourLoansOrCreditCardsDebtsHref, changeLabel(lang)));
    for (let i = 0; i < debtsItems.length; i++) {
      financialSection.summaryList.rows.push(
        summaryRow((debtsItems.length > 1 ? (i + 1) + '. ' : '') + t('COMMON.DEBT', { lng: getLng(lang) }), debtsItems[i].debt, '', changeLabel(lang)),
        summaryRow(t('COMMON.TOTAL_DEBT', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(Number(debtsItems[i].totalOwned)), '', changeLabel(lang)),
        summaryRow(t('COMMON.MONTHLY_PAYMENTS', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(Number(debtsItems[i].monthlyPayments)), '', changeLabel(lang)),
      );
    }
  }
};
