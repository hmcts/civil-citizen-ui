import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CAN_WE_USE_COMPANY_URL,
  CAN_WE_USE_URL,
  CITIZEN_FREE_TELEPHONE_MEDIATION_URL,
} from '../../../../../routes/urls';
import {YesNo, YesNoUpperCase} from '../../../../../common/form/models/yesNo';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

const getContactNumber = (claim: Claim) => {
  if (claim.mediation?.companyTelephoneNumber) {
    return getMediationContactNumber(claim.mediation.companyTelephoneNumber);
  } else if (claim.mediation?.canWeUse?.mediationPhoneNumber) {
    return claim.mediation.canWeUse.mediationPhoneNumber;
  } else {
    return claim.respondent1?.partyPhone?.phone;
  }
};

const getMediationContactNumber = (companyTelephoneNumber : CompanyTelephoneNumber) => {
  return companyTelephoneNumber.option === YesNo.YES ?
    companyTelephoneNumber.mediationPhoneNumberConfirmation :
    companyTelephoneNumber.mediationPhoneNumber;
};

const getContactName = (claim: Claim) => {
  return claim.mediation?.companyTelephoneNumber?.option === YesNo.NO ?
    claim.mediation.companyTelephoneNumber.mediationContactPerson :
    claim.respondent1.partyDetails?.contactPerson;
};

const getCanWeUse = (claim: Claim) => {
  if (claim.mediation?.canWeUse?.option) {
    return YesNoUpperCase.YES;
  } else {
    if (claim.mediation?.mediationDisagreement?.option) {
      return YesNoUpperCase.NO;
    } else if (claim.mediation?.companyTelephoneNumber) {
      return YesNoUpperCase.YES;
    }
  }
};

export const buildFreeTelephoneMediationSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const freeMediationHref = constructResponseUrlWithIdParams(claimId, CITIZEN_FREE_TELEPHONE_MEDIATION_URL);
  const contactNumberHref = constructResponseUrlWithIdParams(claimId, CAN_WE_USE_URL);
  const contactNumber = getContactNumber(claim);
  const contactName = getContactName(claim);
  const canWeUse = getCanWeUse(claim);

  let freeTelephoneMediationSection: SummarySection = null;

  if (canWeUse) {
    freeTelephoneMediationSection = summarySection({
      title: t('PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE', {lng: getLng(lang)}),
      summaryRows: [],
    });

    freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION', {lng: getLng(lang)}), t(`COMMON.VARIATION_2.${canWeUse}`, {lng: getLng(lang)}), freeMediationHref, changeLabel(lang)));
  }
  if (canWeUse === YesNoUpperCase.YES) {
    if (claim.respondent1.type === 'ORGANISATION' || claim.respondent1.type === 'COMPANY') {
      const contactNameHref = constructResponseUrlWithIdParams(claimId, CAN_WE_USE_COMPANY_URL);
      freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_CONTACT_NAME', {lng: getLng(lang)}), `${contactName}`, contactNameHref, changeLabel(lang)));
    }
    freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_CONTACT_NUMBER', {lng: getLng(lang)}), `${contactNumber}`, contactNumberHref, changeLabel(lang)));
  }
  return freeTelephoneMediationSection;
};

export const buildMediationSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const mediationSection = summarySection({
    title: t('PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_CONTACT_PERSON_CONFIRMATION.PAGE_TEXT_DEFENDANT', {lng: getLng(lang), defendantContactPerson: claim.respondent1.partyDetails.contactPerson}),
    t(`COMMON.VARIATION_2.${claim.mediation.isMediationContactNameCorrect.option.toUpperCase()}`, {lng: getLng(lang)}),
    'freeMediationHref', changeLabel(lang)));
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_PHONE_CONFIRMATION.PAGE_TEXT', {lng: getLng(lang), defendantPhone: claim.respondent1.partyPhone.phone}),
    t(`COMMON.VARIATION_2.${claim.mediation.isMediationPhoneCorrect.option.toUpperCase()}`, {lng: getLng(lang)}),
    'freeMediationHref', changeLabel(lang)));
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_EMAIL_CONFIRMATION.PAGE_TEXT', {lng: getLng(lang), defendantEmail: claim.respondent1.emailAddress.emailAddress}),
    t(`COMMON.VARIATION_2.${claim.mediation.isMediationEmailCorrect.option.toUpperCase()}`, {lng: getLng(lang)}),
    'freeMediationHref', changeLabel(lang)));
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.UNAVAILABILITY_NEXT_THREE_MONTHS_MEDIATION_CONFIRMATION.PAGE_TEXT', {lng: getLng(lang)}),
    t(`COMMON.VARIATION_2.${claim.mediation.hasUnavailabilityNextThreeMonths.option.toUpperCase()}`, {lng: getLng(lang)}),
    'freeMediationHref', changeLabel(lang)));
  return mediationSection;
};

