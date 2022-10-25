import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_DOB_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_ORGANISATION_DETAILS_URL,
  CLAIMANT_PHONE_NUMBER_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {PrimaryAddress} from '../../../../../common/models/primaryAddress';
import {CorrespondenceAddress} from '../../../../../common/models/correspondenceAddress';
import {PartyType} from '../../../../../common/models/partyType';

const changeLabel = (lang: string): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: lang});

const addressToString = (address: PrimaryAddress | CorrespondenceAddress) => {
  return address?.AddressLine1 + '<br>' + address?.PostTown + '<br>' + address?.PostCode;
};

const getApplicantFullName = (claim: Claim): string => {
  if (claim.applicant1?.type === PartyType.ORGANISATION || claim.applicant1?.type === PartyType.COMPANY) {
    return claim.applicant1?.partyName;
  }
  return `${claim.applicant1?.individualTitle} ${claim.applicant1?.individualFirstName} ${claim.applicant1?.individualLastName}`;
};

export const buildYourDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {

  let yourDetailsHref = CLAIMANT_COMPANY_DETAILS_URL;
  switch (claim.respondent1.type) {
    case PartyType.INDIVIDUAL:
      yourDetailsHref = CLAIMANT_INDIVIDUAL_DETAILS_URL;
      break;
    case PartyType.SOLE_TRADER:
      yourDetailsHref = CLAIMANT_SOLE_TRADER_DETAILS_URL;
      break;
    case PartyType.ORGANISATION:
      yourDetailsHref = CLAIMANT_ORGANISATION_DETAILS_URL;
      break;
  }
  const lng = getLng(lang);
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE_CLAIMANT', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng}), getApplicantFullName(claim), yourDetailsHref, changeLabel(lng)),
    ],
  });

  if (claim.applicant1?.type === PartyType.SOLE_TRADER && claim.applicant1?.soleTraderTradingAs) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CITIZEN_DETAILS.BUSINESS_NAME', {lng}), claim.applicant1.soleTraderTradingAs, yourDetailsHref, changeLabel(lng)));
  }
  if (claim.applicant1?.contactPerson) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_PERSON', {lng}), claim.applicant1.contactPerson, yourDetailsHref, changeLabel(lng)));
  }
  yourDetailsSection.summaryList.rows.push(...[summaryRow(t('PAGES.CHECK_YOUR_ANSWER.ADDRESS', {lng}), addressToString(claim.applicant1?.primaryAddress), yourDetailsHref, changeLabel(lng)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CORRESPONDENCE_ADDRESS', {lng}), claim.applicant1?.correspondenceAddress ? addressToString(claim.applicant1?.correspondenceAddress) : t('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS', {lng}), yourDetailsHref, changeLabel(lng))]);
  if (claim.applicant1?.type === PartyType.INDIVIDUAL || claim.applicant1?.type === PartyType.SOLE_TRADER) {
    if (claim.applicant1?.dateOfBirth) {
      yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng}), formatDateToFullDate(claim.applicant1.dateOfBirth, lng), CLAIMANT_DOB_URL, changeLabel(lng)));
    }
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER', {lng}), claim.applicant1?.partyPhone, CLAIMANT_PHONE_NUMBER_URL, changeLabel(lng)));
  return yourDetailsSection;
};
