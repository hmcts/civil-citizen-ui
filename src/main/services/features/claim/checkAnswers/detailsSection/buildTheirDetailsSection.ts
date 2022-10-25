import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CLAIM_DEFENDANT_EMAIL_URL,
  DOB_URL,
} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {PrimaryAddress} from '../../../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../../../common/models/correspondenceAddress';
import {PartyType} from '../../../../../common/models/partyType';

const changeLabel = (lang: string): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: lang});

const addressToString = (address: PrimaryAddress | CorrespondenceAddress) => {
  return address?.AddressLine1 + '<br>' + address?.PostTown + '<br>' + address?.PostCode;
};

const getDefendantFullName = (claim: Claim): string => {
  if (claim.respondent1?.type === PartyType.ORGANISATION || claim.respondent1?.type === PartyType.COMPANY) {
    return claim.respondent1?.partyName;
  }
  return `${claim.respondent1?.individualTitle} ${claim.respondent1?.individualFirstName} ${claim.respondent1?.individualLastName}`;
};

export const buildTheirDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const theirDetailsHref = constructResponseUrlWithIdParams(claimId, CITIZEN_DETAILS_URL);
  const phoneNumberHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL);
  const lng = getLng(lang);
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.THEIR_DETAILS_TITLE', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng}), getDefendantFullName(claim), theirDetailsHref, changeLabel(lng)),
    ],
  });
  if (claim.respondent1?.contactPerson) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_PERSON', {lng}), claim.respondent1.contactPerson, theirDetailsHref, changeLabel(lng)));
  }
  yourDetailsSection.summaryList.rows.push(...[summaryRow(t('PAGES.CHECK_YOUR_ANSWER.ADDRESS', {lng}), addressToString(claim.respondent1?.primaryAddress), theirDetailsHref, changeLabel(lng)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CORRESPONDENCE_ADDRESS', {lng}), claim.respondent1?.correspondenceAddress ? addressToString(claim.respondent1?.correspondenceAddress) : t('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS', {lng}), theirDetailsHref, changeLabel(lng))]);
  if (claim.respondent1?.dateOfBirth) {
    const yourDOBHref = DOB_URL.replace(':id', claimId);
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng}), formatDateToFullDate(claim.respondent1.dateOfBirth, lng), yourDOBHref, changeLabel(lng)));
  }
  if (claim.respondent1?.emailAddress) {
    const yourEmailHref = CLAIM_DEFENDANT_EMAIL_URL.replace(':id', claimId);
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMAIL', {lng}), claim.respondent1?.emailAddress, yourEmailHref, changeLabel(lng)));
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER', {lng}), claim.respondent1?.partyPhone, phoneNumberHref, changeLabel(lng)));
  return yourDetailsSection;
};
