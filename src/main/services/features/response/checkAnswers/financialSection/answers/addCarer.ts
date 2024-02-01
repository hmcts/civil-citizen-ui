import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_CARER_URL,
} from '../../../../../../routes/urls';
import {YesNoUpperCase, YesNo} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const addCarer = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourCareCreditsHref = CITIZEN_CARER_URL.replace(':id', claimId);
  const carerCredit = claim.statementOfMeans?.carer?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CARER_CREDIT_DO_YOU_CLAIM', { lng: getLng(lang) }), t(`COMMON.${carerCredit}`, {lng: getLng(lang)}), yourCareCreditsHref, changeLabel(lang)));
};
