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
} from '../../../../../../main/routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {PartyType} from '../../../../../common/models/partyType';
import {Address} from '../../../../../common/form/models/address';

const changeLabel = (lang: string): string => t('COMMON.BUTTONS.CHANGE', {lng: lang});

const addressToString = (address: Address) => {
  return address?.addressLine1 + '<br>' + address?.city + '<br>' + address?.postCode;
};

export const buildYourDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {

  let yourDetailsHref = CLAIMANT_COMPANY_DETAILS_URL;
  switch (claim.applicant1?.type) {
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
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng}), claim.getClaimantFullName(), yourDetailsHref, changeLabel(lng)),
    ],
  });

  if (claim.applicant1?.type === PartyType.SOLE_TRADER && claim.applicant1?.partyDetails.soleTraderTradingAs) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CITIZEN_DETAILS.BUSINESS_NAME', {lng}), claim.applicant1.partyDetails.soleTraderTradingAs, yourDetailsHref, changeLabel(lng)));
  }
  if (claim.applicant1?.partyDetails.contactPerson) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_PERSON', {lng}), claim.applicant1.partyDetails.contactPerson, yourDetailsHref, changeLabel(lng)));
  }
  yourDetailsSection.summaryList.rows.push(...[summaryRow(t('COMMON.ADDRESS', {lng}), addressToString(claim.applicant1?.partyDetails.primaryAddress), yourDetailsHref, changeLabel(lng)),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CORRESPONDENCE_ADDRESS', {lng}), claim.applicant1?.partyDetails.correspondenceAddress ? addressToString(claim.applicant1?.partyDetails.correspondenceAddress) : t('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS', {lng}), yourDetailsHref, changeLabel(lng))]);
  if (!claim.isClaimantBusiness() && claim.applicant1?.dateOfBirth?.date) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng}), formatDateToFullDate(claim.applicant1.dateOfBirth.date, lng), CLAIMANT_DOB_URL, changeLabel(lng)));
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER', {lng}), claim.applicant1?.partyPhone?.phone, CLAIMANT_PHONE_NUMBER_URL, changeLabel(lng)));
  return yourDetailsSection;
};
