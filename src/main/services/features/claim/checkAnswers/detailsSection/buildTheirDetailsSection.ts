import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS_URL,
  CLAIM_DEFENDANT_EMAIL_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_PHONE_NUMBER_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
  DOB_URL,
  DELAYED_FLIGHT_URL, FLIGHT_DETAILS_URL,
} from '../../../../../routes/urls';
import {formatDateToFullDate} from '../../../../../common/utils/dateUtils';
import {PartyType} from '../../../../../common/models/partyType';
import {Address} from '../../../../../common/form/models/address';
import {YesNo, YesNoUpperCase} from 'form/models/yesNo';

const changeLabel = (lang: string): string => t('COMMON.BUTTONS.CHANGE', {lng: lang});

const addressToString = (address: Address) => {
  return address?.addressLine1 + '<br>' + address?.city + '<br>' + address?.postCode;
};

export const buildTheirDetailsSection = (claim: Claim, claimId: string, lang: string ): SummarySection => {
  let theirDetailsHref = CLAIM_DEFENDANT_COMPANY_DETAILS_URL;
  switch (claim.respondent1?.type) {
    case PartyType.INDIVIDUAL:
      theirDetailsHref = CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL;
      break;
    case PartyType.SOLE_TRADER:
      theirDetailsHref = CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL;
      break;
    case PartyType.ORGANISATION:
      theirDetailsHref = CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL;
      break;
  }
  const lng = getLng(lang);
  const title = t('PAGES.CHECK_YOUR_ANSWER.THEIR_DETAILS_TITLE_DEFENDANT', {lng});
  const yourDetailsSection = summarySection({
    title: title,
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng}), claim.getDefendantFullName(), theirDetailsHref, changeLabel(lng), title),
    ],
  });
  if (claim.respondent1?.type === PartyType.SOLE_TRADER && claim.respondent1?.partyDetails.soleTraderTradingAs) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CITIZEN_DETAILS.BUSINESS_NAME', {lng}), claim.respondent1.partyDetails.soleTraderTradingAs, theirDetailsHref, changeLabel(lng), title));
  }
  if (claim.respondent1?.partyDetails?.contactPerson) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_PERSON', {lng}), claim.respondent1.partyDetails.contactPerson, theirDetailsHref, changeLabel(lng), title));
  }
  yourDetailsSection.summaryList.rows.push(...[summaryRow(t('COMMON.ADDRESS', {lng}), addressToString(claim.respondent1?.partyDetails?.primaryAddress), theirDetailsHref, changeLabel(lng), title),
    summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CORRESPONDENCE_ADDRESS', {lng}), claim.respondent1?.partyDetails?.correspondenceAddress ? addressToString(claim.respondent1?.partyDetails.correspondenceAddress) : t('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS', {lng}), theirDetailsHref, changeLabel(lng), title)]);
  if (!claim.isBusiness() && claim.respondent1?.dateOfBirth?.date) {
    const yourDOBHref = DOB_URL.replace(':id', claimId);
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng}), formatDateToFullDate(claim.respondent1.dateOfBirth.date, lng), yourDOBHref, changeLabel(lng), title));
  }
  if (claim.respondent1?.emailAddress?.emailAddress) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMAIL', {lng}), claim.respondent1.emailAddress.emailAddress, CLAIM_DEFENDANT_EMAIL_URL, changeLabel(lng), title));
  }
  if (claim.isCompany()) {
    const flightDelayed = claim.delayedFlight?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.ARE_YOU_CLAIMING_DELAYED_FLIGHT', {lng}), t(`COMMON.VARIATION.${flightDelayed}`, {lng}), DELAYED_FLIGHT_URL, changeLabel(lng), title));
    if (claim.delayedFlight?.option === YesNo.YES) {
      yourDetailsSection.summaryList.rows.push(
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.AIRLINE', {lng}), claim.flightDetails?.airline, FLIGHT_DETAILS_URL, changeLabel(lng), title),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FLIGHT_NUMBER', {lng}), claim.flightDetails?.flightNumber),
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.SCHEDULED_DATE_OF_FLIGHT', {lng}), formatDateToFullDate(claim.flightDetails?.flightDate, lng)));
    }
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER', {lng}), claim.respondent1?.partyPhone?.phone, CLAIM_DEFENDANT_PHONE_NUMBER_URL, changeLabel(lng), title));
  return yourDetailsSection;
};
