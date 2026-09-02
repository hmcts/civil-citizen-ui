import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {CITIZEN_DETAILS_URL, CITIZEN_PHONE_NUMBER_URL, DOB_URL} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {Address} from '../../../../../common/form/models/address';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

const addressToString = (address: Address) => {
  return address.addressLine1 + '<br>' + address.city + '<br>' + address.postCode;
};

export const buildYourDetailsSection = (claim: Claim, claimId: string, lang: string ): SummarySection => {
  const yourDetailsHref = constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL);
  const phoneNumberUrl = claim.respondent1?.partyPhone?.ccdPhoneExist ? CITIZEN_DETAILS_URL : CITIZEN_PHONE_NUMBER_URL;
  const phoneNumberLabel = claim.respondent1?.partyPhone?.ccdPhoneExist ? 'PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER_NOT_OPTIONAL' : 'PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER' ;
  const phoneNumberHref = constructResponseUrlWithIdParams(claimId, phoneNumberUrl);
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE', {lng: getLng(lang)}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng: getLng(lang)}), claim.getDefendantFullName(), yourDetailsHref, changeLabel(lang)),
    ],
  });
  if (claim.respondent1.partyDetails.contactPerson) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_PERSON', {lng: getLng(lang)}), claim.respondent1.partyDetails.contactPerson, yourDetailsHref, changeLabel(lang)));
  }
  yourDetailsSection.summaryList.rows.push(...[summaryRow(t('COMMON.ADDRESS', {lng: getLng(lang)}), addressToString(claim.respondent1.partyDetails.primaryAddress), yourDetailsHref, changeLabel(lang)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CORRESPONDENCE_ADDRESS', {lng: getLng(lang)}), claim.respondent1.partyDetails.correspondenceAddress ? addressToString(claim?.respondent1?.partyDetails?.correspondenceAddress) : t('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS', {lng: getLng(lang)}), yourDetailsHref, changeLabel(lang))]);
  if (claim.respondent1?.dateOfBirth?.date) {
    const yourDOBHref = DOB_URL.replace(':id', claimId);
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng: getLng(lang)}), formatDateToFullDate(claim.respondent1.dateOfBirth?.date, getLng(lang)), yourDOBHref, changeLabel(lang)));
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t(phoneNumberLabel, {lng: getLng(lang)}), claim.respondent1.partyPhone?.phone, phoneNumberHref, changeLabel(lang)));
  return yourDetailsSection;
};
