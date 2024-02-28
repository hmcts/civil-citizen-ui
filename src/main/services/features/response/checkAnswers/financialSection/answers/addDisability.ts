import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_DISABILITY_URL,
  CITIZEN_SEVERELY_DISABLED_URL,
} from '../../../../../../routes/urls';
import {YesNo,YesNoUpperCase} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const addDisability = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string) => {
  const yourDisabilityHref = CITIZEN_DISABILITY_URL.replace(':id', claimId);
  const yourSevereDisabilityHref = CITIZEN_SEVERELY_DISABLED_URL.replace(':id', claimId);
  const isDisabled = claim.statementOfMeans?.disability?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const isSevereDisabled = claim.statementOfMeans?.severeDisability?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DISABILITY_ARE_YOU_DISABLED', { lng: getLng(lang) }), t(`COMMON.${isDisabled}`, {lng: getLng(lang)}), yourDisabilityHref, changeLabel(lang)));

  if (isDisabled === YesNoUpperCase.YES) {
    financialSection.summaryList.rows.push(summaryRow(t('COMMON.QUESTION.ARE_YOU_SEVERELY_DISABLED', { lng: getLng(lang) }), t(`COMMON.${isSevereDisabled}`, {lng: getLng(lang)}), yourSevereDisabilityHref, changeLabel(lang)));
  }
};
