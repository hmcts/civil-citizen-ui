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
import {YesNo} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

export const addPartner = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
  const yourCohabitingHref = CITIZEN_PARTNER_URL.replace(':id', claimId);
  const yourPartnerAgeHref = CITIZEN_PARTNER_AGE_URL.replace(':id', claimId);
  const yourPartnerPensionHref = CITIZEN_PARTNER_PENSION_URL.replace(':id', claimId);
  const yourPartnerDisabilityHref = CITIZEN_PARTNER_DISABILITY_URL.replace(':id', claimId);
  const yourPartnerSevereDisabilityHref = CITIZEN_PARTNER_SEVERE_DISABILITY_URL.replace(':id', claimId);

  const cohabiting = claim.statementOfMeans?.cohabiting?.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  const partnerAge = claim.statementOfMeans?.partnerAge?.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  const partnerPension = claim.statementOfMeans?.partnerPension?.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  const partnerDisability = claim.statementOfMeans?.partnerDisability?.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  const partnerSevereDisability = claim.statementOfMeans?.partnerSevereDisability?.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PARTNER_DO_YOU_LIVE_WITH_A', { lng: getLng(lang) }), cohabiting.charAt(0).toUpperCase() + cohabiting.slice(1), yourCohabitingHref, changeLabel(lang)));

  if (cohabiting === YesNo.YES) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PARTNER_IS_AGED_18_OR_OVER', { lng: getLng(lang) }), partnerAge.charAt(0).toUpperCase() + partnerAge.slice(1), yourPartnerAgeHref, changeLabel(lang)));
  }

  if (partnerAge === YesNo.YES) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PARTNER_DOES_RECEIVE_A_PENSION', { lng: getLng(lang) }), partnerPension.charAt(0).toUpperCase() + partnerPension.slice(1), yourPartnerPensionHref, changeLabel(lang)));
  }

  if (claim.statementOfMeans?.disability?.option === YesNo.YES) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PARTNER_IS_DISABLED', { lng: getLng(lang) }), partnerDisability.charAt(0).toUpperCase() + partnerDisability.slice(1), yourPartnerDisabilityHref, changeLabel(lang)));
    if (partnerDisability === YesNo.YES) {
      financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PARTNER_IS_SEVERELY_DISABLED', { lng: getLng(lang) }), partnerSevereDisability.charAt(0).toUpperCase() + partnerSevereDisability.slice(1), yourPartnerSevereDisabilityHref, changeLabel(lang)));
    }
  }
};
