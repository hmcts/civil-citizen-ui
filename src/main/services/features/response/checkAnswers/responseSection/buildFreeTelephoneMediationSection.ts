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

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: getLng(lang)});

export const buildFreeTelephoneMediationSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const freeMediationHref = constructResponseUrlWithIdParams(claimId, CITIZEN_FREE_TELEPHONE_MEDIATION_URL);
  const contactNumberHref = constructResponseUrlWithIdParams(claimId, CAN_WE_USE_URL);
  const contactNumber = claim.mediation?.companyTelephoneNumber ? claim.mediation.companyTelephoneNumber.mediationPhoneNumber : claim.respondent1.telephoneNumber;
  const contactName = claim.mediation?.companyTelephoneNumber ? claim.mediation.companyTelephoneNumber.mediationContactPerson : claim.respondent1.contactPerson;

  const canWeUse = claim.mediation?.canWeUse?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  let freeTelephoneMediationSection: SummarySection = null;

  freeTelephoneMediationSection = summarySection({
    title: t('PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION', {lng: getLng(lang)}), t(`COMMON.${canWeUse}`, {lng: getLng(lang)}), freeMediationHref, changeLabel(lang)));
  if (canWeUse === YesNoUpperCase.YES) {
    if (claim.respondent1.type === 'ORGANISATION' || claim.respondent1.type === 'COMPANY') {
      const contactNameHref = constructResponseUrlWithIdParams(claimId, CAN_WE_USE_COMPANY_URL);
      freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_CONTACT_NAME', {lng: getLng(lang)}), `${contactName}`, contactNameHref, changeLabel(lang)));
    }
    freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_CONTACT_NUMBER', {lng: getLng(lang)}), `${contactNumber}`, contactNumberHref, changeLabel(lang)));
  }
  return freeTelephoneMediationSection;
};
