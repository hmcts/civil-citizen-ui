import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow, summaryRowHtml} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {PartyType} from 'models/partyType';
import {Address} from 'form/models/address';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {YesNo} from 'form/models/yesNo';
import {escapeHtml} from 'common/utils/escapeHtml';

const addressToHtml = (address: Address) => {
  return [address?.addressLine1, address?.city, address?.postCode].map(escapeHtml).join('<br>');
};

export const buildTheirDetailsSection = (claim: Claim, claimId: string, lang: string ): SummarySection => {
  const lng = getLng(lang);
  const yourDetailsSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.THEIR_DETAILS_TITLE_DEFENDANT', {lng}),
    summaryRows: [
      summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FULL_NAME', {lng}), claim.getDefendantFullName()),
    ],
  });
  if (claim.respondent1?.type === PartyType.SOLE_TRADER && claim.respondent1?.partyDetails.soleTraderTradingAs) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CITIZEN_DETAILS.BUSINESS_NAME', {lng}),
      claim.respondent1.partyDetails.soleTraderTradingAs));
  }
  yourDetailsSection.summaryList.rows.push(summaryRowHtml(t('COMMON.ADDRESS', {lng}),
    addressToHtml(claim.respondent1?.partyDetails.primaryAddress)));
  if (claim.claimantResponse?.ccjRequest?.defendantDOB?.option === YesNo.YES) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng}),
      formatDateToFullDate(claim.claimantResponse.ccjRequest.defendantDOB.dob.dateOfBirth)));
  } else if (!claim.isBusiness() && claim.respondent1?.dateOfBirth?.date) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DOB', {lng}),
      formatDateToFullDate(claim.respondent1?.dateOfBirth?.date)));
  }
  if (claim.respondent1?.emailAddress?.emailAddress) {
    yourDetailsSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.EMAIL', {lng}),
      claim.respondent1.emailAddress.emailAddress));
  }
  return yourDetailsSection;
};
