import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_CARER_URL,
} from '../../../../../../routes/urls';
import {YesNo} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

export const addCarer = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
  const yourCareCreditsHref = CITIZEN_CARER_URL.replace(':id', claimId);
  const carerCredit = claim.statementOfMeans?.carer?.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CARER_CREDIT_DO_YOU_CLAIM', { lng: getLng(lang) }), carerCredit.charAt(0).toUpperCase() + carerCredit.slice(1), yourCareCreditsHref, changeLabel(lang)));
};
