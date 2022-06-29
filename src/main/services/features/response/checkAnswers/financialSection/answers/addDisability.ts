import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_DISABILITY_URL,
  CITIZEN_SEVERELY_DISABLED_URL,
} from '../../../../../../routes/urls';
import {YesNo} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

export const addDisability = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
  const yourDisabilityHref = CITIZEN_DISABILITY_URL.replace(':id', claimId);
  const yourSevereDisabilityHref = CITIZEN_SEVERELY_DISABLED_URL.replace(':id', claimId);
  const isDisabled = claim.statementOfMeans?.disability?.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  const isSevereDisabled = claim.statementOfMeans?.severeDisability?.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DISABILITY_ARE_YOU_DISABLED', { lng: getLng(lang) }), isDisabled.charAt(0).toUpperCase() + isDisabled.slice(1), yourDisabilityHref, changeLabel(lang)));

  if (isDisabled === YesNo.YES) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DISABILITY_ARE_YOU_SEVERELY_DISABLED', { lng: getLng(lang) }), isSevereDisabled.charAt(0).toUpperCase() + isSevereDisabled.slice(1), yourSevereDisabilityHref, changeLabel(lang)));
  }
};
