import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_COURT_ORDERS_URL,
} from '../../../../../../routes/urls';
import {currencyFormatWithNoTrailingZeros} from '../../../../../../common/utils/currencyFormat';
import {YesNoUpperCase} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const addCourtOrders = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourCourtOrdersHref = CITIZEN_COURT_ORDERS_URL.replace(':id', claimId);
  const courtOrders = claim.statementOfMeans?.courtOrders;

  if (courtOrders?.declared && courtOrders?.rows?.length > 0) {
    financialSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_TITLE', { lng: getLng(lang) }), t(`COMMON.${YesNoUpperCase.YES}`, { lng: getLng(lang) }), yourCourtOrdersHref, changeLabel(lang)),
    );

    for (const item of courtOrders.rows) {
      financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_CLAIM_NUMBER', { lng: getLng(lang) }), item.claimNumber, '', changeLabel(lang)));
      financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_AMOUNT_OWNED', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(item.amount), '', changeLabel(lang)));
      financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_MONTHLY_INSTALMENT', { lng: getLng(lang) }), currencyFormatWithNoTrailingZeros(item.instalmentAmount), '', changeLabel(lang)));
    }
  } else {
    financialSection.summaryList.rows.push(
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_TITLE', { lng: getLng(lang) }), t(`COMMON.${YesNoUpperCase.NO}`, { lng: getLng(lang) }), yourCourtOrdersHref, changeLabel(lang)),
    );
  }
};
