import { Claim } from 'common/models/claim';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {YesNo, YesNoUpperCase} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {CAN_WE_USE_COMPANY_URL, CAN_WE_USE_URL, CITIZEN_FREE_TELEPHONE_MEDIATION_URL} from 'routes/urls';
import {getLng} from 'common/utils/languageToggleUtils';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

const getContactNumber = (claim: Claim) => {
  if (claim.claimantResponse.mediation?.companyTelephoneNumber) {
    return getMediationContactNumber(claim.claimantResponse.mediation.companyTelephoneNumber);
  } else if (claim.claimantResponse.mediation?.canWeUse?.mediationPhoneNumber) {
    return claim.claimantResponse.mediation.canWeUse.mediationPhoneNumber;
  } else {
    return claim.applicant1?.partyPhone?.phone;
  }
};

const getMediationContactNumber = (companyTelephoneNumber : CompanyTelephoneNumber) => {
  return companyTelephoneNumber.option === YesNo.YES ?
    companyTelephoneNumber.mediationPhoneNumberConfirmation :
    companyTelephoneNumber.mediationPhoneNumber;
};




export const buildFreeTelephoneMediationSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const freeMediationHref = constructResponseUrlWithIdParams(claimId, CITIZEN_FREE_TELEPHONE_MEDIATION_URL);
  const contactNumberHref = constructResponseUrlWithIdParams(claimId, CAN_WE_USE_URL);
  const contactNumber = getContactNumber(claim);
  const contactName = claim.contactNameFromClaimantResponse;
  const canWeUse = claim.canWeUseFromClaimantResponse;

  let freeTelephoneMediationSection: SummarySection = null;

  freeTelephoneMediationSection = summarySection({
    title: t('PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION', {lng: getLng(lang)}), t(`COMMON.${canWeUse}`, {lng: getLng(lang)}), freeMediationHref, changeLabel(lang)));
  if (canWeUse === YesNoUpperCase.YES) {
    if (claim.applicant1.type === 'ORGANISATION' || claim.applicant1.type === 'COMPANY') {
      const contactNameHref = constructResponseUrlWithIdParams(claimId, CAN_WE_USE_COMPANY_URL);
      freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_CONTACT_NAME', {lng: getLng(lang)}), `${contactName}`, contactNameHref, changeLabel(lang)));
    }
    freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_CONTACT_NUMBER', {lng: getLng(lang)}), `${contactNumber}`, contactNumberHref, changeLabel(lang)));
  }
  return freeTelephoneMediationSection;
};
