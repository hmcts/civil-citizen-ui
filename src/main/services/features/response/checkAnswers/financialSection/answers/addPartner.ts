import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_PARTNER_URL,
  CITIZEN_PARTNER_AGE_URL,
  CITIZEN_PARTNER_PENSION_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_SEVERE_DISABILITY_URL,
} from '../../../../../../routes/urls';
import {YesNo,YesNoUpperCase} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const addPartner = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourCohabitingHref = CITIZEN_PARTNER_URL.replace(':id', claimId);
  const yourPartnerAgeHref = CITIZEN_PARTNER_AGE_URL.replace(':id', claimId);
  const yourPartnerPensionHref = CITIZEN_PARTNER_PENSION_URL.replace(':id', claimId);
  const yourPartnerDisabilityHref = CITIZEN_PARTNER_DISABILITY_URL.replace(':id', claimId);
  const yourPartnerSevereDisabilityHref = CITIZEN_PARTNER_SEVERE_DISABILITY_URL.replace(':id', claimId);

  const cohabiting = claim.statementOfMeans?.cohabiting?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const disability = claim.statementOfMeans?.disability?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const severeDisability = claim.statementOfMeans?.severeDisability?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const partnerAge = claim.statementOfMeans?.partnerAge?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const partnerPension = claim.statementOfMeans?.partnerPension?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const partnerDisability = claim.statementOfMeans?.partnerDisability?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const partnerSevereDisability = claim.statementOfMeans?.partnerSevereDisability?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PARTNER_DO_YOU_LIVE_WITH_A', { lng: getLng(lang) }), t(`COMMON.${cohabiting}`, {lng: getLng(lang)}), yourCohabitingHref, changeLabel(lang)));

  if (cohabiting === YesNoUpperCase.YES) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PARTNER_IS_AGED_18_OR_OVER', { lng: getLng(lang) }), t(`COMMON.${partnerAge}`, {lng: getLng(lang)}), yourPartnerAgeHref, changeLabel(lang)));
  }

  if (cohabiting === YesNoUpperCase.YES && partnerAge === YesNoUpperCase.YES) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PARTNER_DOES_RECEIVE_A_PENSION', { lng: getLng(lang) }), t(`COMMON.${partnerPension}`, {lng: getLng(lang)}), yourPartnerPensionHref, changeLabel(lang)));
  }

  if (cohabiting === YesNoUpperCase.YES && disability === YesNoUpperCase.YES) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PARTNER_IS_DISABLED', { lng: getLng(lang) }), t(`COMMON.${partnerDisability}`, {lng: getLng(lang)}), yourPartnerDisabilityHref, changeLabel(lang)));
    if (severeDisability && partnerDisability === YesNoUpperCase.YES) {
      financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PARTNER_IS_SEVERELY_DISABLED', { lng: getLng(lang) }), t(`COMMON.${partnerSevereDisability}`, {lng: getLng(lang)}), yourPartnerSevereDisabilityHref, changeLabel(lang)));
    }
  }
};
