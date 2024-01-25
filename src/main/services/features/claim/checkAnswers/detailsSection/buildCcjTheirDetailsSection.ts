import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {PartyType} from 'models/partyType';
import {Address} from 'form/models/address';

const addressToString = (address: Address) => {
  return address?.addressLine1 + '<br>' + address?.city + '<br>' + address?.postCode;
};

const getDefendantFullName = (claim: Claim): string => {
  if (claim.respondent1?.type === PartyType.ORGANISATION || claim.respondent1?.type === PartyType.COMPANY) {
    return claim.respondent1?.partyDetails.partyName;
  }
  return `${claim.respondent1?.partyDetails.title} ${claim.respondent1?.partyDetails.firstName} ${claim.respondent1?.partyDetails.lastName}`;
};

export const buildTheirDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const lng = getLng(lang);
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.THEIR_DETAILS_TITLE_DEFENDANT', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng}), getDefendantFullName(claim)),
    ],
  });
  if (claim.respondent1?.type === PartyType.SOLE_TRADER && claim.respondent1?.partyDetails.soleTraderTradingAs) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CITIZEN_DETAILS.BUSINESS_NAME', {lng}),
      claim.respondent1.partyDetails.soleTraderTradingAs));
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('COMMON.ADDRESS', {lng}),
    addressToString(claim.respondent1?.partyDetails.primaryAddress)));
  if (claim.respondent1?.emailAddress?.emailAddress) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMAIL', {lng}),
      claim.respondent1.emailAddress.emailAddress));
  }
  return yourDetailsSection;
};
