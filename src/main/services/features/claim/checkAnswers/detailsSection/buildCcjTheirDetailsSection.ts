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
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
} from '../../../../../routes/urls';
import {PartyType} from '../../../../../common/models/partyType';
import {Address} from '../../../../../common/form/models/address';

const addressToString = (address: Address) => {
  return address?.addressLine1 + '<br>' + address?.city + '<br>' + address?.postCode;
};

const getDefendantFullName = (claim: Claim): string => {
  if (claim.respondent1?.type === PartyType.ORGANISATION || claim.respondent1?.type === PartyType.COMPANY) {
    return claim.respondent1?.partyDetails.partyName;
  }
  return `${claim.respondent1?.partyDetails.individualTitle} ${claim.respondent1?.partyDetails.individualFirstName} ${claim.respondent1?.partyDetails.individualLastName}`;
};

export const buildTheirDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
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
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.THEIR_DETAILS_TITLE_DEFENDANT', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng}), getDefendantFullName(claim), theirDetailsHref),
    ],
  });
  if (claim.respondent1?.type === PartyType.SOLE_TRADER && claim.respondent1?.partyDetails.soleTraderTradingAs) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CITIZEN_DETAILS.BUSINESS_NAME', {lng}), claim.respondent1.partyDetails.soleTraderTradingAs, theirDetailsHref));
  }
  yourDetailsSection.summaryList.rows.push(summaryRow(t('COMMON.ADDRESS', {lng}), addressToString(claim.respondent1?.partyDetails.primaryAddress), theirDetailsHref));
  if (claim.respondent1?.emailAddress?.emailAddress) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMAIL', {lng}), claim.respondent1.emailAddress.emailAddress, CLAIM_DEFENDANT_EMAIL_URL));
  }
  return yourDetailsSection;
};
