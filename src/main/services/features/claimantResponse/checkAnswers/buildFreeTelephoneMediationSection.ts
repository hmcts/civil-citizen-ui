import { Claim } from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {CAN_WE_USE_COMPANY_URL, CAN_WE_USE_URL, CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from 'routes/urls';
import {getLng} from 'common/utils/languageToggleUtils';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {YesNoUpperCase} from 'form/models/yesNo';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const buildFreeTelephoneMediationSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const freeMediationHref = constructResponseUrlWithIdParams(claimId, CITIZEN_FREE_TELEPHONE_MEDIATION_URL);
  const contactNumberHref = constructResponseUrlWithIdParams(claimId, CAN_WE_USE_URL);
  const contactNumber = claim.contactNumberFromClaimantResponse;
  const contactName = claim.contactNameFromClaimantResponse;
  const canWeUse = claim.claimantResponse?.canWeUseFromClaimantResponse;

  let freeTelephoneMediationSection: SummarySection = null;

  freeTelephoneMediationSection = summarySection({
    title: t('PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION', {lng: getLng(lang)}), t(`COMMON.VARIATION_2.${canWeUse}`, {lng: getLng(lang)}), freeMediationHref, changeLabel(lang)));
  if (canWeUse === YesNoUpperCase.YES) {
    if (claim.applicant1.type === 'ORGANISATION' || claim.applicant1.type === 'COMPANY') {
      const contactNameHref = constructResponseUrlWithIdParams(claimId, CAN_WE_USE_COMPANY_URL);
      freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_CONTACT_NAME', {lng: getLng(lang)}), `${contactName}`, contactNameHref, changeLabel(lang)));
    }
    freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_CONTACT_NUMBER', {lng: getLng(lang)}), `${contactNumber}`, contactNumberHref, changeLabel(lang)));
  }
  return freeTelephoneMediationSection;
};
