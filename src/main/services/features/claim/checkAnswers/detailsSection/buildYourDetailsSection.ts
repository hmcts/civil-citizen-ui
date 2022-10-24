import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {CLAIM_DETAILS_URL, CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {PrimaryAddress} from '../../../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../../../common/models/correspondenceAddress';

const changeLabel = (lang: string): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: lang});

const addressToString = (address: PrimaryAddress | CorrespondenceAddress) => {
  return address?.AddressLine1 + '<br>' + address?.PostTown + '<br>' + address?.PostCode;
};

const getApplicantFullName = (claim: Claim): string => {
  if (claim.applicant1?.individualFirstName && claim.applicant1?.individualLastName) {
    return claim.applicant1.individualTitle + ' ' + claim.applicant1.individualFirstName + ' ' + claim.applicant1.individualLastName;
  }
  return claim.applicant1?.partyName;
};

export const buildYourDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourDetailsHref = constructResponseUrlWithIdParams(claimId, CLAIM_DETAILS_URL);
  const phoneNumberHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_PHONE_NUMBER_URL);
  const lng = getLng(lang);
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng}), getApplicantFullName(claim), yourDetailsHref, changeLabel(lng)),
    ],
  });
  if (claim.applicant1?.contactPerson) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_PERSON', {lng}), claim.applicant1.contactPerson, yourDetailsHref, changeLabel(lng)));
  }
  yourDetailsSection.summaryList.rows.push(...[summaryRow(t('PAGES.CHECK_YOUR_ANSWER.ADDRESS', {lng}), addressToString(claim.applicant1?.primaryAddress), yourDetailsHref, changeLabel(lng)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CORRESPONDENCE_ADDRESS', {lng}), claim.applicant1?.correspondenceAddress ? addressToString(claim.applicant1?.correspondenceAddress) : t('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS', {lng}), yourDetailsHref, changeLabel(lng))]);
  if (claim.applicant1?.dateOfBirth) {
    const yourDOBHref = CLAIMANT_DOB_URL.replace(':id', claimId);
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng}), formatDateToFullDate(claim.applicant1.dateOfBirth, lng), yourDOBHref, changeLabel(lng)));
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER', {lng}), claim.applicant1?.phoneNumber, phoneNumberHref, changeLabel(lng)));
  return yourDetailsSection;
};
